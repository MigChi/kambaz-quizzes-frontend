import axios from "axios";
import type { Course } from "./[cid]/store/coursesSlice";
import type { Module } from "./[cid]/store/modulesSlice";
import { HTTP_SERVER } from "../Account/client";

const COURSES_API = `${HTTP_SERVER}/api/courses`;
const USERS_API = `${HTTP_SERVER}/api/users`;

const axiosWithCredentials = axios.create({
  withCredentials: true,
});

export const fetchAllCourses = async (): Promise<Course[]> => {
  const { data } = await axios.get<Course[]>(COURSES_API, {
    withCredentials: true,
  });
  return data;
};

export const deleteCourse = async (id: string): Promise<void> => {
  await axios.delete(`${COURSES_API}/${id}`, { withCredentials: true });
};

export const updateCourse = async (
  courseId: string,
  updates: Partial<Course>
): Promise<Course> => {
  const { data } = await axios.put<Course>(
    `${COURSES_API}/${courseId}`,
    updates,
    { withCredentials: true }
  );
  return data;
};

export const findModulesForCourse = async (
  courseId: string
): Promise<Module[]> => {
  const { data } = await axios.get<Module[]>(
    `${COURSES_API}/${courseId}/modules`,
    { withCredentials: true }
  );
  return data;
};

export const createModuleForCourse = async (
  courseId: string,
  module: { name: string; course: string }
): Promise<Module> => {
  const { data } = await axios.post<Module>(
    `${COURSES_API}/${courseId}/modules`,
    module,
    { withCredentials: true }
  );
  return data;
};

export const findUsersForCourse = async (courseId: string) => {
  const { data } = await axios.get(`${COURSES_API}/${courseId}/users`, {
    withCredentials: true,
  });
  return data;
};

export const enrollIntoCourse = async (userId: string, courseId: string) => {
  const { data } = await axiosWithCredentials.post(
    `${USERS_API}/${userId}/courses/${courseId}`
  );
  return data;
};

export const unenrollFromCourse = async (userId: string, courseId: string) => {
  const { data } = await axiosWithCredentials.delete(
    `${USERS_API}/${userId}/courses/${courseId}`
  );
  return data;
};
