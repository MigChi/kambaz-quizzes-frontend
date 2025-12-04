import axios from "axios";
import type { Assignment } from "../store/assignmentsSlice";
import { HTTP_SERVER } from "../../../Account/client";

const COURSES_API = `${HTTP_SERVER}/api/courses`;
const ASSIGNMENTS_API = `${HTTP_SERVER}/api/assignments`;

export const findAssignmentsForCourse = async (
  courseId: string
): Promise<Assignment[]> => {
  const { data } = await axios.get<Assignment[]>(
    `${COURSES_API}/${courseId}/assignments`,
    { withCredentials: true }
  );
  return data;
};

export const createAssignmentForCourse = async (
  courseId: string,
  assignment: Pick<Assignment, "title" | "points" | "dueDate">
): Promise<Assignment> => {
  const { data } = await axios.post<Assignment>(
    `${COURSES_API}/${courseId}/assignments`,
    assignment,
    { withCredentials: true }
  );
  return data;
};

export const deleteAssignment = async (assignmentId: string): Promise<void> => {
  await axios.delete(`${ASSIGNMENTS_API}/${assignmentId}`, {
    withCredentials: true,
  });
};

export const updateAssignment = async (
  assignment: Assignment
): Promise<Assignment> => {
  const { data } = await axios.put<Assignment>(
    `${ASSIGNMENTS_API}/${assignment._id}`,
    assignment,
    { withCredentials: true }
  );
  return data;
};
