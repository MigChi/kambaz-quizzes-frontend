'use client';

import { ListGroup } from "react-bootstrap";
import TodoItem from "./TodoItem";
import todos from "./todos.json" assert { type: "json" };

export default function TodoList() {
  return (
    <>
      <h3>Todo List</h3>
      <ListGroup>
        {todos.map((todo, i) => (
          <TodoItem key={i} todo={todo} />
        ))}
      </ListGroup>
      <hr />
    </>
  );
}
