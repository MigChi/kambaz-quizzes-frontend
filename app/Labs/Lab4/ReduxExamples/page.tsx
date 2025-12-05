import HelloRedux from "../ReduxExamples/HelloRedux";
import CounterRedux from "../ReduxExamples/CounterRedux";
import AddRedux from "../ReduxExamples/AddRedux";
import TodoList from "./todos/TodoList";

export default function ReduxExamples() {
  return(
    <div>
      <h2>Redux Examples</h2>
      <HelloRedux/>
      <CounterRedux/>
      <AddRedux/>
      <TodoList/>
    </div>
  );
};

