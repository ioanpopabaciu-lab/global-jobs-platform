"""
Document OCR and Expiry Tracking Service
Uses Claude AI for extracting data from Romanian ID cards and other documents
"""
import base64
import logging
import os
import re
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any, List
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Document validity periods (in days)
DOCUMENT_VALIDITY = {
    "cazier_judiciar": 30,
    "certificat_constatator": 30,
    "certificat_fiscal": 30,
}

# Alert thresholds (days before expiry)
ALERT_THRESHOLDS = [30, 14, 7, 5, 1, 0]


async def extract_id_card_data(image_base64: str, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """
    Extract data from Romanian ID card using Claude AI
    
    Args:
        image_base64: Base64 encoded image of the ID card
        mime_type: MIME type of the image
    
    Returns:
        Dictionary with extracted data or error
    """
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            logger.error("EMERGENT_LLM_KEY not configured")
            return {"success": False, "error": "Serviciul OCR nu este configurat"}
        
        # Initialize Claude chat
        chat = LlmChat(
            api_key=api_key,
            session_id=f"ocr_{datetime.now().timestamp()}",
            system_message="""You are an OCR specialist for Romanian identity documents (Carte de Identitate).
            Extract all visible information from the ID card image and return it in a structured JSON format.
            Be precise with dates (format: YYYY-MM-DD), names, and numbers.
            If a field is not visible or unclear, set it to null.
            Always respond ONLY with valid JSON, no other text."""
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        # Create image content
        image_content = ImageContent(image_base64=image_base64)
        
        # Create the extraction prompt
        extraction_prompt = """Analyze this Romanian ID card (Carte de Identitate) and extract the following information.
        Return ONLY a JSON object with these exact fields:

        {
            "nume": "family name / surname",
            "prenume": "first name(s)",
            "cnp": "personal identification number (13 digits)",
            "data_nasterii": "date of birth in YYYY-MM-DD format",
            "loc_nastere": "place of birth",
            "adresa": "full address from the ID",
            "serie_ci": "ID series (2 letters)",
            "numar_ci": "ID number (6 digits)",
            "data_eliberare": "issue date in YYYY-MM-DD format",
            "data_expirare": "expiry date in YYYY-MM-DD format",
            "emitent": "issuing authority (e.g., SPCLEP Sector 1)",
            "cetatenie": "citizenship (usually ROMÂNĂ)",
            "sex": "M or F",
            "inaltime": "height in cm if visible",
            "confidence": "HIGH, MEDIUM, or LOW based on image quality"
        }

        If any field is not visible or unclear, set it to null.
        Respond ONLY with the JSON object, no explanations."""
        
        # Send message with image
        user_message = UserMessage(
            text=extraction_prompt,
            file_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Parse the response
        try:
            # Clean response - remove any markdown code blocks
            clean_response = response.strip()
            if clean_response.startswith("```"):
                clean_response = re.sub(r'^```\w*\n?', '', clean_response)
                clean_response = re.sub(r'\n?```$', '', clean_response)
            
            import json
            extracted_data = json.loads(clean_response)
            
            # Validate required fields
            required_fields = ["nume", "prenume", "cnp", "serie_ci", "numar_ci"]
            missing_fields = [f for f in required_fields if not extracted_data.get(f)]
            
            if missing_fields:
                logger.warning(f"OCR extraction missing fields: {missing_fields}")
            
            return {
                "success": True,
                "data": extracted_data,
                "missing_fields": missing_fields
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse OCR response: {e}")
            logger.error(f"Response was: {response[:500]}")
            return {
                "success": False,
                "error": "Nu am putut procesa răspunsul OCR",
                "raw_response": response[:500]
            }
            
    except ImportError:
        logger.error("emergentintegrations library not installed")
        return {"success": False, "error": "Librăria OCR nu este instalată"}
    except Exception as e:
        logger.error(f"OCR extraction error: {str(e)}")
        return {"success": False, "error": f"Eroare la extragerea datelor: {str(e)}"}


async def extract_document_expiry(
    image_base64: str, 
    document_type: str,
    mime_type: str = "image/jpeg"
) -> Dict[str, Any]:
    """
    Extract expiry date from various documents using Claude AI
    
    Args:
        image_base64: Base64 encoded image
        document_type: Type of document (cazier_judiciar, certificat_constatator, etc.)
        mime_type: MIME type of the image
    
    Returns:
        Dictionary with extracted dates
    """
    try:
        from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        
        api_key = os.environ.get("EMERGENT_LLM_KEY")
        if not api_key:
            return {"success": False, "error": "Serviciul OCR nu este configurat"}
        
        chat = LlmChat(
            api_key=api_key,
            session_id=f"doc_ocr_{datetime.now().timestamp()}",
            system_message="""You are a document analyzer for Romanian official documents.
            Extract dates and key information from documents.
            Be precise with dates (format: YYYY-MM-DD).
            Always respond ONLY with valid JSON."""
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        image_content = ImageContent(image_base64=image_base64)
        
        prompts = {
            "cazier_judiciar": """Analyze this Romanian criminal record certificate (Cazier Judiciar).
            Extract and return ONLY this JSON:
            {
                "data_eliberare": "issue date in YYYY-MM-DD format",
                "numar_document": "document number if visible",
                "institutia_emitenta": "issuing institution",
                "rezultat": "content summary - has criminal record or not"
            }""",
            
            "certificat_constatator": """Analyze this Romanian certificate (Certificat Constatator).
            Extract and return ONLY this JSON:
            {
                "data_eliberare": "issue date in YYYY-MM-DD format",
                "numar_document": "document number",
                "institutia_emitenta": "issuing institution (ONRC/ORC)",
                "societate": "company name mentioned"
            }""",
            
            "default": """Analyze this document and extract any dates visible.
            Return ONLY this JSON:
            {
                "data_eliberare": "issue date if visible (YYYY-MM-DD)",
                "data_expirare": "expiry date if visible (YYYY-MM-DD)",
                "numar_document": "document number if visible",
                "tip_document": "type of document"
            }"""
        }
        
        prompt = prompts.get(document_type, prompts["default"])
        
        user_message = UserMessage(
            text=prompt,
            image_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        try:
            clean_response = response.strip()
            if clean_response.startswith("```"):
                clean_response = re.sub(r'^```\w*\n?', '', clean_response)
                clean_response = re.sub(r'\n?```$', '', clean_response)
            
            import json
            extracted_data = json.loads(clean_response)
            
            # Calculate expiry date for documents with fixed validity
            if document_type in DOCUMENT_VALIDITY and extracted_data.get("data_eliberare"):
                try:
                    issue_date = datetime.strptime(extracted_data["data_eliberare"], "%Y-%m-%d")
                    validity_days = DOCUMENT_VALIDITY[document_type]
                    expiry_date = issue_date + timedelta(days=validity_days)
                    extracted_data["data_expirare"] = expiry_date.strftime("%Y-%m-%d")
                    extracted_data["valabilitate_zile"] = validity_days
                except ValueError:
                    pass
            
            return {
                "success": True,
                "data": extracted_data
            }
            
        except json.JSONDecodeError:
            return {
                "success": False,
                "error": "Nu am putut extrage datele din document"
            }
            
    except Exception as e:
        logger.error(f"Document OCR error: {str(e)}")
        return {"success": False, "error": str(e)}


def calculate_expiry_status(expiry_date_str: str) -> Dict[str, Any]:
    """
    Calculate the expiry status and days remaining for a document
    
    Args:
        expiry_date_str: Expiry date in YYYY-MM-DD format
    
    Returns:
        Dictionary with status info
    """
    try:
        expiry_date = datetime.strptime(expiry_date_str, "%Y-%m-%d").date()
        today = datetime.now(timezone.utc).date()
        days_remaining = (expiry_date - today).days
        
        if days_remaining < 0:
            status = "expired"
            color = "black"
            icon = "⛔"
            message = f"Expirat de {abs(days_remaining)} zile"
        elif days_remaining == 0:
            status = "expires_today"
            color = "black"
            icon = "⛔"
            message = "Expiră ASTĂZI"
        elif days_remaining <= 7:
            status = "critical"
            color = "red"
            icon = "🔴"
            message = f"Expiră în {days_remaining} zile"
        elif days_remaining <= 14:
            status = "urgent"
            color = "orange"
            icon = "🔴"
            message = f"Expiră în {days_remaining} zile"
        elif days_remaining <= 30:
            status = "warning"
            color = "yellow"
            icon = "🟡"
            message = f"Expiră în {days_remaining} zile"
        else:
            status = "valid"
            color = "green"
            icon = "🟢"
            message = f"Valabil încă {days_remaining} zile"
        
        return {
            "expiry_date": expiry_date_str,
            "days_remaining": days_remaining,
            "status": status,
            "color": color,
            "icon": icon,
            "message": message,
            "needs_alert": days_remaining in ALERT_THRESHOLDS or days_remaining < 0
        }
        
    except ValueError:
        return {
            "expiry_date": expiry_date_str,
            "days_remaining": None,
            "status": "unknown",
            "color": "gray",
            "icon": "❓",
            "message": "Data expirării necunoscută"
        }


def get_documents_expiring_soon(documents: List[Dict], threshold_days: int = 30) -> List[Dict]:
    """
    Filter documents that are expiring within the threshold
    
    Args:
        documents: List of document dictionaries with expiry_date field
        threshold_days: Number of days threshold
    
    Returns:
        List of expiring documents with status info
    """
    expiring = []
    
    for doc in documents:
        expiry_date = doc.get("expiry_date") or doc.get("data_expirare")
        if not expiry_date:
            continue
        
        status = calculate_expiry_status(expiry_date)
        if status["days_remaining"] is not None and status["days_remaining"] <= threshold_days:
            doc_info = {
                **doc,
                **status
            }
            expiring.append(doc_info)
    
    # Sort by days remaining (most urgent first)
    expiring.sort(key=lambda x: x.get("days_remaining", 999))
    
    return expiring


# Email templates for document expiry alerts
def get_expiry_alert_email(
    days_remaining: int,
    document_type: str,
    company_name: str,
    admin_name: str,
    expiry_date: str,
    contact_phone: str = None,
    contact_email: str = None
) -> Dict[str, str]:
    """
    Generate email content for document expiry alerts
    
    Returns:
        Dictionary with 'subject' and 'body' for employer email,
        and 'admin_subject' and 'admin_body' for admin email
    """
    
    doc_type_labels = {
        "ci_administrator": "Cartea de Identitate Administrator",
        "cazier_judiciar": "Cazierul Judiciar al Firmei",
        "certificat_constatator": "Certificatul Constatator",
        "certificat_fiscal": "Certificatul Fiscal",
    }
    doc_label = doc_type_labels.get(document_type, document_type)
    
    if days_remaining <= 0:
        urgency = "🚨"
        subject = f"🚨 EXPIRAT: {doc_label} — Cont suspendat"
        admin_subject = f"🚨 URGENT: {company_name} — Document expirat"
        urgency_text = "DOCUMENTUL A EXPIRAT"
        action_text = "Contul dvs. a fost suspendat automat."
    elif days_remaining == 1:
        urgency = "🚨"
        subject = f"🚨 MÂINE expiră: {doc_label}"
        admin_subject = f"🚨 MÂINE: {company_name} — 1 zi până la expirare"
        urgency_text = "MÂINE EXPIRĂ DOCUMENTUL"
        action_text = "Documentul expiră MÂINE. Acționați imediat."
    elif days_remaining <= 5:
        urgency = "🔴"
        subject = f"🔴 URGENT: Mai sunt doar {days_remaining} zile! — {doc_label}"
        admin_subject = f"🔴 ACȚIUNE URGENTĂ: {company_name} — {days_remaining} zile până la expirare"
        urgency_text = f"MAI SUNT DOAR {days_remaining} ZILE"
        action_text = f"⚠️ După expirare contul va fi suspendat automat."
    elif days_remaining <= 7:
        urgency = "🔴"
        subject = f"🔴 URGENT: Document expiră în {days_remaining} zile — {doc_label}"
        admin_subject = f"🔴 URGENT: {company_name} — {days_remaining} zile"
        urgency_text = f"EXPIRĂ ÎN {days_remaining} ZILE"
        action_text = "Vă rugăm să reînnoiți documentul urgent."
    elif days_remaining <= 14:
        urgency = "⚠️"
        subject = f"⚠️ Document expiră în {days_remaining} zile — {doc_label}"
        admin_subject = f"⚠️ ATENȚIE: {company_name} — {days_remaining} zile"
        urgency_text = f"EXPIRĂ ÎN {days_remaining} ZILE"
        action_text = "Vă rugăm să pregătiți reînnoirea."
    else:
        urgency = "⚠️"
        subject = f"⚠️ Document care expiră în {days_remaining} de zile — {doc_label}"
        admin_subject = f"⚠️ ADMIN: Document angajator expiră în {days_remaining} zile"
        urgency_text = f"EXPIRĂ ÎN {days_remaining} ZILE"
        action_text = "Vă rugăm să pregătiți reînnoirea din timp."
    
    # Employer email body
    body = f"""
Stimate {admin_name},

{urgency_text}

Documentul {doc_label} va expira pe data de {expiry_date}.

{action_text}

Acțiuni necesare:
1. Reînnoiți documentul urgent
2. Încărcați documentul nou în platformă
3. Agenția validează în maxim 24h

📞 Sunați acum: +40732403464
💬 WhatsApp: +40732403464
📧 Email: office@gjc.ro

---
Acest email a fost trimis automat de platforma Global Jobs Consulting.
Pentru dezabonare, accesați setările contului.
"""
    
    # Admin email body
    admin_body = f"""
{urgency} {urgency_text}

Companie: {company_name}
Document: {doc_label}
Expiră: {expiry_date} (în {days_remaining} zile)

Contact angajator:
- Telefon: {contact_phone or 'N/A'}
- Email: {contact_email or 'N/A'}

{"ACȚIUNE: Sunați angajatorul AZI." if days_remaining <= 5 else "Monitorizați situația."}
"""
    
    return {
        "subject": subject,
        "body": body,
        "admin_subject": admin_subject,
        "admin_body": admin_body
    }
