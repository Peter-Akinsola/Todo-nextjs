import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import TodoList from "./pages/TodoList";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";
import TodoDetails from "./pages/TodoDetails";

interface AppProps {
  [key: string]: unknown;
}
const App: React.FC<AppProps> = (props: any) => {
  const [currentTheme, setCurrentTheme] = useState("light");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", currentTheme);
  }, [currentTheme]);

  const toggleTheme = () => {
    setCurrentTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <Router>
      <ErrorBoundary>
        <Routes>
          {/* Cast to any to avoid prop type mismatch when TodoList doesn't declare prop types */}
          <Route path="/" element={<TodoList />} />

          <Route path="/todos/:id" element={<TodoDetails />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
