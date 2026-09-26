"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

type Question = {
  id: string;
  question: string;
  skillArea: string;
  userAnswer: string | null;
  feedback: string | null;
};

export default function InterviewQuestionCard({
  questionNumber,
  question,
}: {
  questionNumber: number;
  question: Question;
}) {
  const [answer, setAnswer] = useState(question.userAnswer || "");
  const [feedback, setFeedback] = useState(question.feedback);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit() {
    if (answer.trim().length < 5) {
      setError("Please write a more complete answer.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch(`/api/interview/questions/${question.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong.");
        setLoading(false);
        return;
      }

      setFeedback(data.feedback);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-6 shadow-sm">
      <div className="mb-1 text-xs font-medium text-blue-600">
        {question.skillArea}
      </div>
      <p className="mb-4 font-medium">
        {questionNumber}. {question.question}
      </p>

      <textarea
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        rows={4}
        placeholder="Type your answer here..."
        className="w-full rounded-md border px-3 py-2 text-sm"
      />

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <Button onClick={handleSubmit} disabled={loading} className="mt-3">
        {loading ? "Getting feedback..." : "Submit Answer"}
      </Button>

      {feedback && (
        <div className="mt-4 rounded-md bg-blue-50 p-4 text-sm text-blue-900">
          <p className="mb-1 font-medium">Feedback:</p>
          <p className="whitespace-pre-wrap">{feedback}</p>
        </div>
      )}
    </div>
  );
}