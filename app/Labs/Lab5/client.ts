import axios from "axios";

const HTTP_SERVER = process.env.NEXT_PUBLIC_HTTP_SERVER;

export type Todo = {
  id: number;
  title: string;
  completed: boolean;
  description?: string;
  editing?: boolean;
};

export const fetchWelcomeMessage = async () => {
  const response = await axios.get(`${HTTP_SERVER}/lab5/welcome`);
  return response.data;
};

const ASSIGNMENT_API = `${HTTP_SERVER}/lab5/assignment`;

export const fetchAssignment = async () => {
  const response = await axios.get(ASSIGNMENT_API);
  return response.data;
};

export const updateTitle = async (title: string) => {
  const response = await axios.get(`${ASSIGNMENT_API}/title/${title}`);
  return response.data;
};

const TODOS_API = `${HTTP_SERVER}/lab5/todos`;

export const fetchTodos = async (): Promise<Todo[]> => {
  const response = await axios.get<Todo[]>(TODOS_API);
  return response.data;
};

export const removeTodo = async (todo: Todo): Promise<Todo[]> => {
  const response = await axios.get<Todo[]>(
    `${TODOS_API}/${todo.id}/delete`
  );
  return response.data;
};

export const createNewTodo = async (): Promise<Todo[]> => {
  const response = await axios.get<Todo[]>(`${TODOS_API}/create`);
  return response.data;
};

export const postNewTodo = async (todo: Partial<Todo>) => {
  const response = await axios.post(`${TODOS_API}`, todo);
  return response.data as Todo;
};

export const deleteTodo = async (todo: Todo): Promise<void> => {
  await axios.delete(`${TODOS_API}/${todo.id}`);
};

export const updateTodo = async (todo: Todo): Promise<void> => {
  await axios.put(`${TODOS_API}/${todo.id}`, todo);
};