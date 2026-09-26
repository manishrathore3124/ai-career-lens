import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 }
      );
    }

    const aiFormData = new FormData();
    aiFormData.append("file", file);

    const aiResponse = await fetch(
      `${process.env.AI_SERVICE_URL}/ai/parse-resume`,
      {
        method: "POST",
        body: aiFormData,
      }
    );

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json().catch(() => null);
      return NextResponse.json(
        { error: errorData?.detail || "Failed to parse resume" },
        { status: 502 }
      );
    }

    const parsed = await aiResponse.json();
    const { sections, skills } = parsed;

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        rawText: Object.values(sections).join("\n\n"),
        summary: sections.summary || null,
        education: sections.education || null,
        experience: sections.experience || null,
        projects: sections.projects || null,
        certifications: sections.certifications || null,
        achievements: sections.achievements || null,
      },
    });

    for (const skillName of skills as string[]) {
      const skill = await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName },
      });

      await prisma.resumeSkill.upsert({
        where: {
          resumeId_skillId: {
            resumeId: resume.id,
            skillId: skill.id,
          },
        },
        update: {},
        create: {
          resumeId: resume.id,
          skillId: skill.id,
        },
      });
    }

    return NextResponse.json({ id: resume.id, fileName: resume.fileName }, { status: 201 });
  } catch (error) {
    console.error("Resume upload error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    );
  }
}