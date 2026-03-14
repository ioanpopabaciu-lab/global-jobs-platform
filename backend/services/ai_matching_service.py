"""
GJC Platform - AI Matching Engine Service
Uses OpenAI embeddings + pgvector for semantic matching

Transforms candidate profiles and job descriptions into vector embeddings
and performs similarity search for optimal matching.
"""

import os
import json
import logging
from typing import List, Dict, Optional, Tuple
from datetime import datetime, timezone
import asyncio

# OpenAI for embeddings
from openai import AsyncOpenAI

# Database
from database.db_config import db_manager, get_pg_connection, execute_pg_query

# Emergent integration for LLM key
try:
    from emergentintegrations.llm.chat import chat, LlmConfig
    EMERGENT_AVAILABLE = True
except ImportError:
    EMERGENT_AVAILABLE = False

logger = logging.getLogger("ai_matching")
logger.setLevel(logging.INFO)

# =====================================================
# CONFIGURATION
# =====================================================

class MatchingConfig:
    """Configuration for AI matching"""
    EMBEDDING_MODEL = "text-embedding-3-small"  # OpenAI embedding model
    EMBEDDING_DIMENSIONS = 1536
    
    # Matching thresholds
    MIN_MATCH_SCORE = 0.70  # Minimum 70% similarity to consider
    HIGH_MATCH_SCORE = 0.85  # High confidence match
    
    # Batch sizes
    EMBEDDING_BATCH_SIZE = 20
    SEARCH_LIMIT = 50


# =====================================================
# EMBEDDING SERVICE
# =====================================================

class EmbeddingService:
    """Service for generating text embeddings using OpenAI"""
    
    def __init__(self):
        self.client: Optional[AsyncOpenAI] = None
        self._initialized = False
    
    async def init(self):
        """Initialize OpenAI client"""
        if self._initialized:
            return
        
        # Get API key from environment or Emergent
        api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("EMERGENT_LLM_KEY")
        
        if not api_key:
            logger.warning("No OpenAI API key found. Embedding service disabled.")
            return
        
        self.client = AsyncOpenAI(api_key=api_key)
        self._initialized = True
        logger.info("✓ EmbeddingService initialized")
    
    async def get_embedding(self, text: str) -> Optional[List[float]]:
        """Generate embedding for a single text"""
        if not self._initialized or not self.client:
            logger.warning("EmbeddingService not initialized")
            return None
        
        try:
            response = await self.client.embeddings.create(
                model=MatchingConfig.EMBEDDING_MODEL,
                input=text,
                dimensions=MatchingConfig.EMBEDDING_DIMENSIONS
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"Embedding generation failed: {e}")
            return None
    
    async def get_embeddings_batch(self, texts: List[str]) -> List[Optional[List[float]]]:
        """Generate embeddings for multiple texts"""
        if not self._initialized or not self.client:
            return [None] * len(texts)
        
        try:
            response = await self.client.embeddings.create(
                model=MatchingConfig.EMBEDDING_MODEL,
                input=texts,
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
    
    # Basic info
    if profile.get("profession"):
        parts.append(f"Profession: {profile['profession']}")
    
    # Skills
    if profile.get("skills"):
        skills = profile["skills"]
        if isinstance(skills, list):
            parts.append(f"Skills: {', '.join(skills)}")
        else:
            parts.append(f"Skills: {skills}")
    
    # Experience
    if profile.get("experience"):
        exp = profile["experience"]
        if isinstance(exp, list):
            for job in exp:
                if isinstance(job, dict):
                    parts.append(f"Experience: {job.get('title', '')} at {job.get('company', '')} - {job.get('description', '')}")
                else:
                    parts.append(f"Experience: {job}")
        else:
            parts.append(f"Experience: {exp}")
    
    if profile.get("years_experience"):
        parts.append(f"Years of experience: {profile['years_experience']}")
    
    # Education
    if profile.get("education"):
        edu = profile["education"]
        if isinstance(edu, list):
            for item in edu:
                if isinstance(item, dict):
                    parts.append(f"Education: {item.get('degree', '')} in {item.get('field', '')} from {item.get('institution', '')}")
                else:
                    parts.append(f"Education: {item}")
        else:
            parts.append(f"Education: {edu}")
    
    # Languages
    if profile.get("languages"):
        langs = profile["languages"]
        if isinstance(langs, list):
            parts.append(f"Languages: {', '.join(langs)}")
        elif isinstance(langs, dict):
            lang_list = [f"{k} ({v})" for k, v in langs.items()]
            parts.append(f"Languages: {', '.join(lang_list)}")
    
    # Certifications
    if profile.get("certifications"):
        certs = profile["certifications"]
        if isinstance(certs, list):
            parts.append(f"Certifications: {', '.join(certs)}")
    
    # Work preferences
    if profile.get("preferred_industries"):
        parts.append(f"Preferred industries: {', '.join(profile['preferred_industries'])}")
    
    if profile.get("preferred_countries"):
        parts.append(f"Preferred countries: {', '.join(profile['preferred_countries'])}")
    
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
    
    # Requirements
    if job.get("required_skills"):
        skills = job["required_skills"]
        if isinstance(skills, list):
            parts.append(f"Required skills: {', '.join(skills)}")
        else:
            parts.append(f"Required skills: {skills}")
    
    if job.get("required_experience_years"):
        parts.append(f"Required experience: {job['required_experience_years']} years")
    
    if job.get("required_languages"):
        langs = job["required_languages"]
        if isinstance(langs, list):
            parts.append(f"Required languages: {', '.join(langs)}")
    
    # Industry
    if job.get("industry"):
        parts.append(f"Industry: {job['industry']}")
    
    # Location
    if job.get("work_country"):
        parts.append(f"Work country: {job['work_country']}")
    if job.get("work_city"):
        parts.append(f"Work city: {job['work_city']}")
    
    # Compensation
    if job.get("salary_min") or job.get("salary_max"):
        salary = f"{job.get('salary_min', '?')}-{job.get('salary_max', '?')} {job.get('salary_currency', 'EUR')}"
        parts.append(f"Salary range: {salary}")
    
    if job.get("benefits"):
        parts.append(f"Benefits: {job['benefits']}")
    
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
    
    async def init(self):
        """Initialize the matching engine"""
        await self.embedding_service.init()
        logger.info("✓ MatchingEngineService initialized")
    
    async def update_candidate_embedding(self, candidate_pg_id: str, profile: dict) -> bool:
        """
        Generate and store embedding for a candidate profile.
        
        Args:
            candidate_pg_id: PostgreSQL UUID of the candidate
            profile: MongoDB profile data
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Build profile text
            profile_text = build_candidate_profile_text(profile)
            
            # Generate embedding
            embedding = await self.embedding_service.get_embedding(profile_text)
            
            if embedding is None:
                logger.warning(f"Could not generate embedding for candidate {candidate_pg_id}")
                return False
            
            # Store in PostgreSQL
            query = """
                UPDATE candidates 
                SET profile_embedding = $1::vector,
                    embedding_updated_at = NOW()
                WHERE id = $2::uuid
            """
            
            # Convert to pgvector format
            embedding_str = f"[{','.join(map(str, embedding))}]"
            
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
        try:
            # Build job text
            job_text = build_job_description_text(job_data)
            
            # Generate embedding
            embedding = await self.embedding_service.get_embedding(job_text)
            
            if embedding is None:
                logger.warning(f"Could not generate embedding for job {job_pg_id}")
                return False
            
            # Store in PostgreSQL
            query = """
                UPDATE jobs 
                SET job_embedding = $1::vector,
                    embedding_updated_at = NOW()
                WHERE id = $2::uuid
            """
            
            embedding_str = f"[{','.join(map(str, embedding))}]"
            
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
        
        Args:
            job_pg_id: PostgreSQL UUID of the job
            limit: Maximum number of candidates to return
            min_score: Minimum similarity score (0-1)
            
        Returns:
            List of matching candidates with scores
        """
        min_score = min_score or MatchingConfig.MIN_MATCH_SCORE
        
        try:
            # Get job embedding
            job_query = "SELECT job_embedding FROM jobs WHERE id = $1::uuid"
            
            async with get_pg_connection() as conn:
                job_embedding = await conn.fetchval(job_query, job_pg_id)
                
                if job_embedding is None:
                    logger.warning(f"Job {job_pg_id} has no embedding")
                    return []
                
                # Find similar candidates using pgvector
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
                match_score = float(row['similarity_score']) * 100  # Convert to percentage
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
        min_score = min_score or MatchingConfig.MIN_MATCH_SCORE
        
        try:
            # Get candidate embedding
            async with get_pg_connection() as conn:
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
                matches.append({
                    "job_id": row['job_id'],
                    "title": row['title'],
                    "company_name": row['company_name'],
                    "positions_available": row['positions_count'] - row['positions_filled'],
                    "salary_range": f"{row['salary_min']}-{row['salary_max']} {row['salary_currency']}",
                    "location": f"{row['work_city']}, {row['work_country']}",
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
        
        Returns:
            Tuple of (score, explanation_dict)
        """
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
                return 0.0, {"error": "Could not calculate match score"}
            
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
    
    def _get_match_level(self, score: float) -> str:
        """Get match level label from score"""
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
        """Get human-readable interpretation of score"""
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

async def init_matching_engine():
    """Initialize the matching engine (call at app startup)"""
    await matching_engine.init()


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
