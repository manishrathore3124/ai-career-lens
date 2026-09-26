import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    const { title, category, text } = await req.json();

    if (!title || !text || text.trim().length < 10) {
      return NextResponse.json(
        { error: "Title and text are required." },
        { status: 400 }
      );
    }

    const aiResponse = await fetch(`${process.env.AI_SERVICE_URL}/ai/rag/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json(
        { error: "Failed to process document" },
        { status: 502 }
      );
    }

    const { chunks } = await aiResponse.json();

    const document = await prisma.document.create({
      data: {
        title,
        category: category || null,
        source: "admin-upload",
      },
    });

    for (const chunk of chunks as { chunkIndex: number; content: string; embedding: number[] }[]) {
      const createdChunk = await prisma.documentChunk.create({
        data: {
          documentId: document.id,
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
        },
      });

      const vectorString = `[${chunk.embedding.join(",")}]`;
      await prisma.$executeRawUnsafe(
        `UPDATE "DocumentChunk" SET embedding = $1::vector WHERE id = $2`,
        vectorString,
        createdChunk.id
      );
    }

    return NextResponse.json(
      { id: document.id, chunksCreated: chunks.length },
      { status: 201 }
    );
  } catch (error) {
    console.error("Document ingestion error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}