"""
GJC Platform - AI Matching Engine Service
Uses OpenAI embeddings + pgvector for semantic matching

Transforms candidate profiles and job descriptions into vector embeddings
and performs similarity search for optimal matching.
"""

import os
import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timezone

# Database imports
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.db_config import db_manager, get_pg_connection

logger = logging.getLogger("ai_matching")
logger.setLevel(logging.INFO)


# =====================================================
# CONFIGURATION
# =====================================================

class MatchingConfig:
    """Configuration for AI matching"""
    EMBEDDING_MODEL = "text-embedding-3-small"
    EMBEDDING_DIMENSIONS = 1536
    
    # Matching thresholds
    MIN_MATCH_SCORE = 0.70  # Minimum 70% similarity
    HIGH_MATCH_SCORE = 0.85  # High confidence match
    
    # Batch sizes
    EMBEDDING_BATCH_SIZE = 20
    SEARCH_LIMIT = 50
    
    # Emergent integration proxy URL
    EMERGENT_PROXY_URL = "https://integrations.emergentagent.com/llm"


# =====================================================
# EMBEDDING SERVICE
# =====================================================

class EmbeddingService:
    """Service for generating text embeddings using OpenAI via Emergent"""
    
    def __init__(self):
        self.client = None
        self._initialized = False
        self._use_emergent = False
        self._api_key = None
    
    async def init(self):
        """Initialize OpenAI client with Emergent LLM Key"""
        if self._initialized:
            return True
        
        # Get API key from environment
        self._api_key = os.environ.get("EMERGENT_LLM_KEY") or os.environ.get("OPENAI_API_KEY")
        
        if not self._api_key:
            logger.warning("No OpenAI/Emergent API key found. Embedding service disabled.")
            return False
        
        # Check if it's an Emergent key
        self._use_emergent = self._api_key.startswith("sk-emergent")
        
        try:
            from openai import OpenAI
            
            if self._use_emergent:
                # Use Emergent proxy for the API
                self.client = OpenAI(
                    api_key=self._api_key,
                    base_url=MatchingConfig.EMERGENT_PROXY_URL
                )
                logger.info("✓ EmbeddingService initialized with Emergent Proxy (text-embedding-3-small)")
            else:
                # Direct OpenAI client
                self.client = OpenAI(api_key=self._api_key)
                logger.info("✓ EmbeddingService initialized with OpenAI (text-embedding-3-small)")
            
            self._initialized = True
            return True
            
        except Exception as e:
            logger.error(f"Failed to initialize OpenAI client: {e}")
            return False
    
    @property
    def is_available(self) -> bool:
        return self._initialized and self.client is not None
    
    async def get_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding for a single text"""
        if not self.is_available:
            logger.warning("EmbeddingService not initialized")
            return None
        
        if not text or not text.strip():
            logger.warning("Empty text provided for embedding")
            return None
        
        try:
            # Clean and truncate text (max ~8000 tokens)
            cleaned_text = " ".join(text.split())[:32000]
            
            # Use synchronous client (OpenAI SDK v1 embeddings are sync by default)
            response = self.client.embeddings.create(
                model=MatchingConfig.EMBEDDING_MODEL,
                input=cleaned_text,
                dimensions=MatchingConfig.EMBEDDING_DIMENSIONS
            )
            
            embedding = response.data[0].embedding
            logger.debug(f"Generated embedding with {len(embedding)} dimensions")
            return embedding
            
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return None
    
    async def get_embeddings_batch(self, texts: List[str]) -> List[Optional[List[float]]]:
        """Generate embeddings for multiple texts"""
        if not self.is_available:
            return [None] * len(texts)
        
        try:
            # Clean texts
            cleaned_texts = [" ".join(t.split())[:32000] for t in texts if t]
            
            response = self.client.embeddings.create(
                model=MatchingConfig.EMBEDDING_MODEL,
                input=cleaned_texts,
                dimensions=MatchingConfig.EMBEDDING_DIMENSIONS
            )
            return [item.embedding for item in response.data]
        except Exception as e:
            logger.error(f"Batch embedding generation failed: {e}")
            return [None] * len(texts)


# Global embedding service
embedding_service = EmbeddingService()


# =====================================================
# PROFILE TEXT BUILDERS
# =====================================================

def build_candidate_profile_text(profile: dict) -> str:
    """
    Build a comprehensive text representation of a candidate profile
    for embedding generation.
    """
    parts = []
    
    # Profession/Role
    if profile.get("profession"):
        parts.append(f"Profession: {profile['profession']}")
    
    if profile.get("job_title"):
        parts.append(f"Job Title: {profile['job_title']}")
    
    # Skills
    skills = profile.get("skills", [])
    if skills:
        if isinstance(skills, list):
            parts.append(f"Skills: {', '.join(str(s) for s in skills)}")
        else:
            parts.append(f"Skills: {skills}")
    
    # Experience
    experience = profile.get("experience", [])
    if experience:
        if isinstance(experience, list):
            for job in experience:
                if isinstance(job, dict):
                    exp_text = f"{job.get('title', '')} at {job.get('company', '')}"
                    if job.get('description'):
                        exp_text += f" - {job.get('description')}"
                    parts.append(f"Experience: {exp_text}")
                else:
                    parts.append(f"Experience: {job}")
        else:
            parts.append(f"Experience: {experience}")
    
    if profile.get("years_experience"):
        parts.append(f"Years of experience: {profile['years_experience']}")
    
    # Education
    education = profile.get("education", [])
    if education:
        if isinstance(education, list):
            for item in education:
                if isinstance(item, dict):
                    edu_text = f"{item.get('degree', '')} in {item.get('field', '')}"
                    if item.get('institution'):
                        edu_text += f" from {item.get('institution')}"
                    parts.append(f"Education: {edu_text}")
                else:
                    parts.append(f"Education: {item}")
        else:
            parts.append(f"Education: {education}")
    
    # Languages
    languages = profile.get("languages", [])
    if languages:
        if isinstance(languages, list):
            parts.append(f"Languages: {', '.join(str(l) for l in languages)}")
        elif isinstance(languages, dict):
            lang_list = [f"{k} ({v})" for k, v in languages.items()]
            parts.append(f"Languages: {', '.join(lang_list)}")
        else:
            parts.append(f"Languages: {languages}")
    
    # Certifications
    certs = profile.get("certifications", [])
    if certs:
        if isinstance(certs, list):
            parts.append(f"Certifications: {', '.join(str(c) for c in certs)}")
    
    # Work preferences
    if profile.get("preferred_industries"):
        inds = profile['preferred_industries']
        if isinstance(inds, list):
            parts.append(f"Preferred industries: {', '.join(inds)}")
    
    if profile.get("preferred_countries"):
        countries = profile['preferred_countries']
        if isinstance(countries, list):
            parts.append(f"Preferred countries: {', '.join(countries)}")
    
    # Summary/Bio
    if profile.get("summary"):
        parts.append(f"Summary: {profile['summary']}")
    
    if profile.get("bio"):
        parts.append(f"Bio: {profile['bio']}")
    
    return "\n".join(parts) if parts else "No profile information available"


def build_job_description_text(job: dict) -> str:
    """
    Build a comprehensive text representation of a job posting
    for embedding generation.
    """
    parts = []
    
    # Title
    if job.get("title"):
        parts.append(f"Job Title: {job['title']}")
    
    # Description
    if job.get("description"):
        parts.append(f"Description: {job['description']}")
    
    # Required Skills
    skills = job.get("required_skills", [])
    if skills:
        if isinstance(skills, list):
            parts.append(f"Required skills: {', '.join(str(s) for s in skills)}")
        else:
            parts.append(f"Required skills: {skills}")
    
    # Experience
    if job.get("required_experience_years"):
        parts.append(f"Required experience: {job['required_experience_years']} years")
    
    # Languages
    languages = job.get("required_languages", [])
    if languages:
        if isinstance(languages, list):
            parts.append(f"Required languages: {', '.join(str(l) for l in languages)}")
    
    # Industry
    if job.get("industry"):
        parts.append(f"Industry: {job['industry']}")
    
    # Location
    if job.get("work_country"):
        parts.append(f"Work country: {job['work_country']}")
    if job.get("work_city"):
        parts.append(f"Work city: {job['work_city']}")
    
    # Compensation
    salary_min = job.get("salary_min")
    salary_max = job.get("salary_max")
    if salary_min or salary_max:
        currency = job.get("salary_currency", "EUR")
        salary_range = f"{salary_min or '?'}-{salary_max or '?'} {currency}"
        parts.append(f"Salary range: {salary_range}")
    
    # Benefits
    if job.get("benefits"):
        parts.append(f"Benefits: {job['benefits']}")
    
    # Qualifications
    if job.get("qualifications"):
        parts.append(f"Qualifications: {job['qualifications']}")
    
    return "\n".join(parts) if parts else "No job information available"


# =====================================================
# MATCHING ENGINE
# =====================================================

class MatchingEngineService:
    """
    Core AI matching service that:
    1. Generates embeddings for candidates and jobs
    2. Stores embeddings in PostgreSQL (pgvector)
    3. Performs semantic similarity search
    4. Returns match scores and explanations
    """
    
    def __init__(self):
        self.embedding_service = embedding_service
        self._initialized = False
    
    async def init(self):
        """Initialize the matching engine"""
        if self._initialized:
            return True
        
        success = await self.embedding_service.init()
        if success:
            self._initialized = True
            logger.info("✓ MatchingEngineService initialized")
        return success
    
    @property
    def is_available(self) -> bool:
        """Check if matching engine is fully operational"""
        return self._initialized and self.embedding_service.is_available and db_manager.pg_available
    
    async def update_candidate_embedding(self, candidate_pg_id: str, profile: dict) -> bool:
        """
        Generate and store embedding for a candidate profile.
        """
        if not self.is_available:
            logger.warning("Matching engine not available")
            return False
        
        try:
            # Build profile text
            profile_text = build_candidate_profile_text(profile)
            logger.debug(f"Profile text for embedding: {profile_text[:200]}...")
            
            # Generate embedding
            embedding = await self.embedding_service.get_embedding(profile_text)
            
            if embedding is None:
                logger.warning(f"Could not generate embedding for candidate {candidate_pg_id}")
                return False
            
            # Store in PostgreSQL - convert to pgvector format
            embedding_str = f"[{','.join(map(str, embedding))}]"
            
            query = """
                UPDATE candidates 
                SET profile_embedding = $1::vector,
                    embedding_updated_at = NOW()
                WHERE id = $2::uuid
            """
            
            async with get_pg_connection() as conn:
                await conn.execute(query, embedding_str, candidate_pg_id)
            
            logger.info(f"✓ Updated embedding for candidate {candidate_pg_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update candidate embedding: {e}")
            return False
    
    async def update_job_embedding(self, job_pg_id: str, job_data: dict) -> bool:
        """
        Generate and store embedding for a job posting.
        """
        if not self.is_available:
            logger.warning("Matching engine not available")
            return False
        
        try:
            # Build job text
            job_text = build_job_description_text(job_data)
            logger.debug(f"Job text for embedding: {job_text[:200]}...")
            
            # Generate embedding
            embedding = await self.embedding_service.get_embedding(job_text)
            
            if embedding is None:
                logger.warning(f"Could not generate embedding for job {job_pg_id}")
                return False
            
            # Store in PostgreSQL
            embedding_str = f"[{','.join(map(str, embedding))}]"
            
            query = """
                UPDATE jobs 
                SET job_embedding = $1::vector,
                    embedding_updated_at = NOW()
                WHERE id = $2::uuid
            """
            
            async with get_pg_connection() as conn:
                await conn.execute(query, embedding_str, job_pg_id)
            
            logger.info(f"✓ Updated embedding for job {job_pg_id}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to update job embedding: {e}")
            return False
    
    async def find_matching_candidates(
        self, 
        job_pg_id: str, 
        limit: int = 20,
        min_score: float = None
    ) -> List[Dict]:
        """
        Find candidates that match a job posting using vector similarity.
        Uses cosine distance for semantic similarity comparison.
        """
        if not db_manager.pg_available:
            logger.warning("PostgreSQL not available for matching")
            return []
        
        min_score = min_score if min_score is not None else MatchingConfig.MIN_MATCH_SCORE
        
        try:
            async with get_pg_connection() as conn:
                # Get job embedding
                job_embedding = await conn.fetchval(
                    "SELECT job_embedding FROM jobs WHERE id = $1::uuid",
                    job_pg_id
                )
                
                if job_embedding is None:
                    logger.warning(f"Job {job_pg_id} has no embedding")
                    return []
                
                # Find similar candidates using pgvector cosine distance
                match_query = """
                    SELECT 
                        c.id::text as candidate_id,
                        c.mongo_profile_id,
                        c.full_name,
                        c.nationality,
                        a.name as agency_name,
                        (1 - (c.profile_embedding <=> $1)) as similarity_score
                    FROM candidates c
                    LEFT JOIN agencies a ON c.agency_id = a.id
                    WHERE c.is_available = true
                        AND c.profile_embedding IS NOT NULL
                        AND (1 - (c.profile_embedding <=> $1)) >= $2
                    ORDER BY c.profile_embedding <=> $1
                    LIMIT $3
                """
                
                results = await conn.fetch(match_query, job_embedding, min_score, limit)
            
            matches = []
            for row in results:
                match_score = float(row['similarity_score']) * 100
                matches.append({
                    "candidate_id": row['candidate_id'],
                    "mongo_profile_id": row['mongo_profile_id'],
                    "full_name": row['full_name'],
                    "nationality": row['nationality'],
                    "agency_name": row['agency_name'],
                    "match_score": round(match_score, 2),
                    "match_level": self._get_match_level(match_score)
                })
            
            logger.info(f"Found {len(matches)} matching candidates for job {job_pg_id}")
            return matches
            
        except Exception as e:
            logger.error(f"Failed to find matching candidates: {e}")
            return []
    
    async def find_matching_jobs(
        self,
        candidate_pg_id: str,
        limit: int = 20,
        min_score: float = None
    ) -> List[Dict]:
        """
        Find jobs that match a candidate profile using vector similarity.
        """
        if not db_manager.pg_available:
            return []
        
        min_score = min_score if min_score is not None else MatchingConfig.MIN_MATCH_SCORE
        
        try:
            async with get_pg_connection() as conn:
                # Get candidate embedding
                cand_embedding = await conn.fetchval(
                    "SELECT profile_embedding FROM candidates WHERE id = $1::uuid",
                    candidate_pg_id
                )
                
                if cand_embedding is None:
                    return []
                
                # Find similar jobs
                match_query = """
                    SELECT 
                        j.id::text as job_id,
                        j.title,
                        j.positions_count,
                        j.positions_filled,
                        j.salary_min,
                        j.salary_max,
                        j.salary_currency,
                        j.work_city,
                        j.work_country,
                        c.name as company_name,
                        (1 - (j.job_embedding <=> $1)) as similarity_score
                    FROM jobs j
                    JOIN companies c ON j.company_id = c.id
                    WHERE j.is_active = true
                        AND j.is_filled = false
                        AND j.job_embedding IS NOT NULL
                        AND (1 - (j.job_embedding <=> $1)) >= $2
                    ORDER BY j.job_embedding <=> $1
                    LIMIT $3
                """
                
                results = await conn.fetch(match_query, cand_embedding, min_score, limit)
            
            matches = []
            for row in results:
                match_score = float(row['similarity_score']) * 100
                
                # Build salary range string
                salary_min = row['salary_min']
                salary_max = row['salary_max']
                currency = row['salary_currency'] or 'EUR'
                if salary_min and salary_max:
                    salary_range = f"{salary_min}-{salary_max} {currency}"
                elif salary_min:
                    salary_range = f"from {salary_min} {currency}"
                elif salary_max:
                    salary_range = f"up to {salary_max} {currency}"
                else:
                    salary_range = "Not specified"
                
                # Build location string
                city = row['work_city'] or ''
                country = row['work_country'] or ''
                location = f"{city}, {country}".strip(', ')
                
                matches.append({
                    "job_id": row['job_id'],
                    "title": row['title'],
                    "company_name": row['company_name'],
                    "positions_available": (row['positions_count'] or 0) - (row['positions_filled'] or 0),
                    "salary_range": salary_range,
                    "location": location or "Not specified",
                    "match_score": round(match_score, 2),
                    "match_level": self._get_match_level(match_score)
                })
            
            return matches
            
        except Exception as e:
            logger.error(f"Failed to find matching jobs: {e}")
            return []
    
    async def calculate_match_score(
        self,
        job_pg_id: str,
        candidate_pg_id: str
    ) -> Tuple[float, Dict]:
        """
        Calculate match score between a specific job and candidate.
        Returns: Tuple of (score_percentage, explanation_dict)
        """
        if not db_manager.pg_available:
            return 0.0, {"error": "PostgreSQL not available"}
        
        try:
            query = """
                SELECT 
                    (1 - (j.job_embedding <=> c.profile_embedding)) * 100 as match_score
                FROM jobs j, candidates c
                WHERE j.id = $1::uuid AND c.id = $2::uuid
                    AND j.job_embedding IS NOT NULL
                    AND c.profile_embedding IS NOT NULL
            """
            
            async with get_pg_connection() as conn:
                score = await conn.fetchval(query, job_pg_id, candidate_pg_id)
            
            if score is None:
                return 0.0, {"error": "Could not calculate match - missing embeddings"}
            
            score = round(float(score), 2)
            explanation = {
                "score": score,
                "level": self._get_match_level(score),
                "interpretation": self._get_score_interpretation(score)
            }
            
            return score, explanation
            
        except Exception as e:
            logger.error(f"Failed to calculate match score: {e}")
            return 0.0, {"error": str(e)}
    
    async def generate_embedding_for_text(self, text: str) -> Optional[List[float]]:
        """
        Generate embedding for arbitrary text.
        Useful for ad-hoc searches or testing.
        """
        if not self.embedding_service.is_available:
            return None
        return await self.embedding_service.get_embedding(text)
    
    def _get_match_level(self, score: float) -> str:
        """Get match level label from score percentage"""
        if score >= 90:
            return "EXCELLENT"
        elif score >= MatchingConfig.HIGH_MATCH_SCORE * 100:
            return "HIGH"
        elif score >= MatchingConfig.MIN_MATCH_SCORE * 100:
            return "GOOD"
        elif score >= 60:
            return "MODERATE"
        else:
            return "LOW"
    
    def _get_score_interpretation(self, score: float) -> str:
        """Get human-readable interpretation of score (in Romanian)"""
        if score >= 90:
            return "Candidatul are o potrivire excepțională cu cerințele jobului."
        elif score >= 85:
            return "Candidatul îndeplinește foarte bine cerințele jobului."
        elif score >= 70:
            return "Candidatul are o potrivire bună, cu unele diferențe minore."
        elif score >= 60:
            return "Candidatul are o potrivire moderată, necesită evaluare suplimentară."
        else:
            return "Candidatul nu se potrivește suficient cu cerințele jobului."


# Global matching engine instance
matching_engine = MatchingEngineService()


# =====================================================
# CONVENIENCE FUNCTIONS
# =====================================================

async def init_matching_engine() -> bool:
    """Initialize the matching engine (call at app startup)"""
    return await matching_engine.init()


async def update_profile_embedding(candidate_pg_id: str, profile: dict) -> bool:
    """Convenience function to update candidate embedding"""
    return await matching_engine.update_candidate_embedding(candidate_pg_id, profile)


async def update_job_embedding(job_pg_id: str, job_data: dict) -> bool:
    """Convenience function to update job embedding"""
    return await matching_engine.update_job_embedding(job_pg_id, job_data)


async def get_candidate_matches(job_pg_id: str, limit: int = 20) -> List[Dict]:
    """Convenience function to find matching candidates for a job"""
    return await matching_engine.find_matching_candidates(job_pg_id, limit)


async def get_job_matches(candidate_pg_id: str, limit: int = 20) -> List[Dict]:
    """Convenience function to find matching jobs for a candidate"""
    return await matching_engine.find_matching_jobs(candidate_pg_id, limit)


async def get_match_score(job_pg_id: str, candidate_pg_id: str) -> Tuple[float, Dict]:
    """Convenience function to calculate match score"""
    return await matching_engine.calculate_match_score(job_pg_id, candidate_pg_id)
