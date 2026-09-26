import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AnalysisForm from "@/components/analysis-form";

export default async function AnalysisPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const resumes = await prisma.resume.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, fileName: true },
  });

  const jobs = await prisma.job.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-lg rounded-lg border bg-white p-8 shadow-sm">
        <h1 className="mb-2 text-2xl font-semibold">Run a Match Analysis</h1>
        <p className="mb-6 text-sm text-gray-600">
          Select a resume and a job to see how well they match.
        </p>

        {resumes.length === 0 || jobs.length === 0 ? (
          <p className="text-sm text-amber-700">
            You need at least one resume and one job to run an analysis.{" "}
            {resumes.length === 0 && (
              <a href="/resume" className="underline">
                Upload a resume
              </a>
            )}
            {resumes.length === 0 && jobs.length === 0 && " and "}
            {jobs.length === 0 && (
              <a href="/jobs" className="underline">
                add a job
              </a>
            )}
            .
          </p>
        ) : (
          <AnalysisForm resumes={resumes} jobs={jobs} />
        )}
      </div>
    </div>
  );
}