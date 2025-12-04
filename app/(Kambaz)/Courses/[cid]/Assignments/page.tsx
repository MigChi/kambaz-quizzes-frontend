"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import {
  addAssignment,
  deleteAssignment,
  setAssignments,
} from "../store/assignmentsSlice";
import { ListGroup } from "react-bootstrap";
import * as assignmentsClient from "./client";

export default function AssignmentsPage() {
  const { cid } = useParams<{ cid: string }>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const user = useSelector((s: RootState) => s.account.currentUser);
  const isFaculty = (user?.role ?? "").toUpperCase() === "FACULTY";

  // After we switch to server-backed assignments, the slice already
  // contains the assignments for this course, so we don't need to filter.
  const assignments = useSelector(
    (s: RootState) => s.assignments.assignments
  );

  // Load assignments for this course from the server
  useEffect(() => {
    const load = async () => {
      if (!cid) return;
      const data = await assignmentsClient.findAssignmentsForCourse(cid);
      dispatch(setAssignments(data));
    };
    void load();
  }, [cid, dispatch]);

  const handleAdd = async () => {
    if (!cid) return;

    const newAssignment = await assignmentsClient.createAssignmentForCourse(
      cid,
      {
        title: "New Assignment",
        points: 100,
        // simple default due date: today
        dueDate: new Date().toISOString().slice(0, 10),
      }
    );

    dispatch(addAssignment(newAssignment));
    router.push(`/Courses/${cid}/Assignments/${newAssignment._id}`);
  };

  const handleDelete = async (id: string) => {
    await assignmentsClient.deleteAssignment(id);
    dispatch(deleteAssignment(id));
  };

  return (
    <div id="wd-assignments">
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="m-0">Assignments</h3>
        {isFaculty && (
          <button
            id="wd-add-assignment-btn"
            className="btn btn-danger"
            onClick={handleAdd}
          >
            + Assignment
          </button>
        )}
      </div>
      <hr />

      <ListGroup id="wd-assignments-list" className="rounded-0">
        {assignments.map((a) => (
          <ListGroup.Item
            key={a._id}
            className="d-flex justify-content-between align-items-center"
          >
            <Link
              href={`/Courses/${cid}/Assignments/${a._id}`}
              className="text-decoration-none"
            >
              {a.title}
            </Link>

            {isFaculty && (
              <button
                id="wd-delete-assignment"
                className="btn btn-outline-danger btn-sm"
                onClick={() => handleDelete(a._id)}
              >
              Delete
              </button>
            )}
          </ListGroup.Item>
        ))}

        {assignments.length === 0 && (
          <div className="text-muted p-3">No assignments yet.</div>
        )}
      </ListGroup>
    </div>
  );
}
