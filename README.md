# CareerLens AI — AI Career Intelligence Platform

A full-stack AI-powered platform that helps students and job seekers analyze how well their resume matches a target job, identify skill gaps, get a personalized learning roadmap, and chat with an AI career assistant backed by a RAG (Retrieval-Augmented Generation) pipeline.

## Features

- **Resume Parsing** — Upload a PDF resume and automatically extract skills, education, projects, and achievements.
- **Job Description Analysis** — Paste any job description to extract required skills and experience requirements.
- **Explainable Job Matching** — Get a transparent match score showing matched, missing, and partial skills.
- **Personalized Career Roadmap** — Auto-generated, priority-ordered learning plan based on skill gaps, with progress tracking.
- **AI Career Assistant (RAG)** — Ask career and technology questions, answered using a curated knowledge base with source citations.
- **Job Recommendations** — Ranked job suggestions based on your resume.
- **Interview Preparation** — Practice interview questions tailored to a job's required skills, with AI-generated feedback.
- **Admin Panel** — Upload and manage the knowledge base documents used by the AI assistant.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 16, React, TypeScript, Tailwind CSS, shadcn/ui |
| Backend (main app) | Next.js API Routes |
| Database | PostgreSQL + pgvector |
| ORM | Prisma |
| AI Service | Python, FastAPI |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| LLM | Groq (Llama / GPT-OSS models) |
| Auth | NextAuth.js (Auth.js v5) |
| DevOps | Docker, Docker Compose |

## Architecture

User
│
▼
Next.js (Frontend + API Routes)
│
├──► PostgreSQL + Prisma (users, resumes, jobs, analyses, roadmaps)
│
└──► FastAPI AI Service
│
├──► Resume/Job Parsing (PyPDF, rule-based extraction)
├──► Embeddings (sentence-transformers)
├──► Matching Engine (skill coverage scoring)
├──► RAG Pipeline (pgvector similarity search + Groq LLM)
└──► Interview Question & Feedback Generation


## Project Structure

career-lens-ai/
├── web/ # Next.js application
│ ├── app/ # Pages and API routes
│ ├── components/ # Reusable UI components
│ ├── lib/ # Prisma client, utilities
│ └── prisma/ # Database schema and migrations
├── ai-service/ # FastAPI AI microservice
│ ├── app/
│ │ ├── resume_parser/ # PDF text extraction, parsing
│ │ ├── matching/ # Resume-job matching logic
│ │ ├── roadmap/ # Roadmap generation
│ │ ├── rag/ # Chunking, LLM calls
│ │ ├── embeddings/ # Embedding generation
│ │ └── interview/ # Interview question/feedback generation
│ └── requirements.txt
├── docker-compose.yml
└── README.md


## Getting Started

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- A free [Groq API key](https://console.groq.com)

### Setup

1. Clone the repository:
```bash
   git clone <your-repo-url>
   cd career-lens-ai
```

2. Create a `.env` file in the root directory:

GROQ_API_KEY=your_groq_api_key
AUTH_SECRET=your_random_secret_string


3. Start all services:
```bash
   docker compose up --build
```

4. Once running, open:
   - App: [http://localhost:3000](http://localhost:3000)
   - AI Service docs: [http://localhost:8000/docs](http://localhost:8000/docs)

5. Run database migrations (first time only, in a separate terminal):
```bash
   docker compose exec web npx prisma migrate deploy
```

### Making a user an Admin

Admins can upload documents to the AI Assistant's knowledge base. To promote a user:

```bash
docker compose exec db psql -U postgres -d careerlens -c "UPDATE \"User\" SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

## Environment Variables

| Variable | Location | Description |
|---|---|---|
| `DATABASE_URL` | web | PostgreSQL connection string |
| `AUTH_SECRET` | web | Secret for session encryption |
| `AI_SERVICE_URL` | web | URL of the FastAPI service |
| `GROQ_API_KEY` | ai-service | API key for the Groq LLM |

## Known Limitations

- Skill extraction and job title detection use rule-based heuristics rather than a trained NLP model, so accuracy varies with resume/job description formatting.
- The match score is a transparent skill-coverage indicator, not a hiring probability prediction.
- The demo dataset (jobs, skills, documents) is for demonstration purposes only and is not live job market data.

## Future Improvements

- Skill alias normalization (e.g. "ReactJS" / "React.js" → "React")
- Semantic similarity scoring alongside skill coverage
- Support for uploading job descriptions as files (PDF/DOCX)
- Automated test suite (unit + integration)
- Production deployment (Vercel + Render/Railway + managed PostgreSQL)