import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Assignment = {
  _id: string;
  title: string;
  course: string;
  points?: number;
  dueDate?: string;
  editing?: boolean;
};

export type AssignmentsState = {
  assignments: Assignment[];
};

const initialState: AssignmentsState = {
  assignments: [],
};

const assignmentsSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    setAssignments: (state, { payload }: PayloadAction<Assignment[]>) => {
      state.assignments = payload;
    },

    addAssignment: (state, { payload }: PayloadAction<Assignment>) => {
      state.assignments.push(payload);
    },

    deleteAssignment: (state, { payload }: PayloadAction<string>) => {
      state.assignments = state.assignments.filter((a) => a._id !== payload);
    },

    updateAssignment: (state, { payload }: PayloadAction<Assignment>) => {
      state.assignments = state.assignments.map((a) =>
        a._id === payload._id ? payload : a
      );
    },

    editAssignment: (state, { payload }: PayloadAction<string>) => {
      state.assignments = state.assignments.map((a) =>
        a._id === payload ? { ...a, editing: true } : a
      );
    },

    clearEditAssignment: (state, { payload }: PayloadAction<string>) => {
      state.assignments = state.assignments.map((a) =>
        a._id === payload ? { ...a, editing: false } : a
      );
    },
  },
});

export const {
  setAssignments,
  addAssignment,
  deleteAssignment,
  updateAssignment,
  editAssignment,
  clearEditAssignment,
} = assignmentsSlice.actions;

export default assignmentsSlice.reducer;
