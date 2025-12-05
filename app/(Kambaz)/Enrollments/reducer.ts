import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Enrollment = { user: string; course: string };

type EnrollmentsState = {
  enrollments: Enrollment[];
};

const initialState: EnrollmentsState = {
  enrollments: [],
};

const enrollmentsSlice = createSlice({
  name: "enrollments",
  initialState,
  reducers: {
    enroll: (state, { payload }: PayloadAction<Enrollment>) => {
      const { user, course } = payload;
      const exists = state.enrollments.some(
        (e) => e.user === user && e.course === course
      );
      if (!exists) {
        state.enrollments = [...state.enrollments, { user, course }];
      }
    },
    unenroll: (state, { payload }: PayloadAction<Enrollment>) => {
      const { user, course } = payload;
      state.enrollments = state.enrollments.filter(
        (e) => !(e.user === user && e.course === course)
      );
    },
  },
});

export const { enroll, unenroll } = enrollmentsSlice.actions;
export default enrollmentsSlice.reducer;
