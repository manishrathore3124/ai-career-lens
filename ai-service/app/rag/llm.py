import os
from groq import Groq

_client = None


def get_groq_client():
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY")
        _client = Groq(api_key=api_key)
    return _client


def generate_answer(question: str, context_chunks: list[str]) -> str:
    """
    Sends the question + retrieved context to Groq LLM and returns a grounded answer.
    """
    client = get_groq_client()

    context_text = "\n\n---\n\n".join(context_chunks)

    system_prompt = (
        "You are a helpful career assistant. Answer the user's question using ONLY "
        "the provided context below. If the context does not contain enough information "
        "to answer confidently, say so clearly instead of making up an answer. "
        "Keep your answer concise and practical."
    )

    user_prompt = f"Context:\n{context_text}\n\nQuestion: {question}"

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.3,
        max_tokens=500,
    )

    return response.choices[0].message.content