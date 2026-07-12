from services.nlp_engine import model, compute_similarity, calibrate, best_line_similarity
from services.segmenter import segment_resume
from services.duration import extract_total_years, extract_required_years
from sentence_transformers import util

UNVERIFIED_FACTOR = 0.7


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

    # Experience: semantic relevance, adjusted by duration when verifiable
    experience_target = experience_requirement or job_description
    experience_source = sections.get("experience") or resume_text
    experience_relevance = calibrate(best_line_similarity(experience_target, experience_source))

    candidate_years = extract_total_years(sections.get("experience") or "")
    required_years = extract_required_years(experience_requirement or "")

    duration_verified = candidate_years is not None and required_years is not None
    if duration_verified and required_years > 0:
        duration_ratio = min(candidate_years / required_years, 1.0)
        experience_score = round(experience_relevance * duration_ratio, 1)
    else:
        experience_score = round(experience_relevance * UNVERIFIED_FACTOR, 1)

    # Education: semantic relevance via best-line matching
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
        "duration_verified": duration_verified,
    }
