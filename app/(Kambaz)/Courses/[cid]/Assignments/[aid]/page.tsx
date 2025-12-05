/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Form, Row, Col, InputGroup, Button } from "react-bootstrap";
import { useParams, useRouter } from "next/navigation";
import { BsCalendar3 } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useMemo, useState } from "react";
import { setAssignments } from "../reducer";
import * as client from "../client";

type FormState = {
  _id?: string;
  title: string;
  description: string;
  points: number;
  dueDate?: string | null;
  availableFrom?: string | null;
  availableUntil?: string | null;
  course: string;
};

export default function AssignmentEditor() {
  const router = useRouter();
  const { cid, aid } = useParams<{ cid: string; aid: string }>();
  const { assignments } = useSelector((s: any) => s.assignmentsReducer);
  const { currentUser } = useSelector((s: any) => s.accountReducer);
  const dispatch = useDispatch();

  const isNew = aid === "new";
  const isFaculty =
    currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";
  const readOnly = !isFaculty;

  const existing = useMemo(
    () => assignments.find((a: any) => a._id === aid),
    [assignments, aid]
  );

  const [form, setForm] = useState<FormState>({
    _id: existing?._id,
    title: existing?.title ?? "",
    description: existing?.description ?? "",
    points: existing?.points ?? 100,
    dueDate: existing?.dueDate ?? null,
    availableFrom: existing?.availableFrom ?? null,
    availableUntil: existing?.availableUntil ?? null,
    course: cid,
  });

  useEffect(() => {
    if (!isNew && !existing) {
      router.push(`/Courses/${cid}/Assignments`);
      return;
    }
    setForm({
      _id: existing?._id,
      title: existing?.title ?? "",
      description: existing?.description ?? "",
      points: existing?.points ?? 100,
      dueDate: existing?.dueDate ?? null,
      availableFrom: existing?.availableFrom ?? null,
      availableUntil: existing?.availableUntil ?? null,
      course: cid,
    });
  }, [existing, cid, isNew, router]);

  const onSave = async () => {
    if (readOnly) return;

    const payload = {
      ...form,
      points: Number(form.points) || 0,
    };

    if (isNew) {
      await client.createAssignment(cid, payload);
    } else {
      await client.updateAssignment(payload);
    }

    // Reload assignments after save
    const serverAssignments = await client.findAssignmentsForCourse(cid);
    dispatch(setAssignments(serverAssignments));

    router.push(`/Courses/${cid}/Assignments`);
  };

  const onCancel = () => {
    router.push(`/Courses/${cid}/Assignments`);
  };

  return (
    <div
      id="wd-assignments-editor"
      style={{ maxWidth: 550 }}
      className="mx-auto"
    >
      <Form>
        {/* Assignment Title */}
        <Form.Label htmlFor="wd-name" as="h2" className="fw-bold mb-2">
          {isNew ? "New Assignment" : form.title || "Assignment"}
        </Form.Label>
        <Form.Control
          id="wd-name"
          className="mb-4"
          value={form.title}
          disabled={readOnly}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        {/* Description */}
        <Form.Control
          id="wd-description"
          as="textarea"
          rows={9}
          className="mb-4"
          value={form.description}
          disabled={readOnly}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        {/* Points */}
        <Row className="align-items-end mb-3">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label htmlFor="wd-points">Points</Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Control
              id="wd-points"
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
        <Row className="align-items-end mb-3">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>Assignment Group</Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Select
              defaultValue="ASSIGNMENTS"
              style={{ maxWidth: 260 }}
              disabled
            >
              <option value="ASSIGNMENTS">ASSIGNMENTS</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Display Grade As */}
        <Row className="align-items-end mb-3">
          <Col sm={4} className="text-sm-end fw-semibold">
            <Form.Label>Display Grade As</Form.Label>
          </Col>
          <Col sm={8}>
            <Form.Select
              defaultValue="PERCENT"
              style={{ maxWidth: 260 }}
              disabled
            >
              <option value="PERCENT">Percentage</option>
            </Form.Select>
          </Col>
        </Row>

        {/* Assign To + Dates */}
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

              {/* Due Date */}
              <div className="mb-3" style={{ maxWidth: 300 }}>
                <Form.Label>Due</Form.Label>
                <InputGroup>
                  <Form.Control
                    type="date"
                    value={form.dueDate ?? ""}
                    disabled={readOnly}
                    onChange={(e) =>
                      setForm({ ...form, dueDate: e.target.value || null })
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
            <Button variant="danger" onClick={onSave} id="wd-save-assignment">
              Save
            </Button>
          )}
        </div>
      </Form>
    </div>
  );
}
