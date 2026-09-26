import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { answer } = await req.json();

  if (!answer || answer.trim().length < 5) {
    return NextResponse.json(
      { error: "Please provide a more complete answer." },
      { status: 400 }
    );
  }

  const question = await prisma.interviewQuestion.findUnique({
    where: { id },
    include: { session: true },
  });

  if (!question || question.session.userId !== session.user.id) {
    return NextResponse.json({ error: "Question not found" }, { status: 404 });
  }

  try {
    const aiResponse = await fetch(
      `${process.env.AI_SERVICE_URL}/ai/interview/feedback`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: question.question, answer }),
      }
    );

    if (!aiResponse.ok) {
      return NextResponse.json(
        { error: "Failed to generate feedback" },
        { status: 502 }
      );
    }

    const { feedback } = await aiResponse.json();

    await prisma.interviewQuestion.update({
      where: { id },
      data: { userAnswer: answer, feedback },
    });

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error("Feedback error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}