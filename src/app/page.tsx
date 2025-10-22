import TodoList from '@/components/TodoList'

export default function Home() {
  return (
    <main className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-center mb-6">Todo App</h1>
      <TodoList />
    </main>
  )
}