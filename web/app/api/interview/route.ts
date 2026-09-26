import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { skills: { include: { skill: true } } },
    });

    if (!job || job.userId !== session.user.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const skillNames = job.skills.map((js) => js.skill.name).slice(0, 5);

    if (skillNames.length === 0) {
      return NextResponse.json(
        { error: "This job has no skills to generate questions from." },
        { status: 400 }
      );
    }

    const aiResponse = await fetch(
      `${process.env.AI_SERVICE_URL}/ai/interview/generate-questions`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: skillNames }),
      }
    );

    if (!aiResponse.ok) {
      return NextResponse.json(
        { error: "Failed to generate questions" },
        { status: 502 }
      );
    }

    const { questions } = await aiResponse.json();

    const interviewSession = await prisma.interviewSession.create({
      data: {
        userId: session.user.id,
        jobId: job.id,
        title: `Interview Prep: ${job.title}`,
        questions: {
          create: questions.map((q: { question: string; skillArea: string }) => ({
            question: q.question,
            skillArea: q.skillArea,
          })),
        },
      },
    });

    return NextResponse.json({ id: interviewSession.id }, { status: 201 });
  } catch (error) {
    console.error("Interview session error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}