/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Button } from "react-bootstrap";
import * as client from "../client";

type RootState = any;

export default function QuizDetailsPage() {
  const router = useRouter();
  const { cid, qid } = useParams<{ cid: string; qid: string }>();

  const { quizzes } = useSelector((s: RootState) => s.quizzesReducer);
  const { currentUser } = useSelector((s: RootState) => s.accountReducer);

  const [localQuiz, setLocalQuiz] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const quizFromStore = useMemo(
    () => quizzes?.find((q: any) => q._id === qid),
    [quizzes, qid]
  );

  const quiz = quizFromStore ?? localQuiz ?? null;

  useEffect(() => {
    if (!qid) return;
    if (quizFromStore) {
      setLocalQuiz(quizFromStore);
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        const fetched = await client.findQuizById(qid);
        setLocalQuiz(fetched);
      } catch (e) {
        console.error("Failed to fetch quiz:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [qid, quizFromStore]);

  const isFaculty =
    currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";
  const isStudent = currentUser?.role === "STUDENT";

  const onStartQuiz = () => {
    // Placeholder behavior for now
    // eslint-disable-next-line no-alert
    alert("Starting quiz (placeholder)...");
  };

  if (loading && !quiz) {
    return <div className="text-muted">Loading quiz...</div>;
  }

  if (!quiz) {
    return <div className="text-muted">Quiz not found.</div>;
  }

  return (
    <div
      id="wd-quiz-details"
      className="mx-auto"
      style={{ maxWidth: 650 }}
    >
      {/* Action buttons */}
      <div className="d-flex justify-content-end gap-2 mb-3">
        {isFaculty && (
          <>
            <Button
              variant="secondary"
              id="wd-quiz-preview-btn"
              onClick={() =>
                router.push(`/Courses/${cid}/Quizzes/${qid}/Preview`)
              }
            >
              Preview
            </Button>
            <Button
              variant="danger"
              id="wd-quiz-edit-btn"
              onClick={() =>
                router.push(`/Courses/${cid}/Quizzes/${qid}/Edit`)
              }
            >
              Edit
            </Button>
          </>
        )}

        {isStudent && (
          <Button
            variant="primary"
            id="wd-start-quiz"
            onClick={onStartQuiz}
          >
            Start Quiz
          </Button>
        )}
      </div>

      {/* Title + description */}
      <h2 className="fw-bold mb-2">{quiz.title || "Quiz"}</h2>
      {quiz.description && (
        <p className="text-muted">{quiz.description}</p>
      )}
      <hr />

      {/* Summary of quiz properties, read-only */}
      <h4 className="mb-3">Quiz Details</h4>
      <dl className="row">
        <dt className="col-sm-4">Quiz Type</dt>
        <dd className="col-sm-8">{quiz.quizType ?? "Graded Quiz"}</dd>

        <dt className="col-sm-4">Points</dt>
        <dd className="col-sm-8">{quiz.points ?? 0}</dd>

        <dt className="col-sm-4">Assignment Group</dt>
        <dd className="col-sm-8">{quiz.assignmentGroup ?? "Quizzes"}</dd>

        <dt className="col-sm-4">Shuffle Answers</dt>
        <dd className="col-sm-8">{quiz.shuffleAnswers ?? "Yes"}</dd>

        <dt className="col-sm-4">Time Limit</dt>
        <dd className="col-sm-8">
          {quiz.timeLimit ?? 20} Minutes
        </dd>

        <dt className="col-sm-4">Multiple Attempts</dt>
        <dd className="col-sm-8">{quiz.multipleAttempts ?? "No"}</dd>

        <dt className="col-sm-4">How Many Attempts</dt>
        <dd className="col-sm-8">{quiz.allowedAttempts ?? 1}</dd>

        <dt className="col-sm-4">Show Correct Answers</dt>
        <dd className="col-sm-8">
          {quiz.showCorrectAnswers || "Not specified"}
        </dd>

        <dt className="col-sm-4">Access Code</dt>
        <dd className="col-sm-8">
          {quiz.accessCode ? quiz.accessCode : "None"}
        </dd>

        <dt className="col-sm-4">One Question at a Time</dt>
        <dd className="col-sm-8">
          {quiz.oneQuestionAtATime ?? "Yes"}
        </dd>

        <dt className="col-sm-4">Webcam Required</dt>
        <dd className="col-sm-8">
          {quiz.webcamRequired ?? "No"}
        </dd>

        <dt className="col-sm-4">Lock Questions After Answering</dt>
        <dd className="col-sm-8">
          {quiz.lockQuestionsAfterAnswering ?? "No"}
        </dd>

        <dt className="col-sm-4">Due Date</dt>
        <dd className="col-sm-8">
          {quiz.dueDate ? quiz.dueDate : "Not set"}
        </dd>

        <dt className="col-sm-4">Available From</dt>
        <dd className="col-sm-8">
          {quiz.availableFrom ? quiz.availableFrom : "Not set"}
        </dd>

        <dt className="col-sm-4">Until</dt>
        <dd className="col-sm-8">
          {quiz.availableUntil ? quiz.availableUntil : "Not set"}
        </dd>
      </dl>
    </div>
  );
}
