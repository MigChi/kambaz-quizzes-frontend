import axios from "axios";
import type { User } from "./reducer";
import type { Course } from "../Courses/[cid]/store/coursesSlice";

export const HTTP_SERVER =
  process.env.NEXT_PUBLIC_HTTP_SERVER || "http://localhost:4000";

export const USERS_API = `${HTTP_SERVER}/api/users`;

const axiosWithCredentials = axios.create({
  withCredentials: true,
});

export type Credentials = {
  username: string;
  password: string;
};

export const signin = async (
  credentials: Credentials
): Promise<User | null> => {
  try {
    const response = await axiosWithCredentials.post<User | null>(
      `${USERS_API}/signin`,
      credentials
    );
    return response.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      return null;
    }
    throw e;
  }
};

export const signup = async (user: Partial<User>): Promise<User | null> => {
  const response = await axiosWithCredentials.post<User | null>(
    `${USERS_API}/signup`,
    user
  );
  return response.data;
};

export const updateUser = async (user: User): Promise<User> => {
  const response = await axiosWithCredentials.put<User>(
    `${USERS_API}/${user._id}`,
    user
  );
  return response.data;
};

export const profile = async (): Promise<User | null> => {
  try {
    const response = await axiosWithCredentials.post<User | null>(
      `${USERS_API}/profile`
    );
    return response.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      return null;
    }
    throw e;
  }
};

export const signout = async (): Promise<void> => {
  await axiosWithCredentials.post(`${USERS_API}/signout`);
};

export const findAllUsers = async (): Promise<User[]> => {
  const response = await axiosWithCredentials.get<User[]>(USERS_API);
  return response.data;
};

export const findMyCourses = async (): Promise<Course[]> => {
  try {
    const response = await axiosWithCredentials.get<Course[]>(
      `${USERS_API}/current/courses`
    );
    return response.data;
  } catch (e: unknown) {
    if (axios.isAxiosError(e) && e.response?.status === 401) {
      return [];
    }
    throw e;
  }
};

export const createCourse = async (
  course: Omit<Course, "_id">
): Promise<Course> => {
  const response = await axiosWithCredentials.post<Course>(
    `${USERS_API}/current/courses`,
    course
  );
  return response.data;
};
