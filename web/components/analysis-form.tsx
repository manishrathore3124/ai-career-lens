"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type Resume = { id: string; fileName: string };
type Job = { id: string; title: string };

export default function AnalysisForm({
  resumes,
  jobs,
}: {
  resumes: Resume[];
  jobs: Job[];
}) {
  const router = useRouter();
  const [resumeId, setResumeId] = useState(resumes[0]?.id || "");
  const [jobId, setJobId] = useState(jobs[0]?.id || "");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeId, jobId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      router.push(`/analysis/${data.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Resume</label>
        <select
          value={resumeId}
          onChange={(e) => setResumeId(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          {resumes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.fileName}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Job</label>
        <select
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
          className="w-full rounded-md border px-3 py-2 text-sm"
        >
          {jobs.map((j) => (
            <option key={j.id} value={j.id}>
              {j.title}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Analyzing..." : "Run Analysis"}
      </Button>
    </form>
  );
}