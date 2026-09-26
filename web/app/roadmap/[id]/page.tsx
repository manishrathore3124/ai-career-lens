import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import RoadmapStepItem from "@/components/roadmap-step-item";

export default async function RoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const roadmap = await prisma.roadmap.findUnique({
    where: { id },
    include: {
      steps: { orderBy: { order: "asc" } },
    },
  });

  if (!roadmap || roadmap.userId !== session.user.id) {
    notFound();
  }

  const completedCount = roadmap.steps.filter((s) => s.isCompleted).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{roadmap.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {completedCount} / {roadmap.steps.length} steps completed
          </p>
        </div>

        <div className="space-y-3">
          {roadmap.steps.map((step) => (
            <RoadmapStepItem key={step.id} step={step} />
          ))}
        </div>
      </div>
    </div>
  );
}