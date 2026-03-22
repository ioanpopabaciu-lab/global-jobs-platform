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
        # from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        
        # api_key = os.environ.get("EMERGENT_LLM_KEY")
        # if not api_key:
        #     logger.error("EMERGENT_LLM_KEY not configured")
        #     return {"success": False, "error": "Serviciul OCR nu este configurat"}
        
        return {"success": False, "error": "Funcționalitatea OCR pașaport a fost dezactivată temporar."}
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
        # from emergentintegrations.llm.chat import LlmChat, UserMessage, ImageContent
        
        # api_key = os.environ.get("EMERGENT_LLM_KEY")
        # if not api_key:
        #     logger.error("EMERGENT_LLM_KEY not configured")
        #     return {"success": False, "error": "Serviciul OCR nu este configurat"}
        
        return {"success": False, "error": "Funcționalitatea OCR CV a fost dezactivată temporar."}
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
