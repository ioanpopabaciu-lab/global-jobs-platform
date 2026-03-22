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
        # from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        
        # api_key = os.environ.get("EMERGENT_LLM_KEY")
        # if not api_key:
        #     logger.error("EMERGENT_LLM_KEY not configured")
        #     return {"success": False, "error": "Serviciul OCR nu este configurat"}
        
        return {"success": False, "error": "Funcționalitatea OCR a fost dezactivată temporar."}
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
        # from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        
        # api_key = os.environ.get("EMERGENT_LLM_KEY")
        # if not api_key:
        #     return {"success": False, "error": "Serviciul OCR nu este configurat"}
        
        return {"success": False, "error": "Funcționalitatea OCR a fost dezactivată temporar."}
            
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
