/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";

const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER;
const COURSES_API = `${HTTP_SERVER}/api/courses`;
const QUIZZES_API = `${HTTP_SERVER}/api/quizzes`;

// All quizzes for a course
export const findQuizzesForCourse = async (courseId: string) => {
  const { data } = await axios.get(`${COURSES_API}/${courseId}/quizzes`);
  return data;
};

// Single quiz by ID
export const findQuizById = async (quizId: string) => {
  const { data } = await axios.get(`${QUIZZES_API}/${quizId}`);
  return data;
};

// Create quiz for a course
export const createQuizForCourse = async (
  courseId: string,
  quiz: any
) => {
  const { data } = await axios.post(
    `${COURSES_API}/${courseId}/quizzes`,
    quiz
  );
  return data;
};

// Update quiz
export const updateQuiz = async (quiz: any) => {
  const { data } = await axios.put(
    `${QUIZZES_API}/${quiz._id}`,
    quiz
  );
  return data;
};

// Delete quiz
export const deleteQuiz = async (quizId: string) => {
  const { data } = await axios.delete(`${QUIZZES_API}/${quizId}`);
  return data;
};
