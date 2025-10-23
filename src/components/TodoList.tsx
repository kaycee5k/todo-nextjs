"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Todo, NewTodoInput, TodoFilter } from "../types/todo";

const fetchTodos = async (): Promise<Todo[]> => {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos");
  if (!res.ok) throw new Error("Failed to fetch todos");
  return res.json();
};

const postTodo = async (newTodo: NewTodoInput): Promise<Todo> => {
  const res = await fetch("https://jsonplaceholder.typicode.com/todos", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newTodo),
  });
  if (!res.ok) throw new Error("Failed to add todo");
  return res.json();
};

const updateTodo = async (todo: Todo): Promise<Todo> => {
  if (todo.id > 200) return todo;
  const res = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${todo.id}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(todo),
    }
  );
  if (!res.ok) throw new Error("Failed to update todo");
  return res.json();
};

const deleteTodo = async (id: number): Promise<number> => {
  if (id > 200) return id;
  const res = await fetch(`https://jsonplaceholder.typicode.com/todos/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete todo");
  return id;
};

function Home() {
  const queryClient = useQueryClient();
  const [newTodo, setNewTodo] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [filter, setFilter] = useState<TodoFilter>("all");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState<string>("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  const { data, isLoading, isError, error } = useQuery<Todo[], Error>({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const addMutation = useMutation({
    mutationFn: postTodo,
    onSuccess: (newTodoItem: Todo) => {
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) => [
        { ...newTodoItem, id: Date.now() },
        ...old,
      ]);
      setNewTodo("");
      setIsModalOpen(false);
      setCurrentPage(1);
    },
  });

  const editMutation = useMutation({
    mutationFn: updateTodo,
    onSuccess: (updatedTodo: Todo) => {
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) =>
        old.map((todo) => (todo.id === updatedTodo.id ? updatedTodo : todo))
      );
      setEditId(null);
      setEditTitle("");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: (deletedId: number) => {
      queryClient.setQueryData<Todo[]>(["todos"], (old = []) => {
        const newTodos = old.filter((todo) => todo.id !== deletedId);
        const totalPages = Math.ceil(newTodos.length / itemsPerPage);
        if (currentPage > totalPages && totalPages > 0) {
          setCurrentPage(totalPages);
        }
        return newTodos;
      });
    },
  });

  const handleEditTodo = (todo: Todo): void => {
    setEditId(todo.id);
    setEditTitle(todo.title);
  };

  const handleUpdateTodo = (): void => {
    if (!editTitle.trim()) return;
    const original = data?.find((t) => t.id === editId);
    if (original) {
      editMutation.mutate({ ...original, title: editTitle });
    }
  };

  const handleCancelEdit = (): void => {
    setEditId(null);
    setEditTitle("");
  };

  const handleDeleteTodo = (id: number): void => {
    if (window.confirm("Are you sure you want to delete this todo?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleToggleComplete = (todo: Todo): void => {
    editMutation.mutate({ ...todo, completed: !todo.completed });
  };

  // Filter todos
  const filteredTodos = (data || []).filter(
    (todo) =>
      todo.title.toLowerCase().includes(search.toLowerCase()) &&
      (filter === "all" ||
        (filter === "completed" && todo.completed) ||
        (filter === "incomplete" && !todo.completed))
  );

  // Pagination calculations
  const totalItems = filteredTodos.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTodos = filteredTodos.slice(startIndex, endIndex);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleFilterChange = (newFilter: TodoFilter): void => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const goToPage = (page: number): void => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const startPage = Math.max(
        1,
        currentPage - Math.floor(maxVisiblePages / 2)
      );
      const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

      if (startPage > 1) {
        pages.push(1);
        if (startPage > 2) pages.push("...");
      }

      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      if (endPage < totalPages) {
        if (endPage < totalPages - 1) pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (isLoading) return <p>Loading...</p>;
  if (isError) return <p>Error: {error.message}</p>;

  return (
    <section className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <input
          type="text"
          placeholder="Search todos..."
          className="border px-3 py-2 rounded w-full sm:w-1/2"
          value={search}
          onChange={handleSearchChange}
        />
        <div className="flex gap-2">
          {(["all", "completed", "incomplete"] as TodoFilter[]).map((type) => (
            <button
              key={type}
              onClick={() => handleFilterChange(type)}
              className={`px-3 py-1 border rounded capitalize ${
                filter === type ? "bg-black text-white" : "bg-white text-black"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <label htmlFor="itemsPerPage" className="text-sm text-gray-600">
            Items per page:
          </label>
          <select
            id="itemsPerPage"
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            className="border px-2 py-1 rounded text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Showing {startIndex + 1}-{Math.min(endIndex, totalItems)} of{" "}
            {totalItems} todos
          </span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 border rounded bg-black text-white"
          >
            + Add Todo
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold mb-4">Add New Todo</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Enter todo title"
                className="w-full border px-3 py-2 rounded"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    addMutation.mutate({
                      title: newTodo,
                      completed: false,
                      userId: 1,
                    });
                  }
                }}
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-red-500 text-red-500 rounded hover:bg-red-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    addMutation.mutate({
                      title: newTodo,
                      completed: false,
                      userId: 1,
                    })
                  }
                  disabled={addMutation.isPending}
                  className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
                >
                  {addMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {totalItems === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No todos found.{" "}
          {search || filter !== "all"
            ? "Try adjusting your search or filter."
            : "Add your first todo!"}
        </div>
      ) : (
        <>
          <ul className="space-y-2">
            {currentTodos.map((todo) => (
              <li
                key={todo.id}
                className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
              >
                <div className="flex items-center gap-3 flex-1">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => handleToggleComplete(todo)}
                    className="w-4 h-4"
                  />
                  {editId === todo.id ? (
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 border px-2 py-1 rounded"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleUpdateTodo();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        autoFocus
                      />
                      <button
                        onClick={handleUpdateTodo}
                        disabled={editMutation.isPending}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 disabled:opacity-50"
                      >
                        {editMutation.isPending ? "Saving..." : "Save"}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <Link
                      href={`/todos/${todo.id}`}
                      className={`text-blue-600 hover:underline flex-1 ${
                        todo.completed ? "line-through text-gray-500" : ""
                      }`}
                    >
                      {todo.title}
                    </Link>
                  )}
                </div>
                {editId !== todo.id && (
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        todo.completed
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {todo.completed ? "Completed" : "Incomplete"}
                    </span>
                    <button
                      onClick={() => handleEditTodo(todo)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      <Pencil size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteTodo(todo.id)}
                      disabled={deleteMutation.isPending}
                      className="text-red-600 hover:text-red-800 disabled:opacity-50"
                      title="Delete"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous page"
                >
                  <ChevronLeft size={16} />
                </button>

                {getPageNumbers().map((page, index) => (
                  <button
                    key={index}
                    onClick={() => typeof page === "number" && goToPage(page)}
                    disabled={page === "..."}
                    className={`px-3 py-2 border rounded text-sm ${
                      page === currentPage
                        ? "bg-black text-white"
                        : page === "..."
                        ? "cursor-default"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next page"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

export default Home;
