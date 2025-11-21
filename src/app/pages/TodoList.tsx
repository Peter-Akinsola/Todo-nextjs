// 
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button, Checkbox, Modal, notification } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { Todo } from "../types";




const TodoList: React.FC = () => {
  const BASE_URL = "https://jsonplaceholder.typicode.com/todos";

  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [deletingTodoId, setDeletingTodoId] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);

  const [isAddModalVisible, setIsAddModalVisible] = useState<boolean>(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState<boolean>(false);
  const [isDeleteConfirmVisible, setIsDeleteConfirmVisible] =
    useState<boolean>(false);

  const [successModalTitle, setSuccessModalTitle] = useState<string>("");
  const [successModalMessage, setSuccessModalMessage] = useState<string>("");
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // ✅ Success Modal Display
  const displaySuccessModal = (title: string, message: string) => {
    setSuccessModalTitle(title);
    setSuccessModalMessage(message);
    setShowSuccessModal(true);
  };

  // ✅ Fetch Todos
  useEffect(() => {
    const fetchTodos = async () => {
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

  // ✅ Add Todo
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

  // ✅ Edit Todo
  const handleEditClick = (todo: Todo) => {
    setEditingTodo(todo);
    setIsEditModalVisible(true);
  };

  const handleUpdateTodo = async (values: {
    title: string;
    completed: boolean;
  }) => {
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

  // ✅ Delete Todo
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

  // ✅ Filter + Search
  const filteredTodos = todos.filter((todo) => {
    if (filterStatus === "completed" && !todo.completed) return false;
    if (filterStatus === "incomplete" && todo.completed) return false;
    if (
      searchTerm &&
      !todo.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
      return false;
    return true;
  });

  // ✅ Pagination
  const todosPerPage = 5;
  const indexOfLastTodo = currentPage * todosPerPage;
  const indexOfFirstTodo = indexOfLastTodo - todosPerPage;
  const currentTodos = filteredTodos.slice(indexOfFirstTodo, indexOfLastTodo);
  const totalPages = Math.ceil(filteredTodos.length / todosPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // ✅ Rendering
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
    <main className="todo-list-container">
      <div className="todo-list-header">
        <h1 className="todo-heading">My Todo List</h1>

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
              <Link to={`/todos/${todo.id}`} className="view-button">
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
    </main>
  );
};

export default TodoList;
