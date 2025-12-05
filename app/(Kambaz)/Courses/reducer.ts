/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice } from "@reduxjs/toolkit";
import { v4 as uuidv4 } from "uuid";

const initialState = {
  // All courses in the system (used by /Courses list, etc.)
  courses: [] as any[],
  // Only the logged-in user's courses (used by Dashboard)
  myCourses: [] as any[],
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    // Set ALL courses
    setCourses: (state, { payload }) => {
      state.courses = payload;
    },

    // Set ONLY the current user's courses
    setMyCourses: (state, { payload }) => {
      state.myCourses = payload;
    },

    addNewCourse: (state, { payload: course }) => {
      const newCourse = { ...course, _id: uuidv4() };
      state.courses = [...state.courses, newCourse];
    },

    deleteCourse: (state, { payload: courseId }) => {
      state.courses = state.courses.filter(
        (course: any) => course._id !== courseId
      );
    },

    updateCourse: (state, { payload: course }) => {
      state.courses = state.courses.map((c: any) =>
        c._id === course._id ? course : c
      );
    },
  },
});

export const {
  setCourses,
  setMyCourses,
  addNewCourse,
  deleteCourse,
  updateCourse,
} = coursesSlice.actions;

export default coursesSlice.reducer;
