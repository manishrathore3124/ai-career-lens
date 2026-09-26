"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Step = {
  id: string;
  skillName: string;
  order: number;
  priority: string;
  estimatedWeeks: number;
  isCompleted: boolean;
};

const priorityColors: Record<string, string> = {
  High: "bg-red-100 text-red-800",
  Medium: "bg-yellow-100 text-yellow-800",
  Low: "bg-gray-100 text-gray-800",
};

export default function RoadmapStepItem({ step }: { step: Step }) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(step.isCompleted);
  const [loading, setLoading] = useState(false);

  async function toggleComplete() {
    setLoading(true);
    const newValue = !isCompleted;

    const res = await fetch(`/api/roadmaps/steps/${step.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isCompleted: newValue }),
    });

    if (res.ok) {
      setIsCompleted(newValue);
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <div
      className={`flex items-center justify-between rounded-lg border bg-white p-4 shadow-sm ${
        isCompleted ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={toggleComplete}
          disabled={loading}
          className="h-5 w-5"
        />
        <div>
          <p className={`font-medium ${isCompleted ? "line-through" : ""}`}>
            {step.order}. {step.skillName}
          </p>
          <p className="text-xs text-gray-500">
            Estimated: {step.estimatedWeeks} week{step.estimatedWeeks > 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <span
        className={`rounded-full px-3 py-1 text-xs font-medium ${
          priorityColors[step.priority] || "bg-gray-100 text-gray-800"
        }`}
      >
        {step.priority}
      </span>
    </div>
  );
}