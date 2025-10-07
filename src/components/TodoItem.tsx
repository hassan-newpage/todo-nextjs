'use client'

import Link from 'next/link'
import { Todo } from '../../types/todo'

interface TodoItemProps {
  todo: Todo
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string, completed: boolean) => void
  type: 'pending' | 'completed'
}

export default function TodoItem({ todo, onEdit, onDelete, onToggleComplete, type }: TodoItemProps) {
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
            {/* Only the title is clickable */}
            <Link href={`/details/${todo.id}`} className="todo-title-link">
              <h3 className={`todo-title-text ${isCompleted ? 'completed' : ''}`}>
                {todo.title}
              </h3>
            </Link>
            
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
          {/* Hide edit button for completed tasks */}
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