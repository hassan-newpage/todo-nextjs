'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { Todo } from '../../types/todo'

export default function TodoApp() {
  // State
  const [todos, setTodos] = useState<Todo[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskDate: '',
    taskTime: ''
  })
  const [editingId, setEditingId] = useState<string | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')

  // Load todos on startup
  useEffect(() => {
    loadTodos()
  }, [])

  // Helper functions
  const loadTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTodos(data || [])
    } catch (error) {
      console.error('Error loading todos:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const updateFormField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({ title: '', description: '', taskDate: '', taskTime: '' })
    setEditingId(null)
  }

  // Todo actions
  const addTodo = async () => {
    const todoData = {
      title: formData.title,
      description: formData.description || null,
      task_date: formData.taskDate || new Date().toISOString().split('T')[0],
      task_time: formData.taskTime || null
    }

    // Create temporary todo for instant UI update
    const tempId = `temp-${Date.now()}`
    const newTodo: Todo = {
      id: tempId,
      ...todoData,
      completed: false,
      created_at: new Date().toISOString()
    }

    setTodos(prev => [newTodo, ...prev])

    // Save to database
    const { data, error } = await supabase
      .from('todos')
      .insert([todoData])
      .select()

    if (error) {
      console.error('Error creating todo:', error)
      setTodos(prev => prev.filter(todo => todo.id !== tempId))
    } else if (data) {
      setTodos(prev => prev.map(todo => todo.id === tempId ? data[0] : todo))
    }
  }

  const updateTodo = async () => {
    if (!editingId) return

    const todoData = {
      title: formData.title,
      description: formData.description || null,
      task_date: formData.taskDate,
      task_time: formData.taskTime || null
    }

    // Update UI immediately
    setTodos(prev => prev.map(todo => 
      todo.id === editingId ? { ...todo, ...todoData } : todo
    ))

    // Update in database
    const { error } = await supabase
      .from('todos')
      .update(todoData)
      .eq('id', editingId)

    if (error) {
      console.error('Error updating todo:', error)
      loadTodos() // Reload on error
    }
  }

  const deleteTodo = async (id: string) => {
    const todoToDelete = todos.find(todo => todo.id === id)
    
    // Remove from UI immediately
    setTodos(prev => prev.filter(todo => todo.id !== id))

    // Delete from database
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting todo:', error)
      // Add back if failed
      setTodos(prev => [...prev, todoToDelete!])
    }
  }

  const toggleTodoCompletion = async (id: string, currentStatus: boolean) => {
    // Toggle in UI immediately
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !currentStatus } : todo
    ))

    // Update in database
    const { error } = await supabase
      .from('todos')
      .update({ completed: !currentStatus })
      .eq('id', id)

    if (error) {
      console.error('Error updating todo:', error)
      // Revert if failed
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, completed: currentStatus } : todo
      ))
    }
  }

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id)
    setFormData({
      title: todo.title,
      description: todo.description || '',
      taskDate: todo.task_date,
      taskTime: todo.task_time || ''
    })
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      if (editingId) {
        await updateTodo()
      } else {
        await addTodo()
      }
      resetForm()
    } catch (error) {
      console.error('Error saving todo:', error)
    }
  }

  // Filtered todos
  const pendingTodos = todos.filter(todo => !todo.completed)
  const completedTodos = todos.filter(todo => todo.completed)
  const currentTodos = activeTab === 'pending' ? pendingTodos : completedTodos

  return (
    <div className="todo-app-container">
      <div className="todo-app-content">
        {/* Header */}
        <div className="todo-header">
          <h1 className="todo-title">Todo App</h1>
        </div>

        {/* Todo Form */}
        <div className="todo-card">
          <div className="form-header">
            <h2 className="form-title">
              {editingId ? 'Edit Task' : 'Add New Task'}
            </h2>
            {editingId && (
              <button onClick={resetForm} className="cancel-button">
                ✕ Cancel
              </button>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="todo-form">
            <input
              type="text"
              placeholder="What needs to be done? *"
              value={formData.title}
              onChange={(e) => updateFormField('title', e.target.value)}
              required
              className="todo-input"
            />
            
            <textarea
              placeholder="Add description (optional)"
              value={formData.description}
              onChange={(e) => updateFormField('description', e.target.value)}
              className="todo-textarea"
              rows={3}
            />
            
            <div className="date-time-grid">
              <div className="date-time-group">
                <label className="date-time-label">Date</label>
                <input
                  type="date"
                  value={formData.taskDate}
                  onChange={(e) => updateFormField('taskDate', e.target.value)}
                  className="todo-input"
                />
              </div>
              <div className="date-time-group">
                <label className="date-time-label">Time</label>
                <input
                  type="time"
                  value={formData.taskTime}
                  onChange={(e) => updateFormField('taskTime', e.target.value)}
                  className="todo-input"
                />
              </div>
            </div>
            
            <button type="submit" className="todo-button">
              {editingId ? 'Update Task' : 'Add Task'}
            </button>
          </form>
        </div>

        {/* Loading State */}
        {initialLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Tabs */}
        {!initialLoading && (
          <div className="todo-tabs-container">
            <div className="todo-tabs">
              <button
                onClick={() => setActiveTab('pending')}
                className={`todo-tab ${activeTab === 'pending' ? 'active' : ''}`}
              >
                Pending ({pendingTodos.length})
              </button>
              <button
                onClick={() => setActiveTab('completed')}
                className={`todo-tab ${activeTab === 'completed' ? 'active' : ''}`}
              >
                Completed ({completedTodos.length})
              </button>
            </div>
          </div>
        )}

        {/* Todo List */}
        {!initialLoading && (
          <div className="todo-list">
            {currentTodos.length === 0 ? (
              <div className="todo-card empty-state">
                <div className="empty-icon">📝</div>
                <h3 className="empty-title">
                  {activeTab === 'pending' ? 'No pending tasks' : 'No completed tasks'}
                </h3>
                <p className="empty-text">
                  {activeTab === 'pending' 
                    ? 'Add a task to get started!' 
                    : 'Complete some tasks to see them here!'}
                </p>
              </div>
            ) : (
              <div className="todo-list-content">
                {currentTodos.map(todo => (
                  <TodoItem 
                    key={todo.id}
                    todo={todo}
                    onEdit={startEditing}
                    onDelete={deleteTodo}
                    onToggleComplete={toggleTodoCompletion}
                    type={activeTab}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Todo Item Component - kept simple as it's already clean
interface TodoItemProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string, completed: boolean) => void
  type: 'pending' | 'completed'
}

function TodoItem({ todo, onEdit, onDelete, onToggleComplete, type }: TodoItemProps) {
  const isCompleted = type === 'completed'

  return (
    <div className={`todo-item ${isCompleted ? 'completed' : ''}`}>
      <div className="todo-item-content">
        <div className="todo-item-main">
          <button
            onClick={() => onToggleComplete(todo.id, todo.completed)}
            className={`todo-checkbox ${isCompleted ? 'completed' : ''}`}
          >
            {isCompleted && <span className="todo-checkmark">✓</span>}
          </button>
          
          <div className="todo-text-content">
            <h3 className={`todo-title-text ${isCompleted ? 'completed' : ''}`}>
              {todo.title}
            </h3>
            
            {todo.description && (
              <p className="todo-description">{todo.description}</p>
            )}
            
            <div className="todo-meta">
              {todo.task_date && (
                <span className="todo-date">
                  📅 {new Date(todo.task_date).toLocaleDateString()}
                </span>
              )}
              {todo.task_time && (
                <span className="todo-time">
                  ⏰ {todo.task_time}
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="todo-actions">
          {!isCompleted && (
            <button
              onClick={() => onEdit(todo)}
              className="todo-action-btn edit-btn"
              title="Edit"
            >
              ✏️
            </button>
          )}
          
          <button
            onClick={() => onDelete(todo.id)}
            className="todo-action-btn delete-btn"
            title="Delete"
          >
            🗑️
          </button>
        </div>
      </div>
    </div>
  )
}