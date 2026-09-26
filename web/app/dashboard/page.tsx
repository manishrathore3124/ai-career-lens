import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import LogoutButton from "@/components/logout-button";

const features = [
  { title: "Upload Resume", description: "Upload and parse your resume", href: "/resume" },
  { title: "Add Job Description", description: "Analyze a job posting", href: "/jobs" },
  { title: "Run Match Analysis", description: "Compare your resume to a job", href: "/analysis" },
  { title: "AI Career Assistant", description: "Chat with the AI assistant", href: "/assistant" },
  { title: "Job Recommendations", description: "See jobs that match your profile", href: "/recommendations" },
];

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">Welcome, {session.user?.name}!</h1>
              <p className="mt-1 text-sm text-gray-500">{session.user?.email}</p>
            </div>
            <LogoutButton />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {features.map((f) => (
            <Link
              key={f.href}
              href={f.href}
              className="rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <h2 className="font-semibold">{f.title}</h2>
              <p className="mt-1 text-sm text-gray-500">{f.description}</p>
            </Link>
          ))}
        </div>

        {session.user?.role === "ADMIN" && (
          <Link
            href="/admin/documents"
            className="block rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <h2 className="font-semibold">Admin: Manage Knowledge Base</h2>
            <p className="mt-1 text-sm text-gray-500">Upload documents for the AI Assistant</p>
          </Link>
        )}
      </div>
    </div>
  );
}