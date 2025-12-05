/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  Form,
  Row,
  Col,
  InputGroup,
  Button,
} from "react-bootstrap";
import { BsCalendar3 } from "react-icons/bs";
import * as client from "../client";
import { setQuizzes, updateQuiz } from "../reducer";

type RootState = any;

type FormState = {
  _id?: string;
  course: string;
  title: string;
  description: string;
  quizType: string;
  points: number;
  assignmentGroup: string;
  shuffleAnswers: string; // Yes/No
  timeLimit: number;
  multipleAttempts: string; // Yes/No
  allowedAttempts: number;
  showCorrectAnswers: string;
  accessCode: string;
  oneQuestionAtATime: string; // Yes/No
  webcamRequired: string; // Yes/No
  lockQuestionsAfterAnswering: string; // Yes/No
  dueDate?: string | null;
  availableFrom?: string | null;
  availableUntil?: string | null;
  published?: boolean;
};

const defaultForm = (cid: string): FormState => ({
  _id: undefined,
  course: cid,
  title: "New Quiz",
  description: "",
  quizType: "Graded Quiz",
  points: 10,
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
  published: false,
});

export default function QuizDetailsPage() {
  const router = useRouter();
  const { cid, qid } = useParams<{ cid: string; qid: string }>();

  const dispatch = useDispatch();
  const { quizzes } = useSelector((s: RootState) => s.quizzesReducer);
  const { currentUser } = useSelector((s: RootState) => s.accountReducer);

  const isFaculty =
    currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";
  const readOnly = !isFaculty;

  const existing = useMemo(
    () => quizzes.find((q: any) => q._id === qid),
    [quizzes, qid]
  );

  const [form, setForm] = useState<FormState>(() =>
    existing
      ? {
          _id: existing._id,
          course: existing.course ?? cid,
          title: existing.title ?? "New Quiz",
          description: existing.description ?? "",
          quizType: existing.quizType ?? "Graded Quiz",
          points: existing.points ?? 10,
          assignmentGroup: existing.assignmentGroup ?? "Quizzes",
          shuffleAnswers: existing.shuffleAnswers ?? "Yes",
          timeLimit: existing.timeLimit ?? 20,
          multipleAttempts: existing.multipleAttempts ?? "No",
          allowedAttempts: existing.allowedAttempts ?? 1,
          showCorrectAnswers: existing.showCorrectAnswers ?? "",
          accessCode: existing.accessCode ?? "",
          oneQuestionAtATime: existing.oneQuestionAtATime ?? "Yes",
          webcamRequired: existing.webcamRequired ?? "No",
          lockQuestionsAfterAnswering:
            existing.lockQuestionsAfterAnswering ?? "No",
          dueDate: existing.dueDate ?? null,
          availableFrom: existing.availableFrom ?? null,
          availableUntil: existing.availableUntil ?? null,
          published: existing.published ?? false,
        }
      : defaultForm(cid)
  );

  // If direct nav, reload the quiz from server
  useEffect(() => {
    const load = async () => {
      if (!qid || existing) return;
      try {
        const quiz = await client.findQuizById(qid);
        dispatch(setQuizzes([quiz]));
      } catch (e) {
        console.error("Failed to load quiz:", e);
      }
    };
    load();
  }, [qid, existing, dispatch]);

  // Keep local form in sync when existing changes
  useEffect(() => {
    if (!existing) return;
    setForm((prev) => ({
      ...prev,
      _id: existing._id,
      course: existing.course ?? cid,
      title: existing.title ?? prev.title,
      description: existing.description ?? prev.description,
      quizType: existing.quizType ?? prev.quizType,
      points: existing.points ?? prev.points,
      assignmentGroup: existing.assignmentGroup ?? prev.assignmentGroup,
      shuffleAnswers: existing.shuffleAnswers ?? prev.shuffleAnswers,
      timeLimit: existing.timeLimit ?? prev.timeLimit,
      multipleAttempts: existing.multipleAttempts ?? prev.multipleAttempts,
      allowedAttempts: existing.allowedAttempts ?? prev.allowedAttempts,
      showCorrectAnswers: existing.showCorrectAnswers ?? prev.showCorrectAnswers,
      accessCode: existing.accessCode ?? prev.accessCode,
      oneQuestionAtATime:
        existing.oneQuestionAtATime ?? prev.oneQuestionAtATime,
      webcamRequired: existing.webcamRequired ?? prev.webcamRequired,
      lockQuestionsAfterAnswering:
        existing.lockQuestionsAfterAnswering ?? prev.lockQuestionsAfterAnswering,
      dueDate: existing.dueDate ?? prev.dueDate,
      availableFrom: existing.availableFrom ?? prev.availableFrom,
      availableUntil: existing.availableUntil ?? prev.availableUntil,
      published: existing.published ?? prev.published,
    }));
  }, [existing, cid]);

  const onSave = async () => {
    if (readOnly) return;
    if (!form._id) {
      // Shouldn't happen when coming from +Quiz, but just in case
      return;
    }

    const payload = {
      ...form,
      points: Number(form.points) || 0,
      timeLimit: Number(form.timeLimit) || 0,
      allowedAttempts: Number(form.allowedAttempts) || 1,
    };

    try {
      const updated = await client.updateQuiz(payload);
      dispatch(updateQuiz(updated));
      router.push(`/Courses/${cid}/Quizzes`);
    } catch (e) {
      console.error("Failed to save quiz:", e);
    }
  };

  const onCancel = () => {
    router.push(`/Courses/${cid}/Quizzes`);
  };

  const onStartQuiz = () => {
    // Placeholder – quiz-taking flow comes later
    // eslint-disable-next-line no-console
    console.log("Start quiz", qid);
  };

  return (
    <div
      id="wd-quiz-editor"
      style={{ maxWidth: 650 }}
      className="mx-auto"
    >
      <Form>
        {/* Title */}
        <Form.Label htmlFor="wd-quiz-title" as="h2" className="fw-bold mb-2">
          {form.title || "Quiz"}
        </Form.Label>
        <Form.Control
          id="wd-quiz-title"
          className="mb-4"
          value={form.title}
          disabled={readOnly}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        {/* Description */}
        <Form.Control
          id="wd-quiz-description"
          as="textarea"
          rows={5}
          className="mb-4"
          value={form.description}
          disabled={readOnly}
          onChange={(e) =>
            setForm({ ...form, description: e.target.value })
          }
        />

        {/* Quiz Type */}
        <Row className="align-items-center mb-3">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>Quiz Type</Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Select
              value={form.quizType}
              disabled={readOnly}
              onChange={(e) =>
                setForm({ ...form, quizType: e.target.value })
              }
            >
              <option>Graded Quiz</option>
              <option>Practice Quiz</option>
              <option>Graded Survey</option>
              <option>Ungraded Survey</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Points */}
        <Row className="align-items-center mb-3">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>Points</Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Control
              type="number"
              value={form.points}
              disabled={readOnly}
              onChange={(e) =>
                setForm({ ...form, points: Number(e.target.value) })
              }
              style={{ maxWidth: 180 }}
            />
          </Col>
        </Row>

        {/* Assignment Group */}
        <Row className="align-items-center mb-3">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>Assignment Group</Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Select
              value={form.assignmentGroup}
              disabled={readOnly}
              onChange={(e) =>
                setForm({ ...form, assignmentGroup: e.target.value })
              }
              style={{ maxWidth: 260 }}
            >
              <option>Quizzes</option>
              <option>Exams</option>
              <option>Assignments</option>
              <option>Project</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Shuffle Answers */}
        <Row className="align-items-center mb-3">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>Shuffle Answers</Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Select
              value={form.shuffleAnswers}
              disabled={readOnly}
              onChange={(e) =>
                setForm({ ...form, shuffleAnswers: e.target.value })
              }
              style={{ maxWidth: 260 }}
            >
              <option>Yes</option>
              <option>No</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Time Limit */}
        <Row className="align-items-center mb-3">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>Time Limit</Form.Label>
          </Col>
          <Col sm={8}>
            <InputGroup style={{ maxWidth: 260 }}>
              <Form.Control
                type="number"
                value={form.timeLimit}
                disabled={readOnly}
                onChange={(e) =>
                  setForm({
                    ...form,
                    timeLimit: Number(e.target.value) || 0,
                  })
                }
              />
              <InputGroup.Text>Minutes</InputGroup.Text>
            </InputGroup>
          </Col>
        </Row>

        {/* Multiple Attempts */}
        <Row className="align-items-center mb-3">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>Multiple Attempts</Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Select
              value={form.multipleAttempts}
              disabled={readOnly}
              onChange={(e) =>
                setForm({ ...form, multipleAttempts: e.target.value })
              }
              style={{ maxWidth: 260 }}
            >
              <option>No</option>
              <option>Yes</option>
            </Form.Select>
          </Col>
        </Row>

        {/* How Many Attempts */}
        <Row className="align-items-center mb-3">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>How Many Attempts</Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Control
              type="number"
              value={form.allowedAttempts}
              disabled={readOnly || form.multipleAttempts === "No"}
              onChange={(e) =>
                setForm({
                  ...form,
                  allowedAttempts: Number(e.target.value) || 1,
                })
              }
              style={{ maxWidth: 180 }}
            />
          </Col>
        </Row>

        {/* Show Correct Answers */}
        <Row className="align-items-center mb-3">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>Show Correct Answers</Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Control
              type="text"
              value={form.showCorrectAnswers}
              disabled={readOnly}
              onChange={(e) =>
                setForm({
                  ...form,
                  showCorrectAnswers: e.target.value,
                })
              }
            />
          </Col>
        </Row>

        {/* Access Code */}
        <Row className="align-items-center mb-3">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>Access Code</Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Control
              type="text"
              value={form.accessCode}
              disabled={readOnly}
              onChange={(e) =>
                setForm({ ...form, accessCode: e.target.value })
              }
              style={{ maxWidth: 260 }}
            />
          </Col>
        </Row>

        {/* One Question at a Time */}
        <Row className="align-items-center mb-3">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>One Question at a Time</Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Select
              value={form.oneQuestionAtATime}
              disabled={readOnly}
              onChange={(e) =>
                setForm({
                  ...form,
                  oneQuestionAtATime: e.target.value,
                })
              }
              style={{ maxWidth: 260 }}
            >
              <option>Yes</option>
              <option>No</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Webcam Required */}
        <Row className="align-items-center mb-3">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>Webcam Required</Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Select
              value={form.webcamRequired}
              disabled={readOnly}
              onChange={(e) =>
                setForm({ ...form, webcamRequired: e.target.value })
              }
              style={{ maxWidth: 260 }}
            >
              <option>No</option>
              <option>Yes</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Lock Questions After Answering */}
        <Row className="align-items-center mb-4">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>Lock Questions After Answering</Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Select
              value={form.lockQuestionsAfterAnswering}
              disabled={readOnly}
              onChange={(e) =>
                setForm({
                  ...form,
                  lockQuestionsAfterAnswering: e.target.value,
                })
              }
              style={{ maxWidth: 260 }}
            >
              <option>No</option>
              <option>Yes</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Dates panel */}
        <Row className="mb-4">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>Assign</Form.Label>
          </Col>
          <Col sm={8}>
            <div className="border rounded p-3">
              <Form.Group className="mb-3">
                <Form.Label>Assign to</Form.Label>
                <Form.Control defaultValue="Everyone" disabled />
              </Form.Group>

              {/* Due */}
              <div className="mb-3" style={{ maxWidth: 300 }}>
                <Form.Label>Due</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="date"
                    value={form.dueDate ?? ""}
                    disabled={readOnly}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        dueDate: e.target.value || null,
                      })
                    }
                  />
                  <InputGroup.Text>
                    <BsCalendar3 />
                  </InputGroup.Text>
                </InputGroup>
              </div>

              {/* Available From / Until */}
              <Row className="g-3">
                <Col md={6}>
                  <Form.Label>Available From</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="date"
                      value={form.availableFrom ?? ""}
                      disabled={readOnly}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          availableFrom: e.target.value || null,
                        })
                      }
                    />
                    <InputGroup.Text>
                      <BsCalendar3 />
                    </InputGroup.Text>
                  </InputGroup>
                </Col>

                <Col md={6}>
                  <Form.Label>Until</Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="date"
                      value={form.availableUntil ?? ""}
                      disabled={readOnly}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          availableUntil: e.target.value || null,
                        })
                      }
                    />
                    <InputGroup.Text>
                      <BsCalendar3 />
                    </InputGroup.Text>
                  </InputGroup>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* Buttons */}
        <div className="d-flex justify-content-end gap-2">
          <Button variant="light" onClick={onCancel}>
            Cancel
          </Button>

          {!readOnly && (
            <Button
              variant="danger"
              onClick={onSave}
              id="wd-save-quiz"
            >
              Save
            </Button>
          )}

          {readOnly && currentUser?.role === "STUDENT" && (
            <Button
              variant="primary"
              onClick={onStartQuiz}
              id="wd-start-quiz"
            >
              Start Quiz
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
}
