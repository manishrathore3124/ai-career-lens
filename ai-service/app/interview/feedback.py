from app.rag.llm import get_groq_client


def generate_feedback(question: str, answer: str) -> str:
    """
    Uses the LLM to provide constructive feedback on an interview answer.
    """
    client = get_groq_client()

    system_prompt = (
        "You are a friendly technical interview coach. Given an interview question and "
        "the candidate's answer, provide brief, constructive feedback (2-4 sentences). "
        "Point out what was good and what could be improved. Be encouraging but honest. "
        "This is practice feedback, not a definitive evaluation."
    )

    user_prompt = f"Question: {question}\n\nCandidate's Answer: {answer}"

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
        max_tokens=300,
    )

    return response.choices[0].message.content