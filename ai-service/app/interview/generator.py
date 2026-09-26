# Simple template-based question bank, organized by skill area
QUESTION_TEMPLATES = {
    "default": [
        "Can you explain your experience with {skill}?",
        "What challenges have you faced while working with {skill}, and how did you solve them?",
        "How would you explain {skill} to someone with no technical background?",
    ],
    "Docker": [
        "What is the difference between a Docker image and a Docker container?",
        "How would you reduce the size of a Docker image?",
        "Explain what Docker Compose is used for.",
    ],
    "SQL": [
        "What is the difference between INNER JOIN and LEFT JOIN?",
        "How would you optimize a slow SQL query?",
        "Explain what a database index is and why it matters.",
    ],
    "REST APIs": [
        "What HTTP methods are commonly used in REST APIs and what are they for?",
        "How would you design a REST API for a to-do list application?",
        "What is the difference between PUT and PATCH?",
    ],
    "Git": [
        "What is the difference between 'git merge' and 'git rebase'?",
        "How would you resolve a merge conflict?",
        "Explain what a git branch is and why we use them.",
    ],
}


def generate_interview_questions(skills: list[str]) -> list[dict]:
    """
    Generates interview questions based on a list of target skills.
    Uses skill-specific questions where available, otherwise falls back to generic templates.
    """
    questions = []

    for skill in skills:
        skill_questions = QUESTION_TEMPLATES.get(skill)

        if skill_questions:
            question_text = skill_questions[0]
        else:
            question_text = QUESTION_TEMPLATES["default"][0].format(skill=skill)

        questions.append({
            "question": question_text,
            "skillArea": skill,
        })

    return questions