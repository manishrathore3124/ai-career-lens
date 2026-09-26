import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import StartInterviewButton from "@/components/start-interview-button";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });

  if (!job || job.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{job.title}</h1>
          {job.experienceRequired && (
            <p className="mt-1 text-sm text-gray-500">
              Experience required: {job.experienceRequired}
            </p>
          )}
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Required Skills</h2>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((js) => (
              <span
                key={js.id}
                className="rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
              >
                {js.skill.name}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Full Description</h2>
          <pre className="whitespace-pre-wrap text-sm text-gray-700">
            {job.rawDescription}
          </pre>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Practice for this role</h2>
          <p className="mb-4 text-sm text-gray-600">
            Generate interview questions based on this job&apos;s required skills.
          </p>
          <StartInterviewButton jobId={job.id} />
        </div>
      </div>
    </div>
  );
}