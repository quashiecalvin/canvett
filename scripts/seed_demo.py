import io
import httpx
from docx import Document

BASE = "http://127.0.0.1:8000"
c = httpx.Client(base_url=BASE, timeout=30)


def reg(email, pw, name, role, company=None):
    body = {"email": email, "password": pw, "full_name": name, "role": role}
    if company:
        body["company_name"] = company
    r = c.post("/auth/register", json=body)
    r.raise_for_status()
    d = r.json()
    return d["access_token"], d["user"]


def auth(t):
    return {"Authorization": f"Bearer {t}"}


# --- Recruiter: Hunter Technologies ---
rt, ru = reg("hunter@hunter.io", "password123", "Kwame Mensah", "recruiter", "Hunter Technologies")
c.patch("/auth/me", headers=auth(rt), json={
    "full_name": "Kwame Mensah",
    "email": "hunter@hunter.io",
    "company_name": "Hunter Technologies",
    "website": "https://huntertech.io",
    "location": "Accra, Ghana",
    "bio": "Hunter Technologies is a Ghana-based software company building practical tools that help organisations hire, work, and grow smarter. We're a small, fast-moving team focused on clean products and honest engineering.",
})

JOBS = [
    dict(title="Product Designer", department="Design", employment_type="Full-time",
         location="Accra, Ghana", description="Design intuitive product experiences across our web and mobile apps. Work closely with engineering and product to ship polished, accessible interfaces.",
         required_skills=["Figma", "UI Design", "UX Design", "Prototyping"],
         experience_requirement="3+ years", education_requirement="BSc in Design, HCI, or related"),
    dict(title="Backend Engineer", department="Engineering", employment_type="Full-time",
         location="Remote", description="Build and maintain the APIs that power our platform using Python and FastAPI, backed by PostgreSQL.",
         required_skills=["Python", "FastAPI", "PostgreSQL", "REST APIs"],
         experience_requirement="2+ years", education_requirement="BSc Computer Science or equivalent"),
    dict(title="Frontend Engineer", department="Engineering", employment_type="Full-time",
         location="Accra, Ghana", description="Craft fast, accessible React interfaces with a strong eye for detail and performance.",
         required_skills=["React", "JavaScript", "Tailwind CSS", "Vite"],
         experience_requirement="2+ years", education_requirement="BSc or equivalent experience"),
    dict(title="Data Analyst", department="Analytics", employment_type="Full-time",
         location="Kumasi, Ghana", description="Turn raw product and hiring data into clear insight that guides decisions.",
         required_skills=["SQL", "Python", "Data Visualisation", "Statistics"],
         experience_requirement="1+ years", education_requirement="BSc in a quantitative field"),
    dict(title="Marketing Lead", department="Marketing", employment_type="Full-time",
         location="Accra, Ghana", description="Own our go-to-market: positioning, content, and campaigns that grow adoption.",
         required_skills=["Content Strategy", "SEO", "Copywriting", "Analytics"],
         experience_requirement="4+ years", education_requirement="Degree in Marketing or related"),
    dict(title="Product Manager", department="Product", employment_type="Contract",
         location="Remote", description="Define what we build and why. Translate customer problems into a crisp roadmap.",
         required_skills=["Product Strategy", "Roadmapping", "User Research", "Analytics"],
         experience_requirement="3+ years", education_requirement="Degree or equivalent experience"),
]
job_ids = {}
for j in JOBS:
    r = c.post("/jobs/", headers=auth(rt), json=j)
    r.raise_for_status()
    job_ids[j["title"]] = r.json()["id"]
print("jobs:", job_ids)

# --- Seeker: Ama Yeboah (onboarded, main persona) ---
at, au = reg("ama@yeboah.io", "password123", "Ama Yeboah", "seeker")
c.post("/auth/onboarding", headers=auth(at), json={
    "pref_field": "Design", "pref_job_type": "Full-time", "pref_location": "Hybrid",
    "location": "Accra, Ghana", "skills": "Figma, UI Design, UX Design, Prototyping, User Research",
})
c.patch("/auth/me", headers=auth(at), json={
    "full_name": "Ama Yeboah", "email": "ama@yeboah.io",
    "headline": "Product Designer", "location": "Accra, Ghana",
    "skills": "Figma, UI Design, UX Design, Prototyping, User Research",
    "bio": "Product designer with 4 years turning messy problems into clean, usable interfaces.",
})

# Ama applies (form) to two roles
c.post(f"/applications/form/{job_ids['Product Designer']}", headers=auth(at), json={
    "summary": "Product designer with 4 years of experience in Figma, UI and UX design and prototyping.",
    "skills": ["Figma", "UI Design", "UX Design", "Prototyping"],
    "experience": [{"job_title": "Product Designer", "company": "PaySwift",
                    "start": "Jan 2021", "end": "Present", "description": "Owned the design system and core flows."}],
    "education": [{"qualification": "BSc Information Technology", "institution": "University of Ghana",
                   "start": "Sep 2016", "end": "Jul 2020"}],
})
c.post(f"/applications/form/{job_ids['Frontend Engineer']}", headers=auth(at), json={
    "summary": "Designer who codes — comfortable in React and Tailwind.",
    "skills": ["React", "Tailwind CSS", "Figma"],
    "experience": [{"job_title": "Design Engineer", "company": "PaySwift",
                    "start": "Jan 2022", "end": "Present", "description": "Bridged design and frontend."}],
    "education": [],
})

# Ama saves two other jobs
for t in ("Backend Engineer", "Product Manager"):
    c.post(f"/saved-jobs/{job_ids[t]}", headers=auth(at))

# --- A referral CV uploaded by the recruiter (populates ranking with initials) ---
doc = Document()
for line in ["Kofi Boateng", "Accra, Ghana", "Experience", "Senior Product Designer at Hubtel",
             "Feb 2019 - Present", "Skills", "Figma, UI Design, UX Design, Prototyping, User Research"]:
    doc.add_paragraph(line)
buf = io.BytesIO(); doc.save(buf)
r = c.post("/candidates/upload", headers=auth(rt),
           data={"job_id": job_ids["Product Designer"]},
           files={"file": ("kofi_boateng_cv.docx", buf.getvalue(),
                           "application/vnd.openxmlformats-officedocument.wordprocessingml.document")})
print("referral upload:", r.status_code)

# --- Recruiter shortlists Ama for Product Designer ---
ranking = c.get(f"/candidates/ranking/{job_ids['Product Designer']}", headers=auth(rt)).json()
ama = next((x for x in ranking if x["source"] == "portal"), None)
if ama:
    c.patch(f"/candidates/{ama['candidate_id']}/status", headers=auth(rt), json={"status": "Shortlisted"})
    print("shortlisted candidate", ama["candidate_id"])

# --- A fresh, non-onboarded seeker (to screenshot the onboarding modal) ---
reg("new@seeker.io", "password123", "New Seeker", "seeker")

print("SEED COMPLETE")
