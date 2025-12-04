import axios from "axios";
import type { User } from "../../../Account/reducer";
import { HTTP_SERVER } from "../../../Account/client";

const COURSES_API = `${HTTP_SERVER}/api/courses`;
const USERS_API = `${HTTP_SERVER}/api/users`;

const axiosWithCredentials = axios.create({
  withCredentials: true,
});

export const fetchUsersForCourse = async (
  courseId: string
): Promise<User[]> => {
  const { data } = await axiosWithCredentials.get<User[]>(
    `${COURSES_API}/${courseId}/users`
  );
  return data;
};

export const enrollUserInCourse = async (
  userId: string,
  courseId: string
) => {
  const { data } = await axiosWithCredentials.post(
    `${USERS_API}/${userId}/courses/${courseId}`
  );
  return data;
};

export const unenrollUserFromCourse = async (
  userId: string,
  courseId: string
) => {
  const { data } = await axiosWithCredentials.delete(
    `${USERS_API}/${userId}/courses/${courseId}`
  );
  return data;
};
