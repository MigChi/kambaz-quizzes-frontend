"use client";

import { useEffect, useState } from "react";
import { ListGroup, ListGroupItem, FormControl } from "react-bootstrap";
import { FaTrash, FaPlusCircle, FaPencilAlt } from "react-icons/fa";
import { TiDelete } from "react-icons/ti";
import * as client from "./client";
import type { Todo } from "./client";

const extractErrorMessage = (error: unknown, fallback: string): string => {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const errWithResponse = error as {
      response?: { data?: { message?: string } };
    };
    const message = errWithResponse.response?.data?.message;
    if (typeof message === "string" && message.length > 0) {
      return message;
    }
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return fallback;
};

export default function WorkingWithArraysAsynchronously() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchTodos = async (): Promise<void> => {
    const fetchedTodos = await client.fetchTodos();
    setTodos(fetchedTodos);
    setErrorMessage(null);
  };

  const createNewTodo = async (): Promise<void> => {
    const updatedTodos = await client.createNewTodo();
    setTodos(updatedTodos);
    setErrorMessage(null);
  };

  const postNewTodo = async (): Promise<void> => {
    const newTodo = await client.postNewTodo({
      title: "New Posted Todo",
      completed: false,
    });
    setTodos([...todos, newTodo]);
    setErrorMessage(null);
  };

  const removeTodo = async (todo: Todo): Promise<void> => {
    const updatedTodos = await client.removeTodo(todo);
    setTodos(updatedTodos);
    setErrorMessage(null);
  };

  const deleteTodo = async (todo: Todo): Promise<void> => {
    try {
      await client.deleteTodo(todo);
      const remaining = todos.filter((t) => t.id !== todo.id);
      setTodos(remaining);
      setErrorMessage(null);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Error deleting todo");
      setErrorMessage(message);
    }
  };

  const editTodo = (todo: Todo): void => {
    const updatedTodos = todos.map((t) =>
      t.id === todo.id ? { ...todo, editing: true } : t
    );
    setTodos(updatedTodos);
    setErrorMessage(null);
  };

  const updateTodoInServer = async (todo: Todo): Promise<void> => {
    try {
      await client.updateTodo(todo);
      setTodos(
        todos.map((t) => (t.id === todo.id ? { ...todo } : t))
      );
      setErrorMessage(null);
    } catch (error: unknown) {
      const message = extractErrorMessage(error, "Error updating todo");
      setErrorMessage(message);
    }
  };

  useEffect(() => {
    void fetchTodos();
  }, []);

  return (
    <div id="wd-asynchronous-arrays">
      <h3>Working with Arrays Asynchronously</h3>

      {errorMessage && (
        <div
          id="wd-todo-error-message"
          className="alert alert-danger mb-2 mt-2"
        >
          {errorMessage}
        </div>
      )}

      <h4>
        <FaPlusCircle
          onClick={() => void createNewTodo()}
          className="text-success float-end fs-3"
          id="wd-create-todo"
        />
        <FaPlusCircle
          onClick={() => void postNewTodo()}
          className="text-primary float-end fs-3 me-3"
          id="wd-post-todo"
        />
      </h4>

      <ListGroup>
        {todos.map((todo) => (
          <ListGroupItem key={todo.id}>
            <FaTrash
              onClick={() => void removeTodo(todo)}
              className="text-danger float-end mt-1"
              id="wd-remove-todo"
            />
            <TiDelete
              onClick={() => void deleteTodo(todo)}
              className="text-danger float-end me-2 fs-3"
              id="wd-delete-todo"
            />
            <FaPencilAlt
              onClick={() => editTodo(todo)}
              className="text-primary float-end me-2 mt-1"
            />

            <input
              type="checkbox"
              defaultChecked={todo.completed}
              className="form-check-input me-2 float-start"
              onChange={(e) =>
                void updateTodoInServer({
                  ...todo,
                  completed: e.target.checked,
                })
              }
            />

            {!todo.editing ? (
              <span
                style={{
                  textDecoration: todo.completed ? "line-through" : "none",
                }}
              >
                {todo.title}
              </span>
            ) : (
              <FormControl
                className="w-50 float-start"
                defaultValue={todo.title}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void updateTodoInServer({
                      ...todo,
                      editing: false,
                    });
                  }
                }}
                onChange={(e) =>
                  void updateTodoInServer({
                    ...todo,
                    title: e.target.value,
                  })
                }
              />
            )}
          </ListGroupItem>
        ))}
      </ListGroup>

      <hr />
    </div>
  );
}
