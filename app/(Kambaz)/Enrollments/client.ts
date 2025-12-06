import axios from "axios";

const HTTP_SERVER =
  process.env.NEXT_PUBLIC_HTTP_SERVER || "http://localhost:4000";
const ENROLLMENTS_API = `${HTTP_SERVER}/api/enrollments`;

export const findAllEnrollments = async () => {
  const { data } = await axios.get(ENROLLMENTS_API);
  return data;
};

export const enrollUserInCourse = async (userId: string, courseId: string) => {
  const { data } = await axios.post(
    `${HTTP_SERVER}/api/users/${userId}/courses/${courseId}/enroll`
  );
  return data;
};

export const unenrollUserFromCourse = async (userId: string, courseId: string) => {
  const { data } = await axios.delete(
    `${HTTP_SERVER}/api/users/${userId}/courses/${courseId}/enroll`
  );
  return data;
};
