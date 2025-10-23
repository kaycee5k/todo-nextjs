"use client";

import { useState, useEffect } from "react";

export default function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/todos", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch todos");
      const data = await res.json();
      setTodos(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // Toggle completion
  const toggleTodo = async (todo) => {
    try {
      const res = await fetch(`/api/todos/${todo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !todo.completed }),
      });

      if (!res.ok) throw new Error("Failed to update todo");
      const updated = await res.json();

      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, ...updated } : t))
      );
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  // Delete a todo
  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`/api/todos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete todo");
      setTodos((prev) => prev.filter((t) => t.id !== id));
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (loading) return <p className="text-gray-500">Loading todos...</p>;

  if (todos.length === 0)
    return <p className="text-gray-400 italic">No todos found.</p>;

  return (
    <div className="space-y-3">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="flex justify-between items-center p-3 bg-gray-100 rounded-2xl shadow-sm"
        >
          <span
            className={`cursor-pointer ${
              todo.completed ? "line-through text-gray-400" : "text-gray-800"
            }`}
            onClick={() => toggleTodo(todo)}
          >
            {todo.title}
          </span>
          <button
            onClick={() => deleteTodo(todo.id)}
            className="text-red-500 hover:text-red-700 font-medium"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
