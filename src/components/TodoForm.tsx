'use client'

import { useState, useEffect } from 'react'
import { Todo } from '../../types/todo'

interface TodoFormProps {
  editingTodo?: Todo | null
  onSubmit: (data: Partial<Todo>) => Promise<void> | void
  onCancel?: () => void
}

export default function TodoForm({ editingTodo, onSubmit, onCancel }: TodoFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    taskDate: '',
    taskTime: ''
  })

  // Reset form when editingTodo changes
  useEffect(() => {
    if (editingTodo) {
      setFormData({
        title: editingTodo.title,
        description: editingTodo.description || '',
        taskDate: editingTodo.task_date,
        taskTime: editingTodo.task_time || ''
      })
    } else {
      // Reset form when not editing
      setFormData({
        title: '',
        description: '',
        taskDate: '',
        taskTime: ''
      })
    }
  }, [editingTodo])

  const updateFormField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const todoData = {
      title: formData.title,
      description: formData.description || null,
      task_date: formData.taskDate || new Date().toISOString().split('T')[0],
      task_time: formData.taskTime || null
    }

    await onSubmit(todoData)
    
    // Clear form after successful submission
    if (!editingTodo) {
      setFormData({
        title: '',
        description: '',
        taskDate: '',
        taskTime: ''
      })
    }
  }

  return (
    <div className="todo-card">
      <div className="form-header">
        <h2 className="form-title">
          {editingTodo ? 'Edit Task' : 'Add New Task'}
        </h2>
        {editingTodo && onCancel && (
          <button onClick={onCancel} className="cancel-button">
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
          {editingTodo ? 'Update Task' : 'Add Task'}
        </button>
      </form>
    </div>
  )
}