'use client'

import { Todo } from '../../types/todo'
import TodoItem from './TodoItem'

interface TodoListProps {
  todos: Todo[]
  activeTab: 'pending' | 'completed'
  onEdit: (todo: Todo) => void
  onDelete: (id: string) => void
  onToggleComplete: (id: string, completed: boolean) => void
}

export default function TodoList({ 
  todos, 
  activeTab, 
  onEdit, 
  onDelete, 
  onToggleComplete 
}: TodoListProps) {
  const currentTodos = activeTab === 'pending' 
    ? todos.filter(todo => !todo.completed)
    : todos.filter(todo => todo.completed)

  if (currentTodos.length === 0) {
    return (
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
    )
  }

  return (
    <div className="todo-list-content">
      {currentTodos.map(todo => (
        <TodoItem 
          key={todo.id}
          todo={todo}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
          type={activeTab}
        />
      ))}
    </div>
  )
}