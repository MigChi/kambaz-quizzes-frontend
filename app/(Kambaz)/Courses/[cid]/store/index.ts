import { configureStore } from "@reduxjs/toolkit";
import modules from "./modulesSlice";
import assignments from "./assignmentsSlice";
import courses from "./coursesSlice";
import enrollments from "./enrollmentsSlice";
import account from "../../../Account/reducer";

export const store = configureStore({
  reducer: {
    modules,
    assignments,
    courses,
    enrollments,
    account,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;
