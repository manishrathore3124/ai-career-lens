def calculate_match(resume_skills: list[str], job_skills: list[str]) -> dict:
    """
    Compares resume skills against job required skills.
    Returns matched skills, missing skills, and scores.
    """
    resume_skills_lower = {s.lower().strip() for s in resume_skills}
    job_skills_lower = [s.strip() for s in job_skills]

    matched = []
    missing = []

    for job_skill in job_skills_lower:
        if job_skill.lower() in resume_skills_lower:
            matched.append(job_skill)
        else:
            missing.append(job_skill)

    total_required = len(job_skills_lower)
    skill_coverage_score = (
        round((len(matched) / total_required) * 100) if total_required > 0 else 0
    )

    overall_score = skill_coverage_score

    return {
        "overallScore": overall_score,
        "skillCoverageScore": skill_coverage_score,
        "matchedSkills": matched,
        "missingSkills": missing,
    }