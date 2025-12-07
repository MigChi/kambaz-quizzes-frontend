"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Alert,
  Badge,
  Button,
  Card,
  ListGroup,
  Spinner,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import * as quizzesClient from "../../client";
import type { Quiz } from "../../reducer";

type Role = "STUDENT" | "FACULTY" | "ADMIN" | string;

type CurrentUser = { role?: Role } | null;

type RootState = {
  quizzesReducer: { quizzes: Quiz[] };
  accountReducer: { currentUser: CurrentUser };
};

type AttemptAnswer = {
  questionId: string;
  questionTitle: string;
  prompt: string;
  questionType: "MULTIPLE_CHOICE" | "TRUE_FALSE" | "FILL_BLANK";
  points: number;
  selectedChoiceText?: string;
  trueFalseSelection?: "TRUE" | "FALSE";
  fillBlankResponse?: string;
  correctAnswerSummary?: string;
  isCorrect: boolean;
  earnedPoints: number;
  multipleChoiceOptionsSnapshot?: {
    id?: string;
    text?: string;
    isCorrect?: boolean;
  }[];
};

type QuizAttempt = {
  _id: string;
  attemptNumber: number;
  score: number;
  maxScore: number;
  submittedAt: string;
  answers: AttemptAnswer[];
};

const QuizResultsPage = () => {
  const router = useRouter();
  const { cid, qid } = useParams<{ cid: string; qid: string }>();
  const { currentUser } = useSelector(
    (state: RootState) => state.accountReducer
  );

  const [attempt, setAttempt] = useState<QuizAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isStudent = currentUser?.role === "STUDENT";

  useEffect(() => {
    if (!qid) return;
    const loadAttempt = async () => {
      try {
        setIsLoading(true);
        const data =
          await quizzesClient.findCurrentUserAttemptsForQuiz(qid, true);
        if (data) {
          setAttempt(data);
        } else {
          setAttempt(null);
        }
      } catch (err) {
        console.error("Failed to load attempt:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadAttempt();
  }, [qid]);

  const percentage = useMemo(() => {
    if (!attempt || attempt.maxScore === 0) return 0;
    return Math.round((attempt.score / attempt.maxScore) * 100);
  }, [attempt]);

  if (!isStudent) {
    return (
      <div className="text-muted">
        Quiz results are available to students only.
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center text-muted py-5">
        <Spinner animation="border" role="status" className="me-2" />
        Loading attempt...
      </div>
    );
  }

  if (!attempt) {
    return (
      <Alert variant="info">
        You have not submitted this quiz yet.{" "}
        <Alert.Link
          onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}/Take`)}
        >
          Start quiz
        </Alert.Link>
      </Alert>
    );
  }

  return (
    <div
      id="wd-quiz-results"
      className="mx-auto"
      style={{ maxWidth: 750 }}
    >
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
        <div>
          <h2 className="mb-1">Last Attempt</h2>
          <div className="text-muted small">
            Submitted on {new Date(attempt.submittedAt).toLocaleString()} ·
            Attempt #{attempt.attemptNumber}
          </div>
        </div>
        <div className="d-flex gap-2 flex-wrap">
          <Button
            variant="outline-secondary"
            onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}`)}
          >
            Back to Quiz Details
          </Button>
          <Button
            variant="danger"
            onClick={() => router.push(`/Courses/${cid}/Quizzes/${qid}/Take`)}
          >
            Retake Quiz
          </Button>
        </div>
      </div>

      <Alert variant="success" className="d-flex justify-content-between">
        <div>
          Score:{" "}
          <Badge bg="primary">
            {attempt.score} / {attempt.maxScore}
          </Badge>{" "}
          ({percentage}%)
        </div>
        <div>
          Attempt #{attempt.attemptNumber}
        </div>
      </Alert>

      <ListGroup>
        {attempt.answers.map((answer, index) => (
          <ListGroup.Item key={answer.questionId} className="mb-3 border-0">
            <Card className="shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <div className="fw-semibold">
                    Question {index + 1}: {answer.questionTitle}
                  </div>
                  <small className="text-muted">
                    {answer.questionType.replace("_", " ")}
                  </small>
                </div>
                <Badge bg="light" text="dark">
                  {answer.points} pts
                </Badge>
              </Card.Header>
              <Card.Body>
                <p>{answer.prompt}</p>

                <div className="mb-3">
                  {answer.questionType === "MULTIPLE_CHOICE" && (
                    <ul className="mb-2">
                      {answer.multipleChoiceOptionsSnapshot?.map((option) => (
                        <li key={option?.id}>
                          {option?.text}{" "}
                          {option?.isCorrect && (
                            <Badge bg="success">Correct answer</Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {answer.questionType === "TRUE_FALSE" && (
                    <p>
                      Correct answer:{" "}
                      <strong>
                        {answer.correctAnswerSummary ?? "Not available"}
                      </strong>
                    </p>
                  )}

                  {answer.questionType === "FILL_BLANK" && (
                    <p>
                      Acceptable answers:{" "}
                      <strong>
                        {answer.correctAnswerSummary ?? "Not available"}
                      </strong>
                    </p>
                  )}
                </div>

                <Alert variant={answer.isCorrect ? "success" : "danger"}>
                  {answer.isCorrect ? "You answered correctly." : "Incorrect."}{" "}
                  {answer.questionType === "MULTIPLE_CHOICE" && (
                    <span>
                      Your answer:{" "}
                      <strong>
                        {answer.selectedChoiceText ?? "No answer selected"}
                      </strong>
                    </span>
                  )}
                  {answer.questionType === "TRUE_FALSE" && (
                    <span>
                      You answered:{" "}
                      <strong>
                        {answer.trueFalseSelection === "TRUE" ? "True" : "False"}
                      </strong>
                    </span>
                  )}
                  {answer.questionType === "FILL_BLANK" && (
                    <span>
                      Your answer:{" "}
                      <strong>{answer.fillBlankResponse || "Not provided"}</strong>
                    </span>
                  )}
                </Alert>
              </Card.Body>
            </Card>
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default QuizResultsPage;
