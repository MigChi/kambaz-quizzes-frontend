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

  const [attemptsInfo, setAttemptsInfo] = useState<{
    attemptsCount: number;
    lastScore?: number;
    lastMaxScore?: number;
  } | null>(null);
  const [loadingAttempts, setLoadingAttempts] = useState(false);
  

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

  useEffect(() => {
    const loadAttempts = async () => {
      if (!qid) return;
      if (!currentUser?._id || currentUser.role !== "STUDENT") return;

      try {
        setLoadingAttempts(true);
        const data = await client.findAttemptsForQuizAndStudent(
          qid,
          currentUser._id
        );
        const arr = Array.isArray(data) ? data : [];
        if (arr.length === 0) {
          setAttemptsInfo({ attemptsCount: 0 });
        } else {
          const sorted = [...arr].sort(
            (a: any, b: any) =>
              (a.attemptNumber ?? 0) - (b.attemptNumber ?? 0) ||
              new Date(a.submittedAt).getTime() -
                new Date(b.submittedAt).getTime()
          );
          const last = sorted[sorted.length - 1];
          setAttemptsInfo({
            attemptsCount: sorted.length,
            lastScore: Number(last.score ?? 0),
            lastMaxScore: Number(last.maxScore ?? 0),
          });
        }
      } catch (e) {
        console.error("Failed to load quiz attempts:", e);
      } finally {
        setLoadingAttempts(false);
      }
    };
    loadAttempts();
  }, [qid, currentUser]);

  const role = currentUser?.role;
  const isFaculty = role === "FACULTY" || role === "ADMIN";
  const isStudent = role === "STUDENT";
  const isTA = role === "TA";
  // Attempt/limit logic (students only)
  const attemptsCount = attemptsInfo?.attemptsCount ?? 0;
  const multipleAttemptsEnabled =
    quiz && typeof quiz.multipleAttempts === "string"
      ? quiz.multipleAttempts.toUpperCase() === "YES"
      : false;
  const allowedAttempts =
    quiz && typeof quiz.allowedAttempts === "number" && quiz.allowedAttempts > 0
      ? quiz.allowedAttempts
      : 1;
  const maxAttempts = multipleAttemptsEnabled ? allowedAttempts : 1;
  const attemptsRemaining = Math.max(0, maxAttempts - attemptsCount);
  const outOfAttempts = attemptsRemaining <= 0;


  const onStartQuiz = () => {
    if (!cid || !qid) return;
    // Explicitly tell the preview page this is a new attempt
    router.push(`/Courses/${cid}/Quizzes/${qid}/Preview?mode=start`);
  };

  const onReviewAnswers = () => {
    if (!cid || !qid) return;
    // Explicitly tell the preview page to show the last attempt
    router.push(`/Courses/${cid}/Quizzes/${qid}/Preview?mode=review`);
  };



  if (loading && !quiz) {
    return <div className="text-muted">Loading quiz...</div>;
  }

  if (!quiz) {
    return <div className="text-muted">Quiz not found.</div>;
  }

  // ⭐ Students cannot view unpublished quizzes, but TAs can
  if (isStudent && !quiz.published) {
    return (
      <div className="text-muted">
        This quiz is not available yet.
      </div>
    );
  }

  return (
    <div
      id="wd-quiz-details"
      className="mx-auto"
      style={{ maxWidth: 650 }}
    >
      {/* Action buttons */}
      <div className="d-flex justify-content-end gap-2 mb-3">
        {(isFaculty || isTA) && (
          <Button
            variant="secondary"
            id="wd-quiz-preview-btn"
            onClick={() =>
              router.push(`/Courses/${cid}/Quizzes/${qid}/Preview`)
            }
          >
            Preview
          </Button>
        )}

        {isFaculty && (
          <Button
            variant="danger"
            id="wd-quiz-edit-btn"
            onClick={() =>
              router.push(`/Courses/${cid}/Quizzes/${qid}/Edit`)
            }
          >
            Edit
          </Button>
        )}

        {isStudent && (
          <>
            {/* Review Answers button when there's at least one attempt */}
            {attemptsInfo?.attemptsCount && attemptsInfo.attemptsCount > 0 && (
              <Button
                variant="outline-secondary"
                id="wd-review-quiz"
                onClick={onReviewAnswers}
                disabled={loadingAttempts}
              >
                Review Answers
              </Button>
            )}

            {/* Start Quiz:
                - shown if no attempts yet
                - or if there are attempts left
                - hidden if out of attempts */}
            {attemptsInfo ? (
              !outOfAttempts && (
                <Button
                  variant="primary"
                  id="wd-start-quiz"
                  onClick={onStartQuiz}
                  disabled={loadingAttempts}
                >
                  Start Quiz
                </Button>
              )
            ) : (
              // While attempts are loading, show disabled Start button
              <Button
                variant="primary"
                id="wd-start-quiz"
                disabled
              >
                {loadingAttempts ? "Loading..." : "Start Quiz"}
              </Button>
            )}
          </>
        )}
      </div>


      {/* Title + description */}
      <h2 className="fw-bold mb-2">{quiz.title || "Quiz"}</h2>
      {quiz.description && (
        <p className="text-muted">{quiz.description}</p>
      )}
      <hr />

      {isStudent && attemptsInfo && attemptsInfo.attemptsCount > 0 && (
        <div className="small text-muted mb-2">
          Last attempt:{" "}
          {attemptsInfo.lastScore} / {attemptsInfo.lastMaxScore ?? quiz.points ?? 0}
          {loadingAttempts && " (updating...)"}
        </div>
      )}


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
