import axios from "axios";
import type { Module } from "../store/modulesSlice";
import { HTTP_SERVER } from "../../../Account/client";

const COURSES_API = `${HTTP_SERVER}/api/courses`;

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
  module: Pick<Module, "name">
): Promise<Module> => {
  const { data } = await axios.post<Module>(
    `${COURSES_API}/${courseId}/modules`,
    module,
    { withCredentials: true }
  );
  return data;
};

export const deleteModule = async (
  courseId: string,
  moduleId: string
): Promise<void> => {
  await axios.delete(`${COURSES_API}/${courseId}/modules/${moduleId}`, {
    withCredentials: true,
  });
};

export const updateModule = async (
  courseId: string,
  module: Module
): Promise<Module> => {
  const { data } = await axios.put<Module>(
    `${COURSES_API}/${courseId}/modules/${module._id}`,
    module,
    {
      withCredentials: true,
    }
  );
  return data;
};
