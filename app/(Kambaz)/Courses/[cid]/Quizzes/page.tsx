/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ListGroup,
  ListGroupItem,
  Button,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import {
  BsGripVertical,
  BsJournalText,
  BsCaretDownFill,
} from "react-icons/bs";
import { IoEllipsisVertical } from "react-icons/io5";
import { FaPlus } from "react-icons/fa6";
import * as client from "./client";
import {
  setQuizzes,
  addQuiz,
  updateQuiz,
  deleteQuiz,
  Quiz,
} from "./reducer";

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"],
    v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const prettyDate = (iso?: string | null, timeLabel?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "long" });
  const day = ordinal(d.getDate());
  return `${month} ${day}${timeLabel ? ` at ${timeLabel}` : ""}`;
};

const availabilityStatus = (quiz: Quiz) => {
  const now = new Date();
  const from = quiz.availableFrom ? new Date(quiz.availableFrom) : null;
  const until = quiz.availableUntil ? new Date(quiz.availableUntil) : null;

  if (from && now < from) {
    return `Not available until ${prettyDate(quiz.availableFrom ?? undefined)}`;
  }
  if (until && now > until) {
    return "Closed";
  }
  if (from && now >= from && (!until || now <= until)) {
    return "Available";
  }
  return "Available";
};

type RootState = any;

export default function QuizzesPage() {
  const router = useRouter();
  const { cid } = useParams<{ cid: string }>();
  const dispatch = useDispatch();
  const { quizzes } = useSelector((s: RootState) => s.quizzesReducer);
  const { currentUser } = useSelector((s: RootState) => s.accountReducer);

  const isFaculty =
    currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";
  const isStudent = currentUser?.role === "STUDENT";

  const [sortBy, setSortBy] = useState<
    "DEFAULT" | "TITLE" | "DUE" | "AVAILABLE"
  >("DEFAULT");

  useEffect(() => {
    const load = async () => {
      if (!cid) return;
      try {
        const serverQuizzes = await client.findQuizzesForCourse(cid);
        dispatch(setQuizzes(serverQuizzes ?? []));
      } catch (e) {
        console.error("Error loading quizzes:", e);
        dispatch(setQuizzes([]));
      }
    };
    load();
  }, [cid, dispatch]);

  const sortedQuizzes: Quiz[] = useMemo(() => {
    const all = Array.isArray(quizzes) ? quizzes.filter(Boolean) : [];

    // ⭐ STUDENT FILTER: students only see published quizzes
    const visible = isStudent
      ? all.filter((q) => q && q.published)
      : all;

    const list = [...visible];

    if (sortBy === "TITLE") {
      return list.sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    }
    if (sortBy === "DUE") {
      return list.sort((a, b) => {
        const da = a.dueDate
          ? new Date(a.dueDate).getTime()
          : Number.MAX_SAFE_INTEGER;
        const db = b.dueDate
          ? new Date(b.dueDate).getTime()
          : Number.MAX_SAFE_INTEGER;
        return da - db;
      });
    }
    if (sortBy === "AVAILABLE") {
      return list.sort((a, b) => {
        const da = a.availableFrom
          ? new Date(a.availableFrom).getTime()
          : Number.MAX_SAFE_INTEGER;
        const db = b.availableFrom
          ? new Date(b.availableFrom).getTime()
          : Number.MAX_SAFE_INTEGER;
        return da - db;
      });
    }
    return list;
  }, [quizzes, sortBy, isStudent]);

  const handleAddQuiz = async () => {
    if (!cid || !isFaculty) return;

    const defaultQuiz: Partial<Quiz> = {
      title: "New Quiz",
      course: cid,
      description: "",
      points: 10,
      published: false,
      quizType: "Graded Quiz",
      assignmentGroup: "Quizzes",
      shuffleAnswers: "Yes",
      timeLimit: 20,
      multipleAttempts: "No",
      allowedAttempts: 1,
      showCorrectAnswers: "",
      accessCode: "",
      oneQuestionAtATime: "Yes",
      webcamRequired: "No",
      lockQuestionsAfterAnswering: "No",
      dueDate: null,
      availableFrom: null,
      availableUntil: null,
    };

    try {
      const created = await client.createQuizForCourse(cid, defaultQuiz);
      dispatch(addQuiz(created));
      // faculty goes straight to editor for the new quiz
      router.push(`/Courses/${cid}/Quizzes/${created._id}/Edit`);
    } catch (e) {
      console.error("Failed to create quiz:", e);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    try {
      await client.deleteQuiz(quizId);
      dispatch(deleteQuiz(quizId));
    } catch (e) {
      console.error("Failed to delete quiz:", e);
    }
  };

  const handleTogglePublish = async (quiz: Quiz) => {
    try {
      const updatedPayload = { ...quiz, published: !quiz.published };
      const updated = await client.updateQuiz(updatedPayload);
      dispatch(updateQuiz(updated));
    } catch (e) {
      console.error("Failed to toggle publish:", e);
    }
  };

  return (
    <div id="wd-quizzes">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>Quizzes</h2>

        {isFaculty && (
          <div className="d-flex gap-2">
            <DropdownButton
              id="wd-quizzes-sort"
              variant="secondary"
              title={`Sort: ${
                sortBy === "DEFAULT"
                  ? "Default"
                  : sortBy === "TITLE"
                  ? "Name"
                  : sortBy === "DUE"
                  ? "Due Date"
                  : "Available Date"
              }`}
              size="sm"
            >
              <Dropdown.Item onClick={() => setSortBy("DEFAULT")}>
                Default order
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortBy("TITLE")}>
                Name
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortBy("DUE")}>
                Due date
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setSortBy("AVAILABLE")}>
                Available date
              </Dropdown.Item>
            </DropdownButton>

            <Button
              variant="danger"
              size="sm"
              id="wd-add-quiz"
              onClick={handleAddQuiz}
              className="d-inline-flex align-items-center"
            >
              <FaPlus className="me-2" /> Quiz
            </Button>
          </div>
        )}
      </div>

      {sortedQuizzes.length === 0 && (
        <p className="text-muted">
          {isStudent
            ? "No published quizzes are available yet."
            : "No quizzes yet. Click “+ Quiz” to add one."}
        </p>
      )}

      {sortedQuizzes.length > 0 && (
        <ListGroup className="rounded-0" id="wd-quizzes-list">
          <ListGroupItem className="wd-quizzes-header p-3 mb-3 bg-secondary text-white">
            <BsGripVertical className="me-2 fs-5" />
            <BsCaretDownFill className="me-2" />
            <b>QUIZZES</b>
          </ListGroupItem>

          {sortedQuizzes.map((quiz, index) => {
            if (!quiz) return null;

            const numQuestions =
              (quiz.questions && quiz.questions.length) || 0;

            const key =
              quiz._id ??
              `${quiz.title || "quiz"}-${quiz.course || cid}-${index}`;

            return (
              <ListGroupItem
                key={key}
                className="wd-quiz p-3 ps-1"
              >
                <div className="row align-items-center g-3">
                  <div className="col-auto">
                    <BsGripVertical className="fs-4 me-1" />
                    <BsJournalText className="fs-5" />
                  </div>

                  <div className="col">
                    <div className="d-flex align-items-center gap-2">
                      {/* Published / Unpublished toggle */}
                      {isFaculty && (
                        <span
                          role="button"
                          aria-label={
                            quiz.published ? "Unpublish quiz" : "Publish quiz"
                          }
                          onClick={() => handleTogglePublish(quiz)}
                          className="me-1"
                        >
                          {quiz.published ? "✅" : "🚫"}
                        </span>
                      )}

                      {!isFaculty && (
                        <span className="me-1">
                          {quiz.published ? "✅" : "🚫"}
                        </span>
                      )}

                      {/* Title → Details screen */}
                      <Link
                        href={`/Courses/${cid}/Quizzes/${quiz._id}`}
                        className="fw-semibold text-dark text-decoration-none"
                      >
                        {quiz.title}
                      </Link>
                    </div>

                    <div className="small text-muted mt-1">
                      {availabilityStatus(quiz)}
                    </div>

                    <div className="small text-muted">
                      <b>Due</b>{" "}
                      {prettyDate(quiz.dueDate ?? undefined, "11:59pm")}{" "}
                      | <b>Points</b> {quiz.points ?? 0} |{" "}
                      <b>Questions</b> {numQuestions}
                      {currentUser?.role === "STUDENT" && (
                        <>
                          {" "}
                          | <b>Score</b> --
                        </>
                      )}
                    </div>
                  </div>

                  {/* Context menu only for faculty */}
                  {isFaculty && (
                    <div className="col-auto">
                      <Dropdown align="end">
                        <Dropdown.Toggle
                          variant="light"
                          size="sm"
                          id={`wd-quiz-actions-${key}`}
                          className="border-0"
                        >
                          <IoEllipsisVertical />
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item
                            onClick={() =>
                              router.push(
                                `/Courses/${cid}/Quizzes/${quiz._id}/Edit`
                              )
                            }
                          >
                            Edit
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleDeleteQuiz(quiz._id!)}
                          >
                            Delete
                          </Dropdown.Item>
                          <Dropdown.Item
                            onClick={() => handleTogglePublish(quiz)}
                          >
                            {quiz.published ? "Unpublish" : "Publish"}
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>
                  )}
                </div>
              </ListGroupItem>
            );
          })}
        </ListGroup>
      )}
    </div>
  );
}
