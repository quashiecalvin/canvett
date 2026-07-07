from sentence_transformers import SentenceTransformer, util

model = SentenceTransformer("all-MiniLM-L6-v2")


def compute_similarity(text_a: str, text_b: str) -> float:
    embedding_a = model.encode(text_a, convert_to_tensor=True)
    embedding_b = model.encode(text_b, convert_to_tensor=True)
    similarity = util.cos_sim(embedding_a, embedding_b)
    return float(similarity[0][0])


def calibrate(similarity: float, floor: float = 0.2, ceiling: float = 0.65) -> float:
    if similarity <= floor:
        return 0.0
    if similarity >= ceiling:
        return 100.0
    return ((similarity - floor) / (ceiling - floor)) * 100


def best_line_similarity(requirement: str, section_text: str) -> float:
    lines = [line.strip() for line in section_text.split("\n") if len(line.strip()) > 3]
    if not lines:
        return 0.0

    requirement_embedding = model.encode(requirement, convert_to_tensor=True)
    line_embeddings = model.encode(lines, convert_to_tensor=True)
    similarities = util.cos_sim(requirement_embedding, line_embeddings)[0]
    return float(similarities.max())
