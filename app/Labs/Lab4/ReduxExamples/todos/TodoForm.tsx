import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { addTodo, updateTodo, setTodo } from "./todosReducer";
import { ListGroupItem, Button, FormControl } from "react-bootstrap";
import { RootState } from "@/app/Labs/store";
export default function TodoForm(
) {
  const todo = useSelector((s: RootState) => s.todos.todo);
const dispatch = useDispatch();
return (
<ListGroupItem>
<Button onClick={() => dispatch(addTodo(todo))}
id="wd-add-todo-click"> Add </Button>
<Button onClick={() => dispatch(updateTodo(todo))}
id="wd-update-todo-click"> Update </Button>
<FormControl
defaultValue={todo.title}
onChange={(e) => dispatch(setTodo({ ...todo, title: e.target.value }))}/>
</ListGroupItem>
);}
