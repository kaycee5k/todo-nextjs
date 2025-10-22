// File: src/types/todo.ts

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

export interface NewTodoInput {
  title: string;
  completed: boolean;
  userId: number;
}

export type TodoFilter = 'all' | 'completed' | 'incomplete';

// File: src/types/api.ts

export interface ApiError {
  message: string;
  status?: number;
}

// File: src/types/components.ts

export interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  isLoading?: boolean;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}