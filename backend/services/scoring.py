from services.nlp_engine import model, compute_similarity, calibrate, best_line_similarity
from services.segmenter import segment_resume
from sentence_transformers import util


def match_skills(resume_text: str, required_skills: list[str], threshold: float = 0.5):
    matched = []
    unmatched = []

    resume_lower = resume_text.lower()
    chunks = [line.strip() for line in resume_text.split("\n") if line.strip()]
    chunk_embeddings = model.encode(chunks, convert_to_tensor=True) if chunks else None

    for skill in required_skills:
        if skill.lower() in resume_lower:
            matched.append(skill)
            continue

        if chunk_embeddings is not None:
            skill_embedding = model.encode(skill, convert_to_tensor=True)
            similarities = util.cos_sim(skill_embedding, chunk_embeddings)[0]
            if float(similarities.max()) >= threshold:
                matched.append(skill)
                continue

        unmatched.append(skill)

    skills_score = (len(matched) / len(required_skills)) * 100 if required_skills else 0

    return {
        "skills_score": round(skills_score, 1),
        "matched_skills": matched,
        "unmatched_skills": unmatched,
    }


def score_candidate(resume_text: str, job_description: str, required_skills: list[str], experience_requirement: str = None, education_requirement: str = None):
    skills_result = match_skills(resume_text, required_skills)
    skills_score = skills_result["skills_score"]

    sections = segment_resume(resume_text)

    experience_target = experience_requirement or job_description
    experience_source = sections.get("experience") or resume_text
    experience_score = round(calibrate(best_line_similarity(experience_target, experience_source)), 1)

    education_target = education_requirement or job_description
    education_source = sections.get("education") or resume_text
    education_score = round(calibrate(best_line_similarity(education_target, education_source)), 1)

    overall_score = round(
        (skills_score * 0.5)
        + (experience_score * 0.3)
        + (education_score * 0.2),
        1,
    )

    return {
        "overall_score": overall_score,
        "skills_score": skills_score,
        "experience_score": experience_score,
        "education_score": education_score,
        "matched_skills": skills_result["matched_skills"],
        "unmatched_skills": skills_result["unmatched_skills"],
    }
