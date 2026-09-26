import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { text } = await req.json();

    if (!text || text.trim().length < 20) {
      return NextResponse.json(
        { error: "Job description is too short." },
        { status: 400 }
      );
    }

    const aiResponse = await fetch(
      `${process.env.AI_SERVICE_URL}/ai/analyze-job`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      }
    );

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.detail || "Failed to analyze job description" },
        { status: 502 }
      );
    }

    const parsed = await aiResponse.json();
    const { title, experience_required, skills } = parsed;

    const job = await prisma.job.create({
      data: {
        userId: session.user.id,
        title,
        rawDescription: text,
        experienceRequired: experience_required || null,
      },
    });

    for (const skillName of skills as string[]) {
      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName },
      });

      await prisma.jobSkill.upsert({
        where: {
          jobId_skillId: {
            jobId: job.id,
            skillId: skill.id,
          },
        },
        update: {},
        create: {
          jobId: job.id,
          skillId: skill.id,
          isRequired: true,
        },
      });
    }

    return NextResponse.json({ id: job.id, title: job.title }, { status: 201 });
  } catch (error) {
    console.error("Job creation error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}