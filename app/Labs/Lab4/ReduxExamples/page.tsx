"use client";
import { Provider } from "react-redux";
import store from "../../store";
import ReduxExamples from "./index";

export default function ReduxExamplesPage() {
  return (
    <Provider store={store}>
      <ReduxExamples />
    </Provider>
  );
}
