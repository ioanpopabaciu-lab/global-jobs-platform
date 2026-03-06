"""
Candidate Document OCR Service
Uses Claude AI for extracting data from passports and CVs
"""
import base64
import logging
import os
import re
import json
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)


async def extract_passport_data(image_base64: str, mime_type: str = "image/jpeg") -> Dict[str, Any]:
    """
    Extract data from passport image using Claude AI
    
    Args:
        image_base64: Base64 encoded image of the passport
        mime_type: MIME type of the image
    
    Returns:
        Dictionary with extracted data
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
            session_id=f"passport_ocr_{datetime.now().timestamp()}",
            system_message="""You are an expert OCR system specialized in extracting data from international passports.
            Extract all visible information accurately and return it in a structured JSON format.
            Pay attention to the MRZ (Machine Readable Zone) at the bottom of the passport.
            Be precise with dates (format: DD.MM.YYYY for display, YYYY-MM-DD for storage), names, and numbers.
            If a field is not visible or unclear, set it to null.
            Always respond ONLY with valid JSON, no other text."""
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        # Create image content
        image_content = ImageContent(image_base64=image_base64)
        
        # Create the extraction prompt
        extraction_prompt = """Analyze this passport image and extract the following information.
        Return ONLY a JSON object with these exact fields:

        {
            "full_name": "complete name as shown on passport",
            "first_name": "first name / given names",
            "last_name": "surname / family name",
            "date_of_birth": "date of birth in YYYY-MM-DD format",
            "date_of_birth_display": "date of birth in DD.MM.YYYY format",
            "citizenship": "nationality/citizenship country name",
            "nationality": "nationality code (3 letters)",
            "passport_number": "passport document number",
            "issue_date": "passport issue date in YYYY-MM-DD format",
            "issue_date_display": "passport issue date in DD.MM.YYYY format",
            "expiry_date": "passport expiry date in YYYY-MM-DD format",
            "expiry_date_display": "passport expiry date in DD.MM.YYYY format",
            "sex": "M or F",
            "issuing_country": "country that issued the passport",
            "place_of_birth": "place of birth if visible",
            "mrz_line1": "first line of MRZ if visible",
            "mrz_line2": "second line of MRZ if visible",
            "confidence": "HIGH, MEDIUM, or LOW based on image quality and data clarity"
        }

        IMPORTANT:
        - For dates, always provide both formats (storage: YYYY-MM-DD and display: DD.MM.YYYY)
        - If any field is not visible or unclear, set it to null
        - Extract the full name exactly as written on the passport
        - Respond ONLY with the JSON object, no explanations"""
        
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
            
            extracted_data = json.loads(clean_response)
            
            # Validate key fields
            key_fields = ["first_name", "last_name", "passport_number"]
            missing_fields = [f for f in key_fields if not extracted_data.get(f)]
            
            # Build confidence indicators
            field_status = {}
            for field, value in extracted_data.items():
                if field == "confidence":
                    continue
                if value is not None and value != "":
                    field_status[field] = "green"  # Extracted with confidence
                else:
                    field_status[field] = "red"  # Not found
            
            # Mark some fields as yellow (needs verification) based on confidence
            if extracted_data.get("confidence") == "MEDIUM":
                for field in ["date_of_birth", "issue_date", "expiry_date"]:
                    if field_status.get(field) == "green":
                        field_status[field] = "yellow"
            
            return {
                "success": True,
                "data": extracted_data,
                "field_status": field_status,
                "missing_fields": missing_fields,
                "source": "passport"
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse passport OCR response: {e}")
            return {
                "success": False,
                "error": "Nu am putut procesa răspunsul OCR",
                "raw_response": response[:500]
            }
            
    except ImportError:
        logger.error("emergentintegrations library not installed")
        return {"success": False, "error": "Librăria OCR nu este instalată"}
    except Exception as e:
        logger.error(f"Passport OCR extraction error: {str(e)}")
        return {"success": False, "error": f"Eroare la extragerea datelor: {str(e)}"}


async def extract_cv_data(file_base64: str, mime_type: str = "application/pdf") -> Dict[str, Any]:
    """
    Extract data from CV/Resume using Claude AI
    
    Args:
        file_base64: Base64 encoded CV document
        mime_type: MIME type of the document
    
    Returns:
        Dictionary with extracted data
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
            session_id=f"cv_ocr_{datetime.now().timestamp()}",
            system_message="""You are an expert CV/Resume analyzer.
            Extract professional information from CVs and return it in a structured JSON format.
            Be thorough in extracting work experience, skills, and contact information.
            Calculate total years of experience based on work history.
            If a field is not found, set it to null.
            Always respond ONLY with valid JSON, no other text."""
        ).with_model("anthropic", "claude-sonnet-4-5-20250929")
        
        # Create image content (Claude can process PDF as images)
        image_content = ImageContent(image_base64=file_base64)
        
        # Create the extraction prompt
        extraction_prompt = """Analyze this CV/Resume document and extract the following information.
        Return ONLY a JSON object with these exact fields:

        {
            "email": "email address if found",
            "phone": "phone number with international prefix if found (e.g., +977 123456789)",
            "current_profession": "current job title or profession",
            "target_position": "desired position if mentioned",
            "experience_years": "total years of professional experience (number)",
            "education_level": "highest education level (e.g., High School, Bachelor, Master, PhD)",
            "employers": [
                {
                    "company": "company name",
                    "position": "job title",
                    "duration": "e.g., 2019-2022",
                    "country": "country where worked"
                }
            ],
            "countries_worked_in": ["list of countries where person has worked"],
            "languages": [
                {
                    "language": "language name",
                    "level": "level if specified"
                }
            ],
            "skills": ["list of professional skills"],
            "certifications": ["list of certifications if any"],
            "summary": "brief professional summary if available",
            "confidence": "HIGH, MEDIUM, or LOW based on document clarity"
        }

        IMPORTANT:
        - Calculate experience_years by summing up all work periods
        - Include phone number with country code if visible
        - List ALL previous employers found in the CV
        - Extract languages with their proficiency levels
        - If any field is not found, set it to null
        - Respond ONLY with the JSON object"""
        
        # Send message with document
        user_message = UserMessage(
            text=extraction_prompt,
            image_contents=[image_content]
        )
        
        response = await chat.send_message(user_message)
        
        # Parse the response
        try:
            clean_response = response.strip()
            if clean_response.startswith("```"):
                clean_response = re.sub(r'^```\w*\n?', '', clean_response)
                clean_response = re.sub(r'\n?```$', '', clean_response)
            
            extracted_data = json.loads(clean_response)
            
            # Build field status
            field_status = {}
            important_fields = ["email", "phone", "current_profession", "experience_years", "languages"]
            
            for field in important_fields:
                value = extracted_data.get(field)
                if value is not None and value != "" and value != []:
                    field_status[field] = "green"
                else:
                    field_status[field] = "red"
            
            # Mark some as yellow if medium confidence
            if extracted_data.get("confidence") == "MEDIUM":
                for field in ["experience_years", "phone"]:
                    if field_status.get(field) == "green":
                        field_status[field] = "yellow"
            
            return {
                "success": True,
                "data": extracted_data,
                "field_status": field_status,
                "source": "cv"
            }
            
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse CV OCR response: {e}")
            return {
                "success": False,
                "error": "Nu am putut procesa CV-ul",
                "raw_response": response[:500]
            }
            
    except ImportError:
        logger.error("emergentintegrations library not installed")
        return {"success": False, "error": "Librăria OCR nu este instalată"}
    except Exception as e:
        logger.error(f"CV OCR extraction error: {str(e)}")
        return {"success": False, "error": f"Eroare la extragerea datelor: {str(e)}"}


def merge_extracted_data(passport_data: Dict, cv_data: Dict) -> Dict[str, Any]:
    """
    Merge data extracted from passport and CV into a unified profile
    
    Args:
        passport_data: Data extracted from passport
        cv_data: Data extracted from CV
    
    Returns:
        Merged profile data with field statuses
    """
    merged = {
        # From passport (primary source for personal data)
        "first_name": passport_data.get("data", {}).get("first_name"),
        "last_name": passport_data.get("data", {}).get("last_name"),
        "date_of_birth": passport_data.get("data", {}).get("date_of_birth"),
        "date_of_birth_display": passport_data.get("data", {}).get("date_of_birth_display"),
        "citizenship": passport_data.get("data", {}).get("citizenship"),
        "nationality": passport_data.get("data", {}).get("nationality"),
        "passport_number": passport_data.get("data", {}).get("passport_number"),
        "passport_issue_date": passport_data.get("data", {}).get("issue_date"),
        "passport_expiry_date": passport_data.get("data", {}).get("expiry_date"),
        "passport_expiry_display": passport_data.get("data", {}).get("expiry_date_display"),
        "gender": "male" if passport_data.get("data", {}).get("sex") == "M" else "female" if passport_data.get("data", {}).get("sex") == "F" else None,
        "issuing_country": passport_data.get("data", {}).get("issuing_country"),
        
        # From CV (primary source for professional data)
        "email": cv_data.get("data", {}).get("email"),
        "phone": cv_data.get("data", {}).get("phone"),
        "current_profession": cv_data.get("data", {}).get("current_profession"),
        "experience_years": cv_data.get("data", {}).get("experience_years"),
        "employers": cv_data.get("data", {}).get("employers", []),
        "countries_worked_in": cv_data.get("data", {}).get("countries_worked_in", []),
        "languages_known": [lang.get("language") for lang in cv_data.get("data", {}).get("languages", []) if lang.get("language")],
        "education_level": cv_data.get("data", {}).get("education_level"),
        "skills": cv_data.get("data", {}).get("skills", []),
    }
    
    # Build field statuses
    field_status = {}
    
    # Passport fields
    passport_status = passport_data.get("field_status", {})
    for field in ["first_name", "last_name", "date_of_birth", "citizenship", "passport_number", "expiry_date"]:
        mapped_field = field
        if field == "expiry_date":
            mapped_field = "passport_expiry_date"
        field_status[mapped_field] = passport_status.get(field, "red")
    
    # CV fields
    cv_status = cv_data.get("field_status", {})
    for field in ["email", "phone", "current_profession", "experience_years", "languages"]:
        mapped_field = field
        if field == "languages":
            mapped_field = "languages_known"
        field_status[mapped_field] = cv_status.get(field, "red")
    
    # Identify missing fields that need manual input
    missing_fields = []
    required_fields = [
        "first_name", "last_name", "date_of_birth", "citizenship", 
        "phone", "current_profession"
    ]
    
    for field in required_fields:
        if not merged.get(field):
            missing_fields.append(field)
    
    return {
        "merged_data": merged,
        "field_status": field_status,
        "missing_fields": missing_fields,
        "has_passport_data": passport_data.get("success", False),
        "has_cv_data": cv_data.get("success", False)
    }


def calculate_profile_score(profile_data: Dict) -> Dict[str, Any]:
    """
    Calculate profile completion score and improvement suggestions
    
    Args:
        profile_data: Profile data dictionary
    
    Returns:
        Score and suggestions
    """
    score = 0
    max_score = 100
    suggestions = []
    
    # Required fields (60 points total)
    required_checks = [
        ("first_name", 10, "Adaugă numele"),
        ("last_name", 10, "Adaugă prenumele"),
        ("citizenship", 10, "Adaugă cetățenia"),
        ("phone", 10, "Adaugă numărul de telefon"),
        ("current_profession", 10, "Adaugă profesia"),
        ("date_of_birth", 10, "Adaugă data nașterii"),
    ]
    
    for field, points, suggestion in required_checks:
        if profile_data.get(field):
            score += points
        else:
            suggestions.append({"field": field, "message": suggestion, "points": points})
    
    # Documents (30 points total)
    documents = profile_data.get("documents", {})
    doc_checks = [
        ("passport", 10, "Încarcă pașaportul", True),
        ("cv", 10, "Încarcă CV-ul", True),
        ("criminal_record", 5, "Adaugă cazierul judiciar", True),
        ("passport_photo", 5, "Adaugă foto tip pașaport", True),
    ]
    
    for doc_type, points, suggestion, is_uploaded in doc_checks:
        if documents.get(doc_type):
            score += points
        else:
            suggestions.append({"field": doc_type, "message": f"+{points}% dacă {suggestion.lower()}", "points": points})
    
    # Optional enhancements (10 points)
    if profile_data.get("video_presentation"):
        score += 5
    else:
        suggestions.append({"field": "video_presentation", "message": "+5% dacă încarci video prezentare", "points": 5})
    
    if len(profile_data.get("languages_known", [])) > 1:
        score += 3
    
    if profile_data.get("experience_years", 0) > 2:
        score += 2
    
    return {
        "score": min(score, max_score),
        "max_score": max_score,
        "percentage": min(score, max_score),
        "suggestions": suggestions[:5],  # Top 5 suggestions
        "status": "excellent" if score >= 90 else "good" if score >= 70 else "incomplete" if score >= 50 else "needs_work"
    }
