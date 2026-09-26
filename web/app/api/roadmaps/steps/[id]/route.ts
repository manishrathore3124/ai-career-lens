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
  const { isCompleted } = await req.json();

  const step = await prisma.roadmapStep.findUnique({
    where: { id },
    include: { roadmap: true },
  });

  if (!step || step.roadmap.userId !== session.user.id) {
    return NextResponse.json({ error: "Step not found" }, { status: 404 });
  }

  await prisma.roadmapStep.update({
    where: { id },
    data: { isCompleted },
  });

  return NextResponse.json({ success: true });
}