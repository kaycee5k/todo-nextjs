export interface Todo {
  id: string  // Changed from number to string (UUID)
  title: string
  completed: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export interface NewTodoInput {
  title: string
  completed: boolean
}

export type TodoFilter = 'all' | 'completed' | 'incomplete'