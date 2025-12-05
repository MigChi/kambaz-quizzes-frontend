/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type Quiz = {
  _id: string;
  title: string;
  course: string;
  description?: string;
  points: number;
  published?: boolean;
  quizType?: string;
  assignmentGroup?: string;
  shuffleAnswers?: string; // "Yes" / "No"
  timeLimit?: number | null;
  multipleAttempts?: string; // "Yes" / "No"
  allowedAttempts?: number | null;
  showCorrectAnswers?: string;
  accessCode?: string;
  oneQuestionAtATime?: string; // "Yes" / "No"
  webcamRequired?: string; // "Yes" / "No"
  lockQuestionsAfterAnswering?: string; // "Yes" / "No"
  dueDate?: string | null;
  availableFrom?: string | null;
  availableUntil?: string | null;
  questions?: any[];
};

type QuizzesState = {
  quizzes: Quiz[];
};

const initialState: QuizzesState = {
  quizzes: [],
};

const quizzesSlice = createSlice({
  name: "quizzes",
  initialState,
  reducers: {
    setQuizzes: (state, action: PayloadAction<Quiz[]>) => {
      state.quizzes = action.payload ?? [];
    },
    addQuiz: (state, action: PayloadAction<Quiz>) => {
      state.quizzes = [...state.quizzes, action.payload];
    },
    updateQuiz: (state, action: PayloadAction<Quiz>) => {
      state.quizzes = state.quizzes.map((q) =>
        q._id === action.payload._id ? action.payload : q
      );
    },
    deleteQuiz: (state, action: PayloadAction<string>) => {
      state.quizzes = state.quizzes.filter((q) => q._id !== action.payload);
    },
  },
});

export const { setQuizzes, addQuiz, updateQuiz, deleteQuiz } =
  quizzesSlice.actions;

export default quizzesSlice.reducer;
