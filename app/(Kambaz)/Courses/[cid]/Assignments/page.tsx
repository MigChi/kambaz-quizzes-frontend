/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { ListGroup, ListGroupItem, Button } from "react-bootstrap";
import AssignmentControls from "./AssignmentControls";
import AssignmentsSectionButtons from "./AssignmentsSectionButtons";
import AssignmentControlButtons from "./AssignmentControlButtons";
import Link from "next/link";
import { BsGripVertical, BsJournalText, BsCaretDownFill, BsTrash } from "react-icons/bs";
import { useParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import {
  deleteAssignment as deleteAssignmentReducer,
  updateAssignment as updateAssignmentReducer,
  addAssignment as addAssignmentReducer,
  setAssignments,
} from "./reducer";
import * as client from "./client";
import { useEffect } from "react";

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const prettyDate = (iso?: string, timeLabel?: string) => {
  if (!iso) return "";
  const d = new Date(iso);
  const month = d.toLocaleString("en-US", { month: "long" });
  const day = ordinal(d.getDate());
  return `${month} ${day}${timeLabel ? ` at ${timeLabel}` : ""}`;
};

export default function Assignments() {
  const { cid } = useParams<{ cid: string }>();
  const dispatch = useDispatch();
  const { assignments } = useSelector((s: any) => s.assignmentsReducer);
  const { currentUser } = useSelector((s: any) => s.accountReducer);
  const isFaculty = currentUser?.role === "FACULTY" || currentUser?.role === "ADMIN";

  useEffect(() => {
    const load = async () => {
      const serverAssignments = await client.findAssignmentsForCourse(cid);
      dispatch(setAssignments(serverAssignments));
    };
    load();
  }, [cid]);

  const courseAssignments = assignments.filter((a: any) => a.course === cid);

  const onDeleteAssignment = async (assignmentId: string) => {
    await client.deleteAssignment(assignmentId);
    dispatch(setAssignments(assignments.filter((a: any) => a._id !== assignmentId)));
  };

  return (
    <div id="wd-assignments">
      {isFaculty && <AssignmentControls />}

      <br />
      <ListGroup className="rounded-0" id="wd-assignments-list">
        <ListGroupItem className="wd-assignments p-0 mb-5 fs-5 border-gray">
          <div className="wd-title p-3 ps-2 bg-secondary">
            <BsGripVertical className="me-2 fs-3" />
            <BsCaretDownFill />
            <b>ASSIGNMENTS</b>
            <AssignmentsSectionButtons />
          </div>

          <ListGroup className="wd-lessons rounded-0">
            {courseAssignments.map((assignment: any) => (
              <ListGroupItem key={assignment._id} className="wd-assignment p-3 ps-1">
                <div className="row align-items-center g-2">
                  <div className="col-auto">
                    <BsGripVertical className="fs-4" />
                    <BsJournalText />
                  </div>

                  <div className="col">
                    <Link href={`/Courses/${cid}/Assignments/${assignment._id}`}
                      className="fw-semibold text-dark text-decoration-none">
                      {assignment.title}
                    </Link>

                    <div className="small text-muted mt-1">
                      <b>Due</b> {prettyDate(assignment.dueDate, "11:59pm")} | {assignment.points} pts
                    </div>
                  </div>

                  {isFaculty && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      title="Delete assignment"
                      onClick={() => onDeleteAssignment(assignment._id)}
                    >
                      <BsTrash />
                    </Button>
                  )}
                </div>
              </ListGroupItem>
            ))}
          </ListGroup>
        </ListGroupItem>
      </ListGroup>
    </div>
  );
}
