from services.parser import parse_resume
from services.scoring import score_candidate

resume_text = parse_resume("CV.pdf")
job_description = "We are hiring a frontend developer skilled in React, JavaScript and modern CSS frameworks to build responsive web interfaces."
required_skills = ["React", "JavaScript", "Tailwind CSS", "Python", "FastAPI"]

result = score_candidate(resume_text, job_description, required_skills)
for key, value in result.items():
    print(f"{key}: {value}")
