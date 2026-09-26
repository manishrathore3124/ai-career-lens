# Simple priority hints: skills considered foundational get higher priority
HIGH_PRIORITY_SKILLS = {
    "git", "sql", "rest apis", "object-oriented programming", "docker",
}


def generate_roadmap(missing_skills: list[str]) -> list[dict]:
    """
    Converts a list of missing skills into an ordered roadmap
    with priority and estimated effort.
    """
    steps = []

    for index, skill in enumerate(missing_skills):
        skill_lower = skill.lower().strip()

        if skill_lower in HIGH_PRIORITY_SKILLS:
            priority = "High"
            estimated_weeks = 1
        else:
            priority = "Medium"
            estimated_weeks = 2

        steps.append({
            "skillName": skill,
            "order": index + 1,
            "priority": priority,
            "estimatedWeeks": estimated_weeks,
        })

    steps.sort(key=lambda s: 0 if s["priority"] == "High" else 1)

    for i, step in enumerate(steps):
        step["order"] = i + 1

    return steps