'use client'

import { useQuery } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import type { Todo } from '@/types/todo'

export default function TodoDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: todo, isLoading, isError } = useQuery<Todo>({
    queryKey: ['todo', id],
    queryFn: async () => {
      const res = await fetch(`/api/todos/${id}`)
      if (!res.ok) throw new Error('Failed to fetch todo')
      return res.json()
    },
  })

  if (isLoading) return <p className="text-center p-8">Loading...</p>
  if (isError) return <p className="text-center p-8 text-red-600">Error loading todo</p>

  return (
    <div className="max-w-xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Todo Detail</h1>
      <div className="p-4 border rounded shadow-sm">
        <p><strong>ID:</strong> {todo?.id}</p>
        <p><strong>Title:</strong> {todo?.title}</p>
        <p>
          <strong>Status:</strong>{' '}
          <span className={
            todo?.completed
              ? 'text-green-600 font-semibold'
              : 'text-yellow-600 font-semibold'
          }>
            {todo?.completed ? 'Completed' : 'Incomplete'}
          </span>
        </p>
      </div>
      <button
        onClick={() => router.back()}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        ← Back to Todos
      </button>
    </div>
  )
}