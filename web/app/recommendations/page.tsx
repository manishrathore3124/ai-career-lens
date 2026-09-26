"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Recommendation = {
  jobId: string;
  title: string;
  overallScore: number;
  matchedSkills: string[];
  missingSkills: string[];
};

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        const res = await fetch("/api/recommendations");
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Something went wrong.");
          return;
        }

        setRecommendations(data.recommendations);
      } catch {
        setError("Something went wrong. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    fetchRecommendations();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl space-y-4">
        <div className="rounded-lg border bg-white p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Recommended Jobs</h1>
          <p className="mt-1 text-sm text-gray-600">
            Based on your most recent resume.
          </p>
        </div>

        {loading && (
          <p className="text-center text-sm text-gray-500">Loading recommendations...</p>
        )}

        {error && (
          <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
            <p className="text-sm text-amber-700">{error}</p>
            {error.includes("resume") && (
              <Link href="/resume" className="mt-2 inline-block text-sm text-blue-600 underline">
                Upload a resume
              </Link>
            )}
          </div>
        )}

        {!loading && !error && recommendations.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            No jobs available yet. Try adding some job descriptions first.
          </p>
        )}

        {recommendations.map((rec) => (
          <Link
            key={rec.jobId}
            href={`/jobs/${rec.jobId}`}
            className="block rounded-lg border bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{rec.title}</h2>
              <span
                className={`rounded-full px-3 py-1 text-sm font-medium ${
                  rec.overallScore >= 70
                    ? "bg-green-100 text-green-800"
                    : rec.overallScore >= 40
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {rec.overallScore}% match
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              {rec.matchedSkills.length} matched · {rec.missingSkills.length} missing
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}