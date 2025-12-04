"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { updateAssignment, deleteAssignment } from "../../store/assignmentsSlice";
import { Form, Row, Col, Card } from "react-bootstrap";
import { useMemo, useState } from "react";
import * as assignmentsClient from "../client"; // ⬅️ NEW: HTTP client

function titleCase(s: string) {
  return s.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function computeDefaults(aid: string) {
  const lower = (aid || "").toLowerCase();
  const quizMatch = lower.match(/^quiz[-_]?(\d+)$/);
  if (quizMatch) return { name: `Q${quizMatch[1]} — Quiz`, group: "QUIZZES", points: 20 };
  if (lower === "midterm" || lower === "final")
    return { name: `${titleCase(lower)} — Exam`, group: "EXAMS", points: 200 };
  return { name: titleCase(lower || "Assignment"), group: "ASSIGNMENTS", points: 100 };
}

export default function AssignmentEditor() {
  const { cid, aid } = (useParams() as { cid?: string; aid?: string });
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((s: RootState) => s.account.currentUser);
  const isFaculty = (user?.role ?? "").toUpperCase() === "FACULTY";

  const assignment = useSelector((s: RootState) =>
    s.assignments.assignments.find((a) => a._id === aid && a.course === cid)
  );

  const defaults = useMemo(() => computeDefaults(aid ?? ""), [aid]);

  const [title, setTitle] = useState<string>(assignment?.title ?? defaults.name);
  const [points, setPoints] = useState<number>(assignment?.points ?? defaults.points);
  const [group, setGroup] = useState<string>(defaults.group);
  const [submission, setSubmission] = useState<string>("ONLINE");

  if (!isFaculty) {
    return (
      <div id="wd-assignments-editor" className="p-3">
        <h1 className="h4 mb-3">{assignment?.title ?? defaults.name}</h1>
        <p className="text-muted">Only faculty can edit assignments.</p>
        <Link href={`/Courses/${cid}/Assignments`} className="btn btn-secondary">
          Back to Assignments
        </Link>
      </div>
    );
  }

  const onSave = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!aid || !cid) return;

    // Persist to server
    const updated = await assignmentsClient.updateAssignment({
      _id: aid,
      course: cid,
      title,
      points,
      // group & submission are UI-only for now; add to type + backend if you want to persist them
    });

    // Keep Redux in sync
    dispatch(updateAssignment(updated));
    router.push(`/Courses/${cid}/Assignments`);
  };

  const onDelete = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!aid || !cid) return;

    // Delete on server
    await assignmentsClient.deleteAssignment(aid);

    // Update Redux
    dispatch(deleteAssignment(aid));
    router.push(`/Courses/${cid}/Assignments`);
  };

  return (
    <div id="wd-assignments-editor">
      <h1 className="h4 mb-3">{title}</h1>
      <Form>
        <Row className="g-3">
          <Col md={8}>
            <Card className="p-3">
              <Form.Group className="mb-3">
                <Form.Label>Assignment Name</Form.Label>
                <Form.Control
                  id="wd-assignment-name"
                  value={title}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTitle(e.target.value)
                  }
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Points</Form.Label>
                <Form.Control
                  id="wd-assignment-points"
                  type="number"
                  value={Number.isFinite(points) ? String(points) : ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setPoints(Number(e.target.value || 0))
                  }
                />
              </Form.Group>

              <div className="d-flex gap-2 flex-wrap">
                <button id="wd-assignment-save" className="btn btn-danger" onClick={onSave}>
                  Save
                </button>
                <Link href={`/Courses/${cid}/Assignments`} className="btn btn-secondary">
                  Cancel
                </Link>
                <button
                  id="wd-delete-assignment"
                  className="btn btn-outline-danger ms-auto"
                  onClick={onDelete}
                >
                  Delete
                </button>
              </div>
            </Card>
          </Col>

          <Col md={4}>
            <div className="d-flex flex-column gap-3">
              <Card className="p-3">
                <div className="fw-semibold mb-2">Assignment Group</div>
                <Form.Select
                  id="wd-assignment-group"
                  value={group}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setGroup(e.target.value)
                  }
                >
                  <option>ASSIGNMENTS</option>
                  <option>QUIZZES</option>
                  <option>EXAMS</option>
                  <option>PROJECT</option>
                </Form.Select>
              </Card>

              <Card className="p-3">
                <div className="fw-semibold mb-2">Submission Type</div>
                <Form.Select
                  id="wd-submission-type"
                  value={submission}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setSubmission(e.target.value)
                  }
                >
                  <option>ONLINE</option>
                  <option>ON PAPER</option>
                  <option>EXTERNAL TOOL</option>
                </Form.Select>
              </Card>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
}
