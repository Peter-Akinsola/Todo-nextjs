// 
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { Todo } from "../types";

const TodoDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [todo, setTodo] = useState<Todo | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchTodo = async () => {
      try {
        const response = await axios.get<Todo>(
          `https://jsonplaceholder.typicode.com/todos/${id}`
        );
        setTodo(response.data);
      } catch (err: unknown) {
        let msg = "An unknown error occurred";
        if (err instanceof Error) msg = err.message;
        setError(new Error(msg));
      } finally {
        setLoading(false);
      }
    };

    fetchTodo();
  }, [id]);

  if (loading) return <p>Loading...</p>;
  if (error)
    return (
      <div className="todo-detail-container">
        <p className="error-message">{error.message}</p>
        <Link to="/">Back to Todo List</Link>
      </div>
    );

  if (!todo) return <p>No Todo found.</p>;

  return (
    <main className="todo-detail-container">
      <div className="todo-detail-wrapper">
        <h2>Todo Details</h2>
        <p>
          <strong>Title:</strong> {todo.title}
        </p>
        <p>
          <strong>ID:</strong> {todo.id}
        </p>
        <p>
          <strong>User ID:</strong> {todo.userId}
        </p>
        <p>
          <strong>Status:</strong>{" "}
          <span
            className={todo.completed ? "status-completed" : "status-pending"}
          >
            {todo.completed ? "Completed" : "Pending"}
          </span>
        </p>
        <Link to="/">Back to Todo List</Link>
      </div>
    </main>
  );
};

export default TodoDetails;
