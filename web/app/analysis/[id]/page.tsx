import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import GenerateRoadmapButton from "@/components/generate-roadmap-button";

export default async function AnalysisResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const analysis = await prisma.jobAnalysis.findUnique({
    where: { id },
    include: {
      resume: true,
      job: true,
    },
  });

  if (!analysis || analysis.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
          <p className="text-sm text-gray-500">
            {analysis.resume.fileName} vs {analysis.job.title}
          </p>
          <p className="mt-2 text-5xl font-bold text-blue-600">
            {analysis.overallScore}%
          </p>
          <p className="mt-1 text-sm text-gray-500">Overall Match</p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-green-700">
            Matched Skills ({analysis.matchedSkills.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {analysis.matchedSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
              >
                {skill}
              </span>
            ))}
            {analysis.matchedSkills.length === 0 && (
              <p className="text-sm text-gray-500">No matched skills found.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold text-red-700">
            Missing Skills ({analysis.missingSkills.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {analysis.missingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-red-100 px-3 py-1 text-sm text-red-800"
              >
                {skill}
              </span>
            ))}
            {analysis.missingSkills.length === 0 && (
              <p className="text-sm text-gray-500">No missing skills — great match!</p>
            )}
          </div>
        </div>

        {analysis.missingSkills.length > 0 && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Ready to close the gap?</h2>
            <p className="mb-4 text-sm text-gray-600">
              Generate a personalized learning roadmap based on your missing skills.
            </p>
            <GenerateRoadmapButton analysisId={analysis.id} />
          </div>
        )}
      </div>
    </div>
  );
}