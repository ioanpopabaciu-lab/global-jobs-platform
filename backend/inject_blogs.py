import json
import os
import re

print("Loading translated_blogs.json...")
with open("translated_blogs.json", "r", encoding="utf-8") as f:
    translations = json.load(f)

# 1. Prepare data for frontend
frontend_file = r"..\frontend-next\app\[locale]\blog\page.tsx"
print("Reading frontend file...", frontend_file)

with open(frontend_file, "r", encoding="utf-8") as f:
    frontend_content = f.read()

# We want to replace the `const blogPosts = [ ... ];` block entirely
# Original posts had author, date, image
# Post 1
post1_slug = "generatia-de-aur-supravietuire-import"
post2_slug = "cum-sa-angajezi-forta-munca-asia-romania-ghid"
post3_slug = "etapele-colaborari-succes-selectie-integrare"
post4_slug = "avantaje-forta-munca-nepal-horeca"

def render_dict(d):
    # formatting dict into js `{ ro: "...", en: "...", ... }`
    return "{\n      " + ",\n      ".join([f'"{k}": {json.dumps(v, ensure_ascii=False)}' for k,v in d.items()]) + "\n    }"

frontend_new_posts = f"""const blogPosts = [
  {{
    slug: "{post1_slug}",
    title: {render_dict(translations[post1_slug]["title"])},
    excerpt: {render_dict(translations[post1_slug]["excerpt"])},
    date: new Date().toISOString().split('T')[0],
    author: "Global Jobs Consulting",
    image: "/images/blog_gopal.jpg"
  }},
  {{
    slug: "{post2_slug}",
    title: {render_dict(translations[post2_slug]["title"])},
    excerpt: {render_dict(translations[post2_slug]["excerpt"])},
    date: "2024-03-01",
    author: "Global Jobs Consulting",
    image: "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/ljok1yt7_poza%201.png"
  }},
  {{
    slug: "{post3_slug}",
    title: {render_dict(translations[post3_slug]["title"])},
    excerpt: {render_dict(translations[post3_slug]["excerpt"])},
    date: "2024-02-15",
    author: "Global Jobs Consulting",
    image: "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/vriozis1_poza%202.png"
  }},
  {{
    slug: "{post4_slug}",
    title: {render_dict(translations[post4_slug]["title"])},
    excerpt: {render_dict(translations[post4_slug]["excerpt"])},
    date: "2024-02-01",
    author: "Global Jobs Consulting",
    image: "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/3qjb8k8w_poza%203.png"
  }}
];"""

# Replace the block
new_front = re.sub(r'const blogPosts = \[\s*\{.*\}\n\];', frontend_new_posts, frontend_content, flags=re.DOTALL)
with open(frontend_file, "w", encoding="utf-8") as f:
    f.write(new_front)

print("Frontend updated successfully!")

# 2. Prepare data for backend
backend_file = "server.py"
print("Reading backend file...", backend_file)

with open(backend_file, "r", encoding="utf-8") as f:
    backend_content = f.read()

backend_new_posts = f"""STATIC_BLOG_POSTS = [
    {{
        "id": "post-gopal",
        "title": {json.dumps(translations[post1_slug]["title"], ensure_ascii=False)},
        "slug": "{post1_slug}",
        "excerpt": {json.dumps(translations[post1_slug]["excerpt"], ensure_ascii=False)},
        "content": {json.dumps(translations[post1_slug]["content"], ensure_ascii=False)},
        "image_url": "/images/blog_gopal.jpg",
        "category": "Analiză",
        "author": "Global Jobs Consulting",
        "created_at": "2024-03-10T00:00:00.000000+00:00",
        "published": True
    }},
    {{
        "id": "post-step-by-step",
        "title": {json.dumps(translations[post2_slug]["title"], ensure_ascii=False)},
        "slug": "{post2_slug}",
        "excerpt": {json.dumps(translations[post2_slug]["excerpt"], ensure_ascii=False)},
        "content": {json.dumps(translations[post2_slug]["content"], ensure_ascii=False)},
        "image_url": "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/ljok1yt7_poza%201.png",
        "category": "Recrutare",
        "author": "Global Jobs Consulting",
        "created_at": "2024-03-01T00:00:00.000000+00:00",
        "published": True
    }},
    {{
        "id": "post-success",
        "title": {json.dumps(translations[post3_slug]["title"], ensure_ascii=False)},
        "slug": "{post3_slug}",
        "excerpt": {json.dumps(translations[post3_slug]["excerpt"], ensure_ascii=False)},
        "content": {json.dumps(translations[post3_slug]["content"], ensure_ascii=False)},
        "image_url": "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/vriozis1_poza%202.png",
        "category": "Ghid",
        "author": "Global Jobs Consulting",
        "created_at": "2024-02-15T00:00:00.000000+00:00",
        "published": True
    }},
    {{
        "id": "post-nepal-horeca",
        "title": {json.dumps(translations[post4_slug]["title"], ensure_ascii=False)},
        "slug": "{post4_slug}",
        "excerpt": {json.dumps(translations[post4_slug]["excerpt"], ensure_ascii=False)},
        "content": {json.dumps(translations[post4_slug]["content"], ensure_ascii=False)},
        "image_url": "https://customer-assets.emergentagent.com/job_gjc-recruitment/artifacts/3qjb8k8w_poza%203.png",
        "category": "HoReCa",
        "author": "Global Jobs Consulting",
        "created_at": "2024-02-01T00:00:00.000000+00:00",
        "published": True
    }}
]"""

# Update server.py
new_backend = re.sub(r'STATIC_BLOG_POSTS = \[\s*\{.*\}\n\]', backend_new_posts, backend_content, flags=re.DOTALL)
with open(backend_file, "w", encoding="utf-8") as f:
    f.write(new_backend)

print("Backend updated successfully!")

# 3. Update DB Directly
try:
    from motor.motor_asyncio import AsyncIOMotorClient
    import asyncio

    async def update_db():
        client = AsyncIOMotorClient("mongodb://localhost:27017")
        db = client["testdb"] # from env!
        
        # We just drop and insert many using the DB schema
        print("Dropping existing blog posts in DB...")
        await db.blog_posts.delete_many({{}})
        
        import importlib.util
        spec = importlib.util.spec_from_file_location("server", "server.py")
        server_module = importlib.util.module_from_spec(spec)
        # Avoid running server code
        # We constructed the new dict directly:
        
        # Read the new static posts directly from our generated string 
        # but using python logic is safer:
        pass
        
    # We will just write a simple script inline for the mongo part
except Exception as e:
    print(f"Skipping db sync due to missing imports or async context: {{e}}")

print("Done! Restart the Python server to sync the MongoDB collection.")
