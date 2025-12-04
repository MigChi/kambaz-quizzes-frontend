import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Course = {
  _id: string;
  number: string;
  name: string;
  description: string;
  image?: string;
};

export type CoursesState = { courses: Course[] };

const initialState: CoursesState = {
  courses: [],
};

const coursesSlice = createSlice({
  name: "courses",
  initialState,
  reducers: {
    setCourses: (state, { payload }: PayloadAction<Course[]>) => {
      state.courses = payload;
    },
    addCourse: (
      state,
      {
        payload,
      }: PayloadAction<
        Omit<Course, "_id"> & {
          _id?: string;
        }
      >
    ) => {
      const id =
        payload._id ?? `C${Date.now()}${Math.floor(Math.random() * 1_000_000)}`;
      state.courses.unshift({
        _id: id,
        number: payload.number,
        name: payload.name,
        description: payload.description,
        image: payload.image,
      });
    },
    deleteCourse: (state, { payload }: PayloadAction<string>) => {
      state.courses = state.courses.filter((c) => c._id !== payload);
    },
    updateCourse: (state, { payload }: PayloadAction<Course>) => {
      state.courses = state.courses.map((c) =>
        c._id === payload._id ? payload : c
      );
    },
  },
});

export const { setCourses, addCourse, deleteCourse, updateCourse } =
  coursesSlice.actions;
export default coursesSlice.reducer;
