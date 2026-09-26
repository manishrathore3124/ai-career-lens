from sentence_transformers import SentenceTransformer

_model = None


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def create_embedding(text: str) -> list[float]:
    """
    Converts text into a 384-dimensional embedding vector.
    """
    model = get_model()
    embedding = model.encode(text, normalize_embeddings=True)
    return embedding.tolist()