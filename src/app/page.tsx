// 

"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Checkbox, Modal, notification } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import Link from 'next/link'; // <-- ADD THIS
// import { Todo } from "../types"; // Removed, interface is defined below

import { generateTodosFromPrompt } from "@/actions/todoActions"; // <-- Import the AI function

// Define your Todo interface (keep this if you are using TypeScript)
interface Todo {
  id: number;
  title: string;
  completed: boolean;
}

// Add your API endpoint here
const BASE_URL = "https://jsonplaceholder.typicode.com/todos";

/* Removed unused TodoAppPage wrapper and moved AI helper state/functions into TodoList */

// Wrap all logic inside the TodoList component
const TodoList: React.FC = () => {
  // State declarations
  const [todos, setTodos] = useState<Todo[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] = useState<boolean>(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);

  const [successModalTitle, setSuccessModalTitle] = useState<string>("");
  const [successModalMessage, setSuccessModalMessage] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // AI prompt state
  const [aiPrompt, setAiPrompt] = useState<string>("");

  // Filter status state
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Success Modal Display
  const displaySuccessModal = (title: string, message: string) => {
    setSuccessModalTitle(title);
    setSuccessModalMessage(message);
    setShowSuccessModal(true);
  };

  // Helper function to add generated items into the current todos list
  const addGeneratedTodos = (items: string[]) => {
    const newTodos: Todo[] = items.map((text) => ({
      id: Date.now() + Math.random(),
      title: text,
      completed: false,
    }));
    setTodos((prevTodos) => [...newTodos, ...prevTodos]);
  };

  // Fetch Todos
  useEffect(() => {
    const fetchTodos = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Todo[]>(BASE_URL);
        setTodos(response.data.slice(0, 20)); // Limit for testing
      } catch (err: unknown) {
        let errorMessage = "An unknown error occurred.";
        if (err instanceof Error) errorMessage = err.message;
        setError(new Error(errorMessage));
      } finally {
        setLoading(false);
      }
    };
    fetchTodos();
  }, []);

  // Add Todo
  const handleAddTodo = async (values: { title: string }) => {
    try {
      const response = await axios.post<Todo>(BASE_URL, {
        title: values.title,
        completed: false,
        userId: 1,
      });
      const newTodo: Todo = {
        ...response.data,
        id: Math.max(...todos.map((t) => t.id), 200) + 1,
        title: values.title,
      };
      setTodos((prevTodos) => [newTodo, ...prevTodos]);
      setIsAddModalVisible(false);
      displaySuccessModal(
        "Todo Added Successfully!",
        `"${values.title}" has been added.`
      );
    } catch (err: unknown) {
      let msg = "Could not add todo.";
      if (err instanceof Error) msg = err.message;
      notification.error({
        message: "Add Todo Failed",
        description: msg,
      });
    }
  };

  // AI: Generate Todos from prompt
  const handleGenerateTodos = async () => {
    if (!aiPrompt.trim()) return;

    setLoading(true);
    try {
      const newItems = await generateTodosFromPrompt(aiPrompt);
      if (newItems && newItems.length > 0) {
        addGeneratedTodos(newItems);
      }
      setAiPrompt("");
    } catch (error) {
      console.error("Failed to generate todos:", error);
      notification.error({
        message: "AI Generation Failed",
        description: "Could not generate todos from the provided prompt.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Edit Todo
  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setIsEditModalVisible(true);
  };

  const handleUpdateTodo = async (values: { title: string; completed: boolean }) => {
    if (!editingTodo) return;
    try {
      const updatedTodoData: Todo = {
        ...editingTodo,
        title: values.title,
        completed: values.completed,
      };

      await axios.put(`${BASE_URL}/${editingTodo.id}`, updatedTodoData);

      setTodos((prevTodos) =>
        prevTodos.map((todo) =>
          todo.id === editingTodo.id ? updatedTodoData : todo
        )
      );

      setIsEditModalVisible(false);
      setEditingTodo(null);
      displaySuccessModal(
        "Todo Updated Successfully!",
        `"${values.title}" has been updated.`
      );
    } catch (err: unknown) {
      let msg = "Could not update todo.";
      if (err instanceof Error) msg = err.message;
      notification.error({
        message: "Update Todo Failed",
        description: msg,
      });
    }
  };

  // Delete Todo
  const handleDeleteClick = (id: number) => {
    setDeletingTodoId(id);
    setIsDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!deletingTodoId) return;
    try {
      await axios.delete(`${BASE_URL}/${deletingTodoId}`);
      setTodos((prevTodos) =>
        prevTodos.filter((todo) => todo.id !== deletingTodoId)
      );
      setIsDeleteConfirmVisible(false);
      setDeletingTodoId(null);
      displaySuccessModal(
        "Todo Deleted Successfully!",
        "The todo has been removed."
      );
    } catch (err: unknown) {
      let msg = "Could not delete todo.";
      if (err instanceof Error) msg = err.message;
      notification.error({
        message: "Delete Todo Failed",
        description: msg,
      });
    }
  };

  // Filter + Search
  const filteredTodos = todos.filter((todo) => {
    if (filterStatus === "completed" && !todo.completed) return false;
    if (filterStatus === "incomplete" && todo.completed) return false;
    if (
      searchTerm &&
      !todo.title?.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  // Pagination
  const todosPerPage = 5;
  const indexOfLastTodo = currentPage * todosPerPage;
  const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
  const currentTodos = filteredTodos.slice(indexOfFirstTodo, indexOfLastTodo);
  const totalPages = Math.ceil(filteredTodos.length / todosPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Rendering
  if (loading) return <p>Loading...</p>;

  if (error)
    return (
      <div className="todo-list-container">
        <div className="todo-list-wrapper">
          <p className="error-message">Error: {error.message}</p>
          <p>Please check your network connection or try again later.</p>
        </div>
      </div>
    );

  return (
    <>
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>My AI-Powered To-Do List</h1>

        {/* 👇 NEW: AI Helper Input Section */}
        <div style={{ margin: '20px 0', border: '1px solid #ccc', padding: '15px' }}>
          <h2>🧠 AI To-Do Generator</h2>
          <input
            type="text"
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., things to buy for a weekend hike"
            disabled={loading}
            style={{ width: 'calc(100% - 105px)', padding: '8px' }}
          />
          <button
            onClick={handleGenerateTodos}
            disabled={loading}
            style={{ padding: '8px', marginLeft: '5px' }}
          >
            {loading ? 'Generating...' : 'Generate'}
          </button>
        </div>
        {/* 👆 END AI Helper Section */}
      </div>
      <main className="todo-list-container">
        <div className="todo-list-header">
          <h1 className="todo-heading">My Todo List</h1>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ marginRight: "10px", padding: "6px" }}
          >
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="incomplete">Incomplete</option>
          </select>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search todos..."
            style={{ marginRight: "10px", padding: "6px", width: "200px" }}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsAddModalVisible(true)}
          >
            Add Todo
          </Button>
        </div>

        <div className="todo-items">
          {currentTodos.map((todo) => (
            <div key={todo.id} className="todo-item-card">
              <div className="todo-item-card-content">
                <Checkbox checked={todo.completed} disabled />
                <span
                  className={`todo-item-title ${
                    todo.completed ? "completed-text" : ""
                  }`}
                >
                  {todo.title}
                </span>
              </div>
              <div className="todo-card-footer">
                <Button
                  icon={<EditOutlined />}
                  onClick={() => handleEditClick(todo)}
                  className="edit-button"
                >
                  Edit
                </Button>
                <Button
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteClick(todo.id)}
                  className="delete-button"
                >
                  Delete
                </Button>
                <Link href={`/todos/${todo.id}`} className="view-button">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="pagination">
          {[...Array(totalPages).keys()].map((num) => (
            <Button key={num} onClick={() => paginate(num + 1)}>
              {num + 1}
            </Button>
          ))}
        </div>

        <Modal
          open={isDeleteConfirmVisible}
          onOk={confirmDelete}
          onCancel={() => setIsDeleteConfirmVisible(false)}
          okText="Delete"
          cancelText="Cancel"
          okButtonProps={{ danger: true }}
        >
          <p>Are you sure you want to delete this todo?</p>
        </Modal>

        <Modal
          open={showSuccessModal}
          onCancel={() => setShowSuccessModal(false)}
          footer={[
            <Button key="ok" onClick={() => setShowSuccessModal(false)}>
              OK
            </Button>,
          ]}
        >
          <h3>{successModalTitle}</h3>
          <p>{successModalMessage}</p>
        </Modal>

        <Modal
          title="Add Todo"
          open={isAddModalVisible}
          onOk={() => handleAddTodo({ title: '' })}
          onCancel={() => setIsAddModalVisible(false)}
        >
          <input
            type="text"
            placeholder="Enter todo title"
            onChange={(e) => handleAddTodo({ title: e.target.value })}
            style={{ width: '100%' }}
          />
        </Modal>

        <Modal
          title="Edit Todo"
          open={isEditModalVisible}
          onOk={() => handleUpdateTodo({ title: editingTodo?.title || '', completed: editingTodo?.completed || false })}
          onCancel={() => setIsEditModalVisible(false)}
        >
          {editingTodo && (
            <div>
              <input
                type="text"
                value={editingTodo.title}
                onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                style={{ width: '100%', marginBottom: '10px' }}
              />
              <Checkbox
                checked={editingTodo.completed}
                onChange={(e) => setEditingTodo({ ...editingTodo, completed: e.target.checked })}
              >
                Completed
              </Checkbox>
            </div>
          )}
        </Modal>
      </main>
    </>
  );
};

export default TodoList;
