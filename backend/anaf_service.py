"""
Company Lookup Service
Queries multiple Romanian public company registries to retrieve company information
based on CUI (Unique Identification Code) with automatic fallback
"""
import httpx
import asyncio
import logging
from datetime import datetime, date
from typing import Optional, Dict, Any
import re

logger = logging.getLogger(__name__)

# Primary API endpoint
PRIMARY_API_URL = "https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva"

# Secondary/Fallback API endpoints (OpenAPI Romania, Lista Firme, etc.)
SECONDARY_API_URLS = [
    "https://api.openapi.ro/api/companies/",  # OpenAPI Romania
]

# API timeout in seconds
API_TIMEOUT = 5

# CAEN codes eligible for international workforce recruitment
ELIGIBLE_CAEN_CODES = {
    # Construction
    "4110": "Dezvoltare (promovare) imobiliară",
    "4120": "Lucrări de construcții a clădirilor rezidențiale și nerezidențiale",
    "4211": "Lucrări de construcții a drumurilor și autostrăzilor",
    "4212": "Lucrări de construcții a căilor ferate de suprafață și subterane",
    "4221": "Lucrări de construcții a proiectelor utilitare pentru fluide",
    "4222": "Lucrări de construcții a proiectelor utilitare pentru electricitate și telecomunicații",
    "4291": "Construcții hidrotehnice",
    "4299": "Lucrări de construcții a altor proiecte inginerești",
    "4311": "Lucrări de demolare a construcțiilor",
    "4312": "Lucrări de pregătire a terenului",
    "4313": "Lucrări de foraj și sondaj pentru construcții",
    "4321": "Lucrări de instalații electrice",
    "4322": "Lucrări de instalații sanitare, de încălzire și de aer condiționat",
    "4329": "Alte lucrări de instalații pentru construcții",
    "4331": "Lucrări de ipsoserie",
    "4332": "Lucrări de tâmplărie și dulgherie",
    "4333": "Lucrări de pardosire și placare a pereților",
    "4334": "Lucrări de vopsitorie, zugrăveli și montări de geamuri",
    "4339": "Alte lucrări de finisare",
    "4391": "Lucrări de învelitori, șarpante și terase la construcții",
    "4399": "Alte lucrări speciale de construcții",
    
    # HoReCa (Hotels, Restaurants, Cafes)
    "5510": "Hoteluri și alte facilități de cazare similare",
    "5520": "Facilități de cazare pentru vacanțe și perioade de scurtă durată",
    "5530": "Parcuri pentru rulote, campinguri și tabere",
    "5590": "Alte servicii de cazare",
    "5610": "Restaurante",
    "5621": "Activități de alimentație (catering) pentru evenimente",
    "5629": "Alte servicii de alimentație",
    "5630": "Baruri și alte activități de servire a băuturilor",
    
    # Manufacturing
    "1011": "Prelucrarea și conservarea cărnii",
    "1012": "Prelucrarea și conservarea cărnii de pasăre",
    "1013": "Fabricarea produselor din carne",
    "1020": "Prelucrarea și conservarea peștelui, crustaceelor și moluștelor",
    "1031": "Prelucrarea și conservarea cartofilor",
    "1032": "Fabricarea sucurilor de fructe și legume",
    "1039": "Prelucrarea și conservarea fructelor și legumelor",
    "1041": "Fabricarea uleiurilor și grăsimilor",
    "1051": "Fabricarea produselor lactate și a brânzeturilor",
    "1061": "Fabricarea produselor de morărit",
    "1071": "Fabricarea pâinii; fabricarea prăjiturilor și a produselor de patiserie",
    "1072": "Fabricarea biscuiților și pișcoturilor",
    "1073": "Fabricarea macaroanelor, tăițeilor și a altor produse făinoase",
    "1082": "Fabricarea produselor din cacao, a ciocolatei și a produselor zaharoase",
    "1085": "Fabricarea de mâncăruri preparate",
    "1089": "Fabricarea altor produse alimentare",
    "1101": "Distilarea, rafinarea și mixarea băuturilor alcoolice",
    "1102": "Fabricarea vinurilor din struguri",
    "1105": "Fabricarea berii",
    "1107": "Producția de băuturi răcoritoare nealcoolice",
    
    # Agriculture
    "0111": "Cultivarea cerealelor, plantelor leguminoase și a plantelor producătoare de semințe oleaginoase",
    "0113": "Cultivarea legumelor și a pepenilor, a rădăcinoaselor și tuberculilor",
    "0119": "Cultivarea altor plante din culturi nepermanente",
    "0121": "Cultivarea strugurilor",
    "0124": "Cultivarea fructelor semințoase și sâmburoase",
    "0125": "Cultivarea fructelor arbuștilor fructiferi, căpșunilor, nuciferilor și a altor pomi fructiferi",
    "0141": "Creșterea bovinelor de lapte",
    "0142": "Creșterea altor bovine",
    "0145": "Creșterea ovinelor și caprinelor",
    "0146": "Creșterea porcinelor",
    "0147": "Creșterea păsărilor",
    "0150": "Activități în ferme mixte",
    "0161": "Activități auxiliare pentru producția vegetală",
    "0162": "Activități auxiliare pentru creșterea animalelor",
    
    # Transport and Logistics
    "4941": "Transporturi rutiere de mărfuri",
    "4942": "Servicii de mutare",
    "5210": "Depozitări",
    "5224": "Manipulări",
    "5229": "Alte activități anexe transporturilor",
    
    # Cleaning and Maintenance
    "8121": "Activități generale de curățenie a clădirilor",
    "8122": "Activități specializate de curățenie",
    "8129": "Alte activități de curățenie",
    "8130": "Activități de întreținere peisagistică",
    
    # Healthcare support
    "8710": "Activități ale centrelor de îngrijire medicală",
    "8720": "Activități ale centrelor de recuperare psihică și de dezintoxicare",
    "8730": "Activități ale căminelor de bătrâni și ale căminelor pentru persoane aflate în incapacitate de a se îngriji singure",
    "8790": "Alte activități de asistență socială, cu cazare",
    "8810": "Activități de asistență socială, fără cazare, pentru bătrâni și pentru persoane aflate în incapacitate de a se îngriji singure",
    "8891": "Activități de îngrijire zilnică pentru copii",
    "8899": "Alte activități de asistență socială, fără cazare",
}


async def query_primary_api(cui_int: int, query_date: str) -> Optional[Dict[str, Any]]:
    """Query primary government registry API"""
    try:
        async with httpx.AsyncClient(timeout=API_TIMEOUT) as client:
            logger.info(f"Querying primary registry for CUI: {cui_int}")
            
            response = await client.post(
                PRIMARY_API_URL,
                json=[{"cui": cui_int, "data": query_date}],
                headers={
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data and "found" in data and len(data["found"]) > 0:
                    company = data["found"][0]
                    logger.info(f"Primary API: Company found")
                    return parse_primary_response(company)
                    
                if data and "notfound" in data and len(data["notfound"]) > 0:
                    logger.info(f"Primary API: Company not found")
                    return {"not_found": True}
            
            logger.warning(f"Primary API returned status {response.status_code}")
            return None
            
    except asyncio.TimeoutError:
        logger.warning("Primary API timeout")
        return None
    except Exception as e:
        logger.warning(f"Primary API error: {str(e)}")
        return None


async def query_secondary_api(cui: str) -> Optional[Dict[str, Any]]:
    """Query secondary/fallback company registry API"""
    try:
        async with httpx.AsyncClient(timeout=API_TIMEOUT) as client:
            logger.info(f"Querying secondary registry for CUI: {cui}")
            
            # Try OpenAPI Romania
            response = await client.get(
                f"https://api.openapi.ro/api/companies/{cui}",
                headers={"Accept": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data:
                    logger.info("Secondary API: Company found")
                    return parse_secondary_response(data)
            
            if response.status_code == 404:
                return {"not_found": True}
            
            return None
            
    except asyncio.TimeoutError:
        logger.warning("Secondary API timeout")
        return None
    except Exception as e:
        logger.warning(f"Secondary API error: {str(e)}")
        return None


async def query_tertiary_api(cui: str) -> Optional[Dict[str, Any]]:
    """Query tertiary fallback - Lista Firme API"""
    try:
        async with httpx.AsyncClient(timeout=API_TIMEOUT) as client:
            logger.info(f"Querying tertiary registry for CUI: {cui}")
            
            response = await client.get(
                f"https://listafirme.ro/api/v1/company/{cui}",
                headers={"Accept": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data:
                    logger.info("Tertiary API: Company found")
                    return parse_tertiary_response(data)
            
            if response.status_code == 404:
                return {"not_found": True}
            
            return None
            
    except asyncio.TimeoutError:
        logger.warning("Tertiary API timeout")
        return None
    except Exception as e:
        logger.warning(f"Tertiary API error: {str(e)}")
        return None


def parse_primary_response(company: Dict) -> Dict[str, Any]:
    """Parse primary API (government registry) response"""
    date_general = company.get("date_generale", {})
    inreg_scope_tva = company.get("inregistrare_scop_Tva", {})
    
    cui_value = date_general.get("cui", "")
    denumire = date_general.get("denumire", "")
    adresa = date_general.get("adresa", "")
    numar_reg_com = date_general.get("nrRegCom", "")
    
    stare = date_general.get("stare_inregistrare", "")
    is_active = stare.upper() in ["ACTIVA", "INREGISTRAT", "ÎNREGISTRAT"]
    
    data_infiintare = date_general.get("data_inregistrare", "")
    company_age_years = 0
    if data_infiintare:
        try:
            founding_date = datetime.strptime(data_infiintare, "%Y-%m-%d")
            company_age_years = (datetime.now() - founding_date).days // 365
        except ValueError:
            pass
    
    is_vat_payer = False
    data_inceput_tva = ""
    if inreg_scope_tva:
        is_vat_payer = inreg_scope_tva.get("scpTVA", False)
        data_inceput_tva = inreg_scope_tva.get("data_inceput_ScpTVA", "")
    
    cod_caen = str(date_general.get("cod_CAEN", ""))
    denumire_caen = date_general.get("denumire_CAEN", "")
    is_caen_eligible = cod_caen in ELIGIBLE_CAEN_CODES
    if is_caen_eligible and not denumire_caen:
        denumire_caen = ELIGIBLE_CAEN_CODES.get(cod_caen, "")
    
    return {
        "success": True,
        "source": "registru_oficial",
        "company": {
            "cui": f"RO{cui_value}" if cui_value else "",
            "cui_numeric": str(cui_value),
            "denumire": denumire,
            "adresa": adresa,
            "numar_reg_com": numar_reg_com,
            "telefon": date_general.get("telefon", ""),
            "cod_postal": date_general.get("codPostal", ""),
            "stare": stare,
            "is_active": is_active,
            "data_infiintare": data_infiintare,
            "company_age_years": company_age_years,
            "cod_caen": cod_caen,
            "denumire_caen": denumire_caen,
            "is_caen_eligible": is_caen_eligible,
            "is_vat_payer": is_vat_payer,
            "data_inceput_tva": data_inceput_tva,
        },
        "eligibility": {
            "is_active": is_active,
            "is_over_1_year": company_age_years >= 1,
            "is_caen_eligible": is_caen_eligible,
            "is_eligible": is_active and company_age_years >= 1,
            "reasons": get_eligibility_reasons(is_active, company_age_years, is_caen_eligible, stare)
        }
    }


def parse_secondary_response(data: Dict) -> Dict[str, Any]:
    """Parse secondary API (OpenAPI) response"""
    denumire = data.get("denumire", data.get("name", ""))
    cui_value = data.get("cui", data.get("cif", ""))
    adresa = data.get("adresa", data.get("address", ""))
    numar_reg_com = data.get("numar_registru", data.get("reg_com", ""))
    
    stare = data.get("stare", data.get("status", "ACTIVA"))
    is_active = stare.upper() in ["ACTIVA", "INREGISTRAT", "ÎNREGISTRAT", "ACTIVE"]
    
    data_infiintare = data.get("data_infiintare", data.get("registration_date", ""))
    company_age_years = 0
    if data_infiintare:
        try:
            if "-" in data_infiintare:
                founding_date = datetime.strptime(data_infiintare[:10], "%Y-%m-%d")
            else:
                founding_date = datetime.strptime(data_infiintare[:10], "%d.%m.%Y")
            company_age_years = (datetime.now() - founding_date).days // 365
        except ValueError:
            pass
    
    cod_caen = str(data.get("cod_caen", data.get("caen", "")))
    denumire_caen = data.get("denumire_caen", data.get("caen_description", ""))
    is_caen_eligible = cod_caen in ELIGIBLE_CAEN_CODES
    if is_caen_eligible and not denumire_caen:
        denumire_caen = ELIGIBLE_CAEN_CODES.get(cod_caen, "")
    
    is_vat_payer = data.get("platitor_tva", data.get("vat_payer", False))
    
    return {
        "success": True,
        "source": "registru_public",
        "company": {
            "cui": f"RO{cui_value}" if cui_value and not str(cui_value).startswith("RO") else str(cui_value),
            "cui_numeric": str(cui_value).replace("RO", ""),
            "denumire": denumire,
            "adresa": adresa,
            "numar_reg_com": numar_reg_com,
            "telefon": data.get("telefon", ""),
            "cod_postal": data.get("cod_postal", ""),
            "stare": stare,
            "is_active": is_active,
            "data_infiintare": data_infiintare,
            "company_age_years": company_age_years,
            "cod_caen": cod_caen,
            "denumire_caen": denumire_caen,
            "is_caen_eligible": is_caen_eligible,
            "is_vat_payer": is_vat_payer,
            "data_inceput_tva": "",
        },
        "eligibility": {
            "is_active": is_active,
            "is_over_1_year": company_age_years >= 1,
            "is_caen_eligible": is_caen_eligible,
            "is_eligible": is_active and company_age_years >= 1,
            "reasons": get_eligibility_reasons(is_active, company_age_years, is_caen_eligible, stare)
        }
    }


def parse_tertiary_response(data: Dict) -> Dict[str, Any]:
    """Parse tertiary API response (same structure as secondary)"""
    return parse_secondary_response(data)


def get_eligibility_reasons(is_active: bool, age_years: int, is_caen_eligible: bool, stare: str) -> list:
    """Generate list of eligibility check results"""
    reasons = []
    
    if is_active:
        reasons.append({"check": "Firmă activă", "passed": True, "detail": f"Stare: {stare}"})
    else:
        reasons.append({"check": "Firmă activă", "passed": False, "detail": f"Stare: {stare} - Firma nu este activă"})
    
    if age_years >= 1:
        reasons.append({"check": "Vechime peste 1 an", "passed": True, "detail": f"Vechime: {age_years} ani"})
    else:
        reasons.append({"check": "Vechime peste 1 an", "passed": False, "detail": f"Vechime: {age_years} ani - Firma trebuie să aibă minim 1 an"})
    
    if is_caen_eligible:
        reasons.append({"check": "Cod CAEN eligibil", "passed": True, "detail": "Domeniu de activitate eligibil pentru recrutare internațională"})
    else:
        reasons.append({"check": "Cod CAEN eligibil", "passed": None, "detail": "Verificare manuală necesară pentru eligibilitate"})
    
    return reasons


async def lookup_company_anaf(cui: str) -> Dict[str, Any]:
    """
    Query multiple company registries with automatic fallback
    
    Args:
        cui: Company Unique Identification Code (with or without 'RO' prefix)
    
    Returns:
        Dictionary with company information or error
    """
    # Clean CUI - remove RO prefix and any spaces/special characters
    cui_clean = re.sub(r'[^0-9]', '', cui)
    
    if not cui_clean:
        return {"success": False, "error": "CUI invalid"}
    
    if len(cui_clean) < 2 or len(cui_clean) > 10:
        return {"success": False, "error": "CUI trebuie să aibă între 2 și 10 cifre"}
    
    try:
        cui_int = int(cui_clean)
    except ValueError:
        return {"success": False, "error": "CUI trebuie să conțină doar cifre"}
    
    query_date = date.today().strftime("%Y-%m-%d")
    
    # Step 1: Try primary API
    logger.info(f"Step 1: Querying primary registry for CUI {cui_clean}")
    primary_result = await query_primary_api(cui_int, query_date)
    
    if primary_result:
        if primary_result.get("not_found"):
            return {
                "success": False,
                "error": "Compania nu a fost găsită în registrele oficiale.",
                "cui_searched": cui_clean
            }
        if primary_result.get("success"):
            return primary_result
    
    # Step 2: Try secondary API (fallback)
    logger.info(f"Step 2: Primary failed, trying secondary registry for CUI {cui_clean}")
    secondary_result = await query_secondary_api(cui_clean)
    
    if secondary_result:
        if secondary_result.get("not_found"):
            return {
                "success": False,
                "error": "Compania nu a fost găsită în registrele oficiale.",
                "cui_searched": cui_clean
            }
        if secondary_result.get("success"):
            return secondary_result
    
    # Step 3: Try tertiary API (last fallback)
    logger.info(f"Step 3: Secondary failed, trying tertiary registry for CUI {cui_clean}")
    tertiary_result = await query_tertiary_api(cui_clean)
    
    if tertiary_result:
        if tertiary_result.get("not_found"):
            return {
                "success": False,
                "error": "Compania nu a fost găsită în registrele oficiale.",
                "cui_searched": cui_clean
            }
        if tertiary_result.get("success"):
            return tertiary_result
    
    # All APIs failed
    logger.error(f"All registries failed for CUI {cui_clean}")
    return {
        "success": False,
        "error": "Compania nu a putut fi identificată momentan. Vă rugăm încercați din nou în câteva momente.",
        "cui_searched": cui_clean
    }


# Recruitment industries for employer registration
RECRUITMENT_INDUSTRIES = [
    {"id": "construction", "label": "Construcții", "icon": "building"},
    {"id": "horeca", "label": "HoReCa (Hoteluri, Restaurante)", "icon": "utensils"},
    {"id": "manufacturing", "label": "Producție / Fabricație", "icon": "factory"},
    {"id": "agriculture", "label": "Agricultură", "icon": "wheat"},
    {"id": "logistics", "label": "Transport și Logistică", "icon": "truck"},
    {"id": "cleaning", "label": "Curățenie și Întreținere", "icon": "sparkles"},
    {"id": "healthcare", "label": "Asistență Medicală / Socială", "icon": "heart"},
    {"id": "retail", "label": "Retail / Comerț", "icon": "store"},
    {"id": "it", "label": "IT și Tehnologie", "icon": "laptop"},
    {"id": "other", "label": "Altele", "icon": "more-horizontal"},
]
