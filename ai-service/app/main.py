from dotenv import load_dotenv
load_dotenv()
from app.rag.llm import generate_answer
from fastapi import FastAPI, UploadFile, File, HTTPException
from app.resume_parser.parser import split_into_sections, extract_skills, extract_job_details
from pydantic import BaseModel
from app.resume_parser.extractor import extract_text_from_pdf
from app.resume_parser.parser import split_into_sections, extract_skills
from app.matching.matcher import calculate_match
from app.roadmap.generator import generate_roadmap
from app.embeddings.embedder import create_embedding
from app.rag.chunker import chunk_text
from app.interview.generator import generate_interview_questions
from app.interview.feedback import generate_feedback

app = FastAPI(title="CareerLens AI Service")


@app.get("/")
def read_root():
    return {"status": "AI service is running"}


@app.post("/ai/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported.")

    file_bytes = await file.read()

    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    text = extract_text_from_pdf(file_bytes)

    if not text:
        raise HTTPException(
            status_code=422,
            detail="Could not extract text from this PDF. It may be a scanned image.",
        )

    sections = split_into_sections(text)
    skills = extract_skills(sections.get("skills", ""))

    return {
        "filename": file.filename,
        "sections": sections,
        "skills": skills,
    }

class JobDescriptionInput(BaseModel):
    text: str


@app.post("/ai/analyze-job")
async def analyze_job(payload: JobDescriptionInput):
    if not payload.text or len(payload.text.strip()) < 20:
        raise HTTPException(
            status_code=400, detail="Job description text is too short."
        )

    result = extract_job_details(payload.text)
    return result

class MatchInput(BaseModel):
    resume_skills: list[str]
    job_skills: list[str]


@app.post("/ai/match")
async def match_resume_to_job(payload: MatchInput):
    result = calculate_match(payload.resume_skills, payload.job_skills)
    return result

class RoadmapInput(BaseModel):
    missing_skills: list[str]


@app.post("/ai/generate-roadmap")
async def create_roadmap(payload: RoadmapInput):
    steps = generate_roadmap(payload.missing_skills)
    return {"steps": steps}

class IngestInput(BaseModel):
    text: str


@app.post("/ai/rag/ingest")
async def ingest_document(payload: IngestInput):
    if not payload.text or len(payload.text.strip()) < 10:
        raise HTTPException(status_code=400, detail="Text is too short.")

    chunks = chunk_text(payload.text)

    result = []
    for index, chunk in enumerate(chunks):
        embedding = create_embedding(chunk)
        result.append({
            "chunkIndex": index,
            "content": chunk,
            "embedding": embedding,
        })

    return {"chunks": result}


class QueryInput(BaseModel):
    question: str


@app.post("/ai/rag/embed-query")
async def embed_query(payload: QueryInput):
    if not payload.question or len(payload.question.strip()) < 2:
        raise HTTPException(status_code=400, detail="Question is too short.")

    embedding = create_embedding(payload.question)
    return {"embedding": embedding}

class RAGQueryInput(BaseModel):
    question: str
    context_chunks: list[str]


@app.post("/ai/rag/query")
async def rag_query(payload: RAGQueryInput):
    if not payload.question or len(payload.question.strip()) < 2:
        raise HTTPException(status_code=400, detail="Question is too short.")

    if not payload.context_chunks:
        return {
            "answer": "I don't have enough information in the knowledge base to answer this question.",
        }

    answer = generate_answer(payload.question, payload.context_chunks)
    return {"answer": answer}

class InterviewQuestionsInput(BaseModel):
    skills: list[str]


@app.post("/ai/interview/generate-questions")
async def create_interview_questions(payload: InterviewQuestionsInput):
    if not payload.skills:
        raise HTTPException(status_code=400, detail="At least one skill is required.")

    questions = generate_interview_questions(payload.skills)
    return {"questions": questions}


class FeedbackInput(BaseModel):
    question: str
    answer: str


@app.post("/ai/interview/feedback")
async def get_interview_feedback(payload: FeedbackInput):
    if not payload.answer or len(payload.answer.strip()) < 5:
        raise HTTPException(status_code=400, detail="Please provide a more complete answer.")

    feedback = generate_feedback(payload.question, payload.answer)
    return {"feedback": feedback}