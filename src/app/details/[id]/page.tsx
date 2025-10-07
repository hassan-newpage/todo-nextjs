'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Todo } from '../../../../types/todo'
import { todoService } from '../../../services/todoService'

export default function TodoDetails() {
  const params = useParams()
  const router = useRouter()
  const [todo, setTodo] = useState<Todo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (params.id) {
      loadTodo()
    }
  }, [params.id])

  const loadTodo = async () => {
    try {
      setLoading(true)
      setError(null)
      const todoData = await todoService.getTodoById(params.id as string)
      setTodo(todoData)
    } catch (error) {
      console.error('Error loading todo:', error)
      setError(error instanceof Error ? error.message : 'Failed to load todo')
      setTodo(null)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleComplete = async () => {
    if (!todo) return

    try {
      const updatedTodo = await todoService.updateTodo(todo.id, { 
        completed: !todo.completed 
      })
      setTodo(updatedTodo)
    } catch (error) {
      console.error('Error updating todo:', error)
      alert('Failed to update todo. Please try again.')
    }
  }

  const handleDelete = async () => {
    if (!todo) return

    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await todoService.deleteTodo(todo.id)
        router.push('/')
      } catch (error) {
        console.error('Error deleting todo:', error)
        alert('Failed to delete todo. Please try again.')
      }
    }
  }

  const handleEdit = () => {
    router.push(`/?edit=${todo?.id}`)
  }

  if (loading) {
    return (
      <div className="todo-app-container">
        <div className="loading-container">
          <div className="loading-spinner"></div>
        </div>
      </div>
    )
  }

  if (error || !todo) {
    return (
      <div className="todo-app-container">
        <div className="todo-app-content">
          <div className="todo-card">
            <h2>Todo Not Found</h2>
            <p>{error || 'The requested todo could not be found.'}</p>
            <Link href="/" className="todo-button">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="todo-app-container">
      <div className="todo-app-content">
        {/* Header with Back Button */}
        <div className="todo-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Link href="/" className="back-button">
              ← Back
            </Link>
            <h1 className="todo-title">Task Details</h1>
            <div style={{ width: '60px' }}></div>
          </div>
        </div>

        {/* Todo Details Card */}
        <div className="todo-card">
          {/* Completion Toggle */}
          <div className="todo-detail-section">
            <label className="completion-toggle">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={handleToggleComplete}
                className="completion-checkbox"
              />
              <span className="completion-label">
                {todo.completed ? 'Completed' : 'Mark as Complete'}
              </span>
            </label>
          </div>
          
          <h2 className="todo-detail-title">{todo.title}</h2>
          
          {todo.description && (
            <div className="todo-detail-section">
              <h3 className="todo-detail-label">Description</h3>
              <p className="todo-detail-description">{todo.description}</p>
            </div>
          )}

          <div className="todo-detail-meta">
            {todo.task_date && (
              <div className="todo-detail-meta-item">
                <span className="todo-detail-label">Date:</span>
                <span>{new Date(todo.task_date).toLocaleDateString()}</span>
              </div>
            )}
            
            {todo.task_time && (
              <div className="todo-detail-meta-item">
                <span className="todo-detail-label">Time:</span>
                <span>{todo.task_time}</span>
              </div>
            )}
            
            <div className="todo-detail-meta-item">
              <span className="todo-detail-label">Created:</span>
              <span>{new Date(todo.created_at).toLocaleDateString()}</span>
            </div>

            <div className="todo-detail-meta-item">
              <span className="todo-detail-label">Status:</span>
              <span className={`status-badge ${todo.completed ? 'completed' : 'pending'}`}>
                {todo.completed ? 'Completed' : 'Pending'}
              </span>
            </div>
          </div>

          {/* Action Buttons - Hide Edit if completed */}
          <div className="todo-detail-actions">
            {!todo.completed && (
              <button onClick={handleEdit} className="todo-detail-btn edit-btn">
                ✏️ Edit Task
              </button>
            )}
            <button onClick={handleDelete} className="todo-detail-btn delete-btn">
              🗑️ Delete Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}