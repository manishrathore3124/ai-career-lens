import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const resume = await prisma.resume.findUnique({
    where: { id },
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });

  if (!resume || resume.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{resume.fileName}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Uploaded {new Date(resume.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-lg font-semibold">Extracted Skills</h2>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((rs) => (
              <span
                key={rs.id}
                className="rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800"
              >
                {rs.skill.name}
              </span>
            ))}
          </div>
        </div>

        {resume.education && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Education</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {resume.education}
            </pre>
          </div>
        )}

        {resume.projects && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Projects</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {resume.projects}
            </pre>
          </div>
        )}

        {resume.achievements && (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <h2 className="mb-3 text-lg font-semibold">Achievements</h2>
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {resume.achievements}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}