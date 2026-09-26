import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { analysisId } = await req.json();

    if (!analysisId) {
      return NextResponse.json(
        { error: "analysisId is required" },
        { status: 400 }
      );
    }

    const analysis = await prisma.jobAnalysis.findUnique({
      where: { id: analysisId },
      include: { job: true },
    });

    if (!analysis || analysis.userId !== session.user.id) {
      return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
    }

    const aiResponse = await fetch(
      `${process.env.AI_SERVICE_URL}/ai/generate-roadmap`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ missing_skills: analysis.missingSkills }),
      }
    );

    if (!aiResponse.ok) {
      return NextResponse.json(
        { error: "Failed to generate roadmap" },
        { status: 502 }
      );
    }

    const { steps } = await aiResponse.json();

    const roadmap = await prisma.roadmap.create({
      data: {
        userId: session.user.id,
        analysisId: analysis.id,
        title: `Roadmap for ${analysis.job.title}`,
        steps: {
          create: steps.map((s: { skillName: string; order: number; priority: string; estimatedWeeks: number }) => ({
            skillName: s.skillName,
            order: s.order,
            priority: s.priority,
            estimatedWeeks: s.estimatedWeeks,
          })),
        },
      },
    });

    return NextResponse.json({ id: roadmap.id }, { status: 201 });
  } catch (error) {
    console.error("Roadmap creation error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}