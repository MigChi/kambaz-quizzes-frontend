import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Assignment = {
  _id: string;
  title: string;
  description: string;
  points: number;
  course: string;
  dueDate?: string | null;
  availableFrom?: string | null;
  availableUntil?: string | null;
  editing?: boolean;
};

type AssignmentsState = {
  assignments: Assignment[];
};

const initialState: AssignmentsState = {
  assignments: [],
};

const assignmentsSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    setAssignments: (state, action: PayloadAction<Assignment[]>) => {
      state.assignments = action.payload;
    },

    addAssignment: (state, action: PayloadAction<Assignment>) => {
      state.assignments = [...state.assignments, action.payload];
    },

    deleteAssignment: (state, action: PayloadAction<string>) => {
      state.assignments = state.assignments.filter(
        (asmt) => asmt._id !== action.payload
      );
    },

    updateAssignment: (state, action: PayloadAction<Assignment>) => {
      state.assignments = state.assignments.map((asmt) =>
        asmt._id === action.payload._id ? action.payload : asmt
      );
    },

    editAssignment: (state, action: PayloadAction<string>) => {
      state.assignments = state.assignments.map((asmt) =>
        asmt._id === action.payload ? { ...asmt, editing: true } : asmt
      );
    },

    cancelEditAssignment: (state, action: PayloadAction<string>) => {
      state.assignments = state.assignments.map((asmt) =>
        asmt._id === action.payload ? { ...asmt, editing: false } : asmt
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
  cancelEditAssignment,
} = assignmentsSlice.actions;

export default assignmentsSlice.reducer;
