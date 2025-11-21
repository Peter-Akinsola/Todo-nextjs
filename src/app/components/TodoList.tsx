import React from "react";

interface TodoListProps {
  toggleTheme: () => void;
  currentTheme: string;
}

const TodoList: React.FC<TodoListProps> = ({ toggleTheme, currentTheme }) => {
  return (
    <div className={`todo-list ${currentTheme}`}>
      <h1>My TODO App</h1>
      <button onClick={toggleTheme}>Toggle Theme</button>
      {/* ✅ Add your todo content below */}
      <p>Current theme: {currentTheme}</p>
    </div>
  );
};

export default TodoList;
