"use client";

import React from "react";
import { useDispatch } from "react-redux";
import { deleteTodo, setTodo } from "./todosReducer";
import { ListGroupItem, Button } from "react-bootstrap";

export type Todo = {
  id: string;
  title: string;
};

type Props = { todo: Todo };

export default function TodoItem({ todo }: Props) {
  const dispatch = useDispatch();

  return (
    <ListGroupItem>
      <Button
        onClick={() => dispatch(deleteTodo(todo.id))}
        id="wd-delete-todo-click"
        className="me-2"
      >
        Delete
      </Button>
      <Button
        onClick={() => dispatch(setTodo(todo))}
        id="wd-set-todo-click"
        className="me-2"
      >
        Edit
      </Button>
      {todo.title}
    </ListGroupItem>
  );
}
