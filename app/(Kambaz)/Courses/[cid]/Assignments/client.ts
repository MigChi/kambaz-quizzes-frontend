/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const HTTP_SERVER =
  process.env.NEXT_PUBLIC_HTTP_SERVER || "http://localhost:4000";
const COURSES_API = `${HTTP_SERVER}/api/courses`;
const ASSIGNMENTS_API = `${HTTP_SERVER}/api/assignments`;

// Get all assignments for a course
export const findAssignmentsForCourse = async (courseId: string) => {
  const { data } = await axios.get(
    `${COURSES_API}/${courseId}/assignments`
  );
  return data;
};

// Get single assignment (not strictly required by your current UI, but useful)
export const findAssignmentById = async (assignmentId: string) => {
  const { data } = await axios.get(
    `${ASSIGNMENTS_API}/${assignmentId}`
  );
  return data;
};

// Create an assignment for a course
export const createAssignment = async (courseId: string, assignment: any) => {
  const { data } = await axios.post(
    `${COURSES_API}/${courseId}/assignments`,
    assignment
  );
  return data;
};

// Update an assignment
export const updateAssignment = async (assignment: any) => {
  const { data } = await axios.put(
    `${ASSIGNMENTS_API}/${assignment._id}`,
    assignment
  );
  return data;
};

// Delete an assignment
export const deleteAssignment = async (assignmentId: string) => {
  const { data } = await axios.delete(
    `${ASSIGNMENTS_API}/${assignmentId}`
  );
  return data;
};
