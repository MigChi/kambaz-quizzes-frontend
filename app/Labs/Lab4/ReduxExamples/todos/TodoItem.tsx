"use client";

import { useDispatch } from "react-redux";
import { deleteTodo, setTodo } from "./todosReducer";
import { ListGroup, Button } from "react-bootstrap";
import { AppDispatch } from "@/app/Labs/store";

type Todo = { id: string; title: string };

export default function TodoItem({ todo }: { todo: Todo }) {
  const dispatch = useDispatch<AppDispatch>();

  return (
    <ListGroup.Item className="d-flex justify-content-between align-items-center">
      <span>{todo.title}</span>
      <span className="d-flex gap-2">
        <Button id="wd-set-todo-click" variant="primary" onClick={() => dispatch(setTodo(todo))}>
          Edit
        </Button>
        <Button id="wd-delete-todo-click" variant="danger" onClick={() => dispatch(deleteTodo(todo.id))}>
          Delete
        </Button>
      </span>
    </ListGroup.Item>
  );
}
