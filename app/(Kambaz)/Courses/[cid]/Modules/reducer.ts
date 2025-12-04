import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { modules as modulesJson } from "../../../Database/index";


export type Lesson = {
  _id: string;
  name: string;
  description?: string;
  module?: string;
};

export type Module = {
  _id: string;
  name: string;
  course: string;
  lessons: Lesson[];
  editing?: boolean;
};

export type ModulesState = {
  modules: Module[];
};

const newId = () => `M${Date.now()}${Math.floor(Math.random() * 1_000_000)}`;

function isLesson(v: unknown): v is Lesson {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o._id === "string" && typeof o.name === "string";
}

function isModule(v: unknown): v is Module {
  if (typeof v !== "object" || v === null) return false;
  const o = v as Record<string, unknown>;
  const core =
    typeof o._id === "string" &&
    typeof o.name === "string" &&
    typeof o.course === "string";

  const l = (o as { lessons?: unknown }).lessons;
  const lessonsOk = l === undefined || (Array.isArray(l) && l.every(isLesson));

  return core && lessonsOk;
}

const initialState: ModulesState = {
  modules: Array.isArray(modulesJson)
    ? (modulesJson as unknown[]).filter(isModule) as Module[]
    : [],
};

const modulesSlice = createSlice({
  name: "modules",
  initialState,
  reducers: {
    addModule: (
      state,
      { payload }: PayloadAction<{ name: string; course: string }>
    ) => {
      state.modules.push({
        _id: newId(),
        lessons: [],
        name: payload.name,
        course: payload.course,
      });
    },

    deleteModule: (state, { payload }: PayloadAction<string>) => {
      state.modules = state.modules.filter((m) => m._id !== payload);
    },

    updateModule: (state, { payload }: PayloadAction<Module>) => {
      state.modules = state.modules.map((m) =>
        m._id === payload._id ? payload : m
      );
    },

    editModule: (state, { payload }: PayloadAction<string>) => {
      state.modules = state.modules.map((m) =>
        m._id === payload ? { ...m, editing: true } : m
      );
    },
  },
});

export const { addModule, deleteModule, updateModule, editModule } =
  modulesSlice.actions;

export default modulesSlice.reducer;
