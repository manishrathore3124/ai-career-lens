import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const latestResume = await prisma.resume.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: { skills: { include: { skill: true } } },
    });

    if (!latestResume) {
      return NextResponse.json(
        { error: "Please upload a resume first." },
        { status: 400 }
      );
    }

    const resumeSkillNames = latestResume.skills.map((rs) => rs.skill.name);

    const allJobs = await prisma.job.findMany({
      include: { skills: { include: { skill: true } } },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const recommendations = [];

    for (const job of allJobs) {
      const jobSkillNames = job.skills.map((js) => js.skill.name);

      if (jobSkillNames.length === 0) continue;

      const aiResponse = await fetch(`${process.env.AI_SERVICE_URL}/ai/match`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume_skills: resumeSkillNames,
          job_skills: jobSkillNames,
        }),
      });

      if (!aiResponse.ok) continue;

      const result = await aiResponse.json();

      recommendations.push({
        jobId: job.id,
        title: job.title,
        overallScore: result.overallScore,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
      });
    }

    recommendations.sort((a, b) => b.overallScore - a.overallScore);

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error("Recommendations error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}