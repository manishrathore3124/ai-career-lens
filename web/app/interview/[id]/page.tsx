import { auth } from "@/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import InterviewQuestionCard from "@/components/interview-question-card";

export default async function InterviewSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;

  const interviewSession = await prisma.interviewSession.findUnique({
    where: { id },
    include: {
      questions: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!interviewSession || interviewSession.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">{interviewSession.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Answer each question, then get instant feedback.
          </p>
        </div>

        <div className="space-y-4">
          {interviewSession.questions.map((q, index) => (
            <InterviewQuestionCard
              key={q.id}
              questionNumber={index + 1}
              question={q}
            />
          ))}
        </div>
      </div>
    </div>
  );
}