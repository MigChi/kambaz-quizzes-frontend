"use client";

import { useSelector } from "react-redux";
import { ListGroup } from "react-bootstrap";
import TodoForm from "./TodoForm";
import TodoItem from "./TodoItem";
import { RootState } from "@/app/Labs/store";

export default function TodoList() {
  const todos = useSelector((s: RootState) => s.todos.todos);

  return (
    <div id="wd-todo-list-redux">
      <h2>Todo List</h2>
      <ListGroup>
        <TodoForm />
        {todos.map((t) => (
          <TodoItem key={t.id} todo={t} />
        ))}
      </ListGroup>
      <hr />
    </div>
  );
}
