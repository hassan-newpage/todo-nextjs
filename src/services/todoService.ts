import { Todo } from '../../types/todo'

const API_BASE = '/api/todos'

export const todoService = {
  async getAllTodos(): Promise<Todo[]> {
    const response = await fetch(API_BASE)
    if (!response.ok) throw new Error('Failed to fetch todos')
    return response.json()
  },

  async getTodoById(id: string): Promise<Todo> {
    const response = await fetch(`${API_BASE}/${id}`)
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Todo not found')
      }
      throw new Error('Failed to fetch todo')
    }
    return response.json()
  },

  async createTodo(todoData: Partial<Todo>): Promise<Todo> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todoData)
    })
    if (!response.ok) throw new Error('Failed to create todo')
    return response.json()
  },

  async updateTodo(id: string, todoData: Partial<Todo>): Promise<Todo> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todoData)
    })
    if (!response.ok) throw new Error('Failed to update todo')
    return response.json()
  },

  async deleteTodo(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE'
    })
    if (!response.ok) throw new Error('Failed to delete todo')
  }
}