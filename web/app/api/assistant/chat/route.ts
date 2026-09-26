import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type RelevantChunk = {
  id: string;
  content: string;
  documentId: string;
  title: string;
};

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { question } = await req.json();

    if (!question || question.trim().length < 2) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const embedResponse = await fetch(
      `${process.env.AI_SERVICE_URL}/ai/rag/embed-query`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      }
    );

    if (!embedResponse.ok) {
      return NextResponse.json(
        { error: "Failed to process question" },
        { status: 502 }
      );
    }

    const { embedding } = await embedResponse.json();
    const vectorString = `[${embedding.join(",")}]`;

    const query = `
      SELECT dc.id, dc.content, dc."documentId", d.title
      FROM "DocumentChunk" dc
      JOIN "Document" d ON dc."documentId" = d.id
      WHERE dc.embedding IS NOT NULL
      ORDER BY dc.embedding <=> $1::vector
      LIMIT 3
    `;

    const relevantChunks: RelevantChunk[] = await prisma.$queryRawUnsafe(
      query,
      vectorString
    );

    const contextChunks = relevantChunks.map((c) => c.content);

    const queryResponse = await fetch(`${process.env.AI_SERVICE_URL}/ai/rag/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        question,
        context_chunks: contextChunks,
      }),
    });

    if (!queryResponse.ok) {
      return NextResponse.json(
        { error: "Failed to generate answer" },
        { status: 502 }
      );
    }

    const { answer } = await queryResponse.json();

    const sources = Array.from(
      new Map(relevantChunks.map((c) => [c.documentId, c.title])).values()
    );

    return NextResponse.json({ answer, sources });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}