import re


SECTION_HEADERS = {
    "education": ["education"],
    "skills": ["technical skills", "skills"],
    "projects": ["projects"],
    "experience": ["experience", "work experience", "internship"],
    "certifications": ["certifications", "certificates"],
    "achievements": ["academic achievements", "achievements"],
}


def split_into_sections(text: str) -> dict:
    """
    Splits resume raw text into sections based on common headers.
    Returns a dict like { "education": "...", "skills": "...", ... }
    """
    lines = text.split("\n")
    sections: dict[str, list[str]] = {}
    current_section = "summary"
    sections[current_section] = []

    for line in lines:
        line_clean = line.strip()
        line_lower = line_clean.lower()

        matched_section = None
        for section_key, headers in SECTION_HEADERS.items():
            for header in headers:
                if line_lower == header or line_lower.startswith(header):
                    if len(line_clean) < 40:
                        matched_section = section_key
                        break
            if matched_section:
                break

        if matched_section:
            current_section = matched_section
            sections[current_section] = []
        else:
            sections[current_section].append(line_clean)

    return {key: "\n".join(value).strip() for key, value in sections.items()}


def extract_skills(skills_text: str) -> list[str]:
    """
    Extracts individual skills from the skills section text.
    Handles formats like:
    Languages: Java, Python, C, JavaScript
    """
    skills = []

    for line in skills_text.split("\n"):
        line = line.strip()
        if not line:
            continue

        if ":" in line:
            line = line.split(":", 1)[1]

        parts = re.split(r",|\||•|·", line)
        for part in parts:
            skill = part.strip()
            if skill and len(skill) < 40:
                skills.append(skill)

    seen = set()
    unique_skills = []
    for skill in skills:
        key = skill.lower()
        if key not in seen:
            seen.add(key)
            unique_skills.append(skill)

    return unique_skills


import re as _re


def extract_job_details(text: str) -> dict:
    """
    Extracts title, company, experience requirement, and skills from a job description.
    """
    lines = [l.strip() for l in text.split("\n") if l.strip()]

    title = lines[0] if lines else "Untitled Position"

    experience_required = None
    exp_pattern = _re.search(
        r"(\d+\+?\s*-?\s*\d*\s*years?)", text, _re.IGNORECASE
    )
    if exp_pattern:
        experience_required = exp_pattern.group(0)

    skill_lines = []
    for line in lines:
        line_lower = line.lower()
        if any(
            keyword in line_lower
            for keyword in ["required skills", "preferred skills", "skills:", "technologies:", "tech stack"]
        ):
            skill_lines.append(line)

    if skill_lines:
        skills = extract_skills("\n".join(skill_lines))
    else:
        skills = extract_skills(text)

    return {
        "title": title,
        "experience_required": experience_required,
        "skills": skills,
    }