import { createSlice } from "@reduxjs/toolkit";
import { enrollments as dbEnrollments } from "../Database";

type Enrollment = { user: string; course: string };

const initialState = {
  enrollments: [...(dbEnrollments as Enrollment[])],
};

const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {
    enroll: (state, { payload }: { payload: { user: string; course: string } }) => {
      const { user, course } = payload;
      const exists = state.enrollments.some((e) => e.user === user && e.course === course);
      if (!exists) {
        state.enrollments = [...state.enrollments, { user, course }];
      }
    },
    unenroll: (state, { payload }: { payload: { user: string; course: string } }) => {
      const { user, course } = payload;
      state.enrollments = state.enrollments.filter(
        (e) => !(e.user === user && e.course === course)
      );
    },
  },
});

export const { enroll, unenroll } = enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;
