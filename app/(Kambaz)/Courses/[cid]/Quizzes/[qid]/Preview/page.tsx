"use client";

import { useParams } from "next/navigation";

export default function QuizPreviewPage() {
  const { cid, qid } = useParams<{ cid: string; qid: string }>();

  return (
    <div
      id="wd-quiz-preview"
      className="mx-auto"
      style={{ maxWidth: 650 }}
    >
      <h2>Quiz Preview</h2>
      <p>
        This is a simple test preview page for quiz <b>{qid}</b> in course{" "}
        <b>{cid}</b>.
      </p>
    </div>
  );
}
