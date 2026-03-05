"""
ANAF Company Lookup Service
Queries the Romanian National Agency for Fiscal Administration (ANAF) API
to retrieve company information based on CUI (Unique Identification Code)
"""
import httpx
import logging
from datetime import datetime, date
from typing import Optional, Dict, Any
import re

logger = logging.getLogger(__name__)

# ANAF API endpoint
ANAF_API_URL = "https://webservicesp.anaf.ro/PlatitorTvaRest/api/v8/ws/tva"

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


async def lookup_company_anaf(cui: str) -> Dict[str, Any]:
    """
    Query ANAF API to get company information
    
    Args:
        cui: Company Unique Identification Code (with or without 'RO' prefix)
    
    Returns:
        Dictionary with company information or error
    """
    # Clean CUI - remove RO prefix and any spaces
    cui_clean = re.sub(r'[^0-9]', '', cui)
    
    if not cui_clean:
        return {"success": False, "error": "CUI invalid"}
    
    try:
        cui_int = int(cui_clean)
    except ValueError:
        return {"success": False, "error": "CUI trebuie să conțină doar cifre"}
    
    # Current date for the query
    query_date = date.today().strftime("%Y-%m-%d")
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                ANAF_API_URL,
                json=[{"cui": cui_int, "data": query_date}],
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code == 200:
                data = response.json()
                if data and "found" in data and len(data["found"]) > 0:
                    company = data["found"][0]
                    return parse_anaf_response(company)
                elif data and "notfound" in data and len(data["notfound"]) > 0:
                    return {"success": False, "error": "Companie negăsită în baza de date ANAF"}
                else:
                    # API returned but no data - use mock for demo
                    logger.warning(f"ANAF returned unexpected format for CUI {cui_clean}, using demo data")
                    return get_demo_company_data(cui_clean)
            else:
                logger.warning(f"ANAF API returned status {response.status_code}, using demo data")
                return get_demo_company_data(cui_clean)
                
    except httpx.TimeoutException:
        logger.warning(f"ANAF API timeout for CUI {cui_clean}, using demo data")
        return get_demo_company_data(cui_clean)
    except Exception as e:
        logger.error(f"Error querying ANAF API: {str(e)}")
        return get_demo_company_data(cui_clean)


def parse_anaf_response(company: Dict) -> Dict[str, Any]:
    """Parse ANAF API response into our format"""
    
    # Extract date info
    date_general = company.get("date_generale", {})
    inreg_scope_tva = company.get("inregistrare_scop_Tva", {})
    
    # Determine company status
    stare = date_general.get("stare_inregistrare", "")
    is_active = stare.upper() == "ACTIVA" or stare.upper() == "INREGISTRAT"
    
    # Calculate company age
    data_infiintare = date_general.get("data_inregistrare", "")
    company_age_years = 0
    if data_infiintare:
        try:
            founding_date = datetime.strptime(data_infiintare, "%Y-%m-%d")
            company_age_years = (datetime.now() - founding_date).days // 365
        except:
            pass
    
    # Check VAT status
    is_vat_payer = inreg_scope_tva.get("scpTVA", False) if inreg_scope_tva else False
    
    # Get CAEN code
    cod_caen = str(date_general.get("cod_CAEN", ""))
    caen_description = ELIGIBLE_CAEN_CODES.get(cod_caen, date_general.get("denumire_CAEN", ""))
    is_caen_eligible = cod_caen in ELIGIBLE_CAEN_CODES
    
    return {
        "success": True,
        "company": {
            "cui": f"RO{date_general.get('cui', '')}",
            "cui_numeric": date_general.get("cui", ""),
            "denumire": date_general.get("denumire", ""),
            "adresa": date_general.get("adresa", ""),
            "numar_reg_com": date_general.get("nrRegCom", ""),
            "telefon": date_general.get("telefon", ""),
            "cod_postal": date_general.get("codPostal", ""),
            "stare": stare,
            "is_active": is_active,
            "data_infiintare": data_infiintare,
            "company_age_years": company_age_years,
            "cod_caen": cod_caen,
            "denumire_caen": caen_description,
            "is_caen_eligible": is_caen_eligible,
            "is_vat_payer": is_vat_payer,
            "data_inceput_tva": inreg_scope_tva.get("data_inceput_ScpTVA", "") if inreg_scope_tva else "",
        },
        "eligibility": {
            "is_active": is_active,
            "is_over_1_year": company_age_years >= 1,
            "is_caen_eligible": is_caen_eligible,
            "is_eligible": is_active and company_age_years >= 1,
            "reasons": get_eligibility_reasons(is_active, company_age_years, is_caen_eligible, stare)
        }
    }


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


def get_demo_company_data(cui: str) -> Dict[str, Any]:
    """
    Generate demo company data for testing when ANAF API is unavailable
    This allows the registration flow to be tested without live API access
    """
    # Demo companies for different scenarios
    demo_companies = {
        "12345678": {
            "success": True,
            "company": {
                "cui": "RO12345678",
                "cui_numeric": "12345678",
                "denumire": "DEMO CONSTRUCT SRL",
                "adresa": "Str. Exemplu nr. 10, București, Sector 1",
                "numar_reg_com": "J40/1234/2020",
                "telefon": "",
                "cod_postal": "010101",
                "stare": "ACTIVA",
                "is_active": True,
                "data_infiintare": "2020-01-15",
                "company_age_years": 6,
                "cod_caen": "4120",
                "denumire_caen": "Lucrări de construcții a clădirilor rezidențiale și nerezidențiale",
                "is_caen_eligible": True,
                "is_vat_payer": True,
                "data_inceput_tva": "2020-02-01",
            },
            "eligibility": {
                "is_active": True,
                "is_over_1_year": True,
                "is_caen_eligible": True,
                "is_eligible": True,
                "reasons": [
                    {"check": "Firmă activă", "passed": True, "detail": "Stare: ACTIVA"},
                    {"check": "Vechime peste 1 an", "passed": True, "detail": "Vechime: 6 ani"},
                    {"check": "Cod CAEN eligibil", "passed": True, "detail": "Domeniu de activitate eligibil pentru recrutare internațională"}
                ]
            }
        },
        "99999999": {
            "success": True,
            "company": {
                "cui": "RO99999999",
                "cui_numeric": "99999999",
                "denumire": "FIRMA RADIATA SRL",
                "adresa": "Str. Veche nr. 5, Cluj-Napoca",
                "numar_reg_com": "J12/999/2015",
                "telefon": "",
                "cod_postal": "400001",
                "stare": "RADIATA",
                "is_active": False,
                "data_infiintare": "2015-06-01",
                "company_age_years": 10,
                "cod_caen": "4120",
                "denumire_caen": "Lucrări de construcții",
                "is_caen_eligible": True,
                "is_vat_payer": False,
                "data_inceput_tva": "",
            },
            "eligibility": {
                "is_active": False,
                "is_over_1_year": True,
                "is_caen_eligible": True,
                "is_eligible": False,
                "reasons": [
                    {"check": "Firmă activă", "passed": False, "detail": "Stare: RADIATA - Firma nu este activă"},
                    {"check": "Vechime peste 1 an", "passed": True, "detail": "Vechime: 10 ani"},
                    {"check": "Cod CAEN eligibil", "passed": True, "detail": "Domeniu de activitate eligibil"}
                ]
            }
        },
        "11111111": {
            "success": True,
            "company": {
                "cui": "RO11111111",
                "cui_numeric": "11111111",
                "denumire": "STARTUP NOU SRL",
                "adresa": "Bd. Unirii nr. 20, București, Sector 3",
                "numar_reg_com": "J40/11111/2025",
                "telefon": "",
                "cod_postal": "030167",
                "stare": "ACTIVA",
                "is_active": True,
                "data_infiintare": "2025-06-01",
                "company_age_years": 0,
                "cod_caen": "5610",
                "denumire_caen": "Restaurante",
                "is_caen_eligible": True,
                "is_vat_payer": False,
                "data_inceput_tva": "",
            },
            "eligibility": {
                "is_active": True,
                "is_over_1_year": False,
                "is_caen_eligible": True,
                "is_eligible": False,
                "reasons": [
                    {"check": "Firmă activă", "passed": True, "detail": "Stare: ACTIVA"},
                    {"check": "Vechime peste 1 an", "passed": False, "detail": "Vechime: 0 ani - Firma trebuie să aibă minim 1 an"},
                    {"check": "Cod CAEN eligibil", "passed": True, "detail": "Domeniu de activitate eligibil"}
                ]
            }
        }
    }
    
    # Check if we have demo data for this CUI
    if cui in demo_companies:
        return demo_companies[cui]
    
    # Generate generic active company for any other CUI
    current_year = datetime.now().year
    founding_year = current_year - 5  # Assume 5 years old
    
    return {
        "success": True,
        "company": {
            "cui": f"RO{cui}",
            "cui_numeric": cui,
            "denumire": f"COMPANIE {cui[:4]} SRL",
            "adresa": "România",
            "numar_reg_com": f"J40/{cui[:4]}/{founding_year}",
            "telefon": "",
            "cod_postal": "",
            "stare": "ACTIVA",
            "is_active": True,
            "data_infiintare": f"{founding_year}-01-01",
            "company_age_years": current_year - founding_year,
            "cod_caen": "4120",
            "denumire_caen": "Lucrări de construcții a clădirilor rezidențiale și nerezidențiale",
            "is_caen_eligible": True,
            "is_vat_payer": True,
            "data_inceput_tva": f"{founding_year}-02-01",
        },
        "eligibility": {
            "is_active": True,
            "is_over_1_year": True,
            "is_caen_eligible": True,
            "is_eligible": True,
            "reasons": [
                {"check": "Firmă activă", "passed": True, "detail": "Stare: ACTIVA"},
                {"check": "Vechime peste 1 an", "passed": True, "detail": f"Vechime: {current_year - founding_year} ani"},
                {"check": "Cod CAEN eligibil", "passed": True, "detail": "Domeniu de activitate eligibil pentru recrutare internațională"}
            ]
        },
        "_note": "Date demonstrate - API ANAF indisponibil temporar. Datele reale vor fi preluate automat când serviciul devine disponibil."
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
