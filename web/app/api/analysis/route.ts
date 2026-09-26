import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { resumeId, jobId } = await req.json();

    if (!resumeId || !jobId) {
      return NextResponse.json(
        { error: "resumeId and jobId are required" },
        { status: 400 }
      );
    }

    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: { skills: { include: { skill: true } } },
    });

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { skills: { include: { skill: true } } },
    });

    if (!resume || resume.userId !== session.user.id) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 });
    }

    if (!job || job.userId !== session.user.id) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const resumeSkillNames = resume.skills.map((rs) => rs.skill.name);
    const jobSkillNames = job.skills.map((js) => js.skill.name);

    const aiResponse = await fetch(`${process.env.AI_SERVICE_URL}/ai/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resume_skills: resumeSkillNames,
        job_skills: jobSkillNames,
      }),
    });

    if (!aiResponse.ok) {
      return NextResponse.json(
        { error: "Failed to calculate match" },
        { status: 502 }
      );
    }

    const result = await aiResponse.json();

    const analysis = await prisma.jobAnalysis.create({
      data: {
        userId: session.user.id,
        resumeId,
        jobId,
        overallScore: result.overallScore,
        skillCoverageScore: result.skillCoverageScore,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
      },
    });

    return NextResponse.json({ id: analysis.id }, { status: 201 });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}