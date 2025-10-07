'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Todo } from '../../types/todo'
import { todoService } from '../services/todoService'
import TodoForm from '../components/TodoForm'
import TodoList from '../components/TodoList'
import TodoTabs from '../components/TodoTabs'

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  const [initialLoading, setInitialLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending')
  
  const searchParams = useSearchParams()

  useEffect(() => {
    loadTodos()
  }, [])

  // Check URL for edit parameter after todos are loaded
  useEffect(() => {
    if (todos.length > 0) {
      const editId = searchParams.get('edit')
      if (editId) {
        const todoToEdit = todos.find(todo => todo.id === editId)
        if (todoToEdit) {
          setEditingTodo(todoToEdit)
          // Clear the URL parameter
          window.history.replaceState({}, '', '/')
        }
      }
    }
  }, [todos, searchParams])

  const loadTodos = async () => {
    try {
      const data = await todoService.getAllTodos()
      setTodos(data)
    } catch (error) {
      console.error('Error loading todos:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleAddTodo = async (todoData: Partial<Todo>) => {
    try {
      const newTodo = await todoService.createTodo(todoData)
      setTodos(prev => [newTodo, ...prev])
    } catch (error) {
      console.error('Error creating todo:', error)
      throw error
    }
  }

  const handleUpdateTodo = async (todoData: Partial<Todo>) => {
    if (!editingTodo) return

    try {
      const updatedTodo = await todoService.updateTodo(editingTodo.id, todoData)
      setTodos(prev => prev.map(todo => 
        todo.id === editingTodo.id ? updatedTodo : todo
      ))
      setEditingTodo(null)
    } catch (error) {
      console.error('Error updating todo:', error)
      throw error
    }
  }

  const handleDeleteTodo = async (id: string) => {
    const todoToDelete = todos.find(todo => todo.id === id)
    
    // Optimistic update
    setTodos(prev => prev.filter(todo => todo.id !== id))

    try {
      await todoService.deleteTodo(id)
    } catch (error) {
      console.error('Error deleting todo:', error)
      // Revert on error
      setTodos(prev => [...prev, todoToDelete!])
    }
  }

  const handleToggleComplete = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setTodos(prev => prev.map(todo => 
      todo.id === id ? { ...todo, completed: !currentStatus } : todo
    ))

    try {
      await todoService.updateTodo(id, { completed: !currentStatus })
    } catch (error) {
      console.error('Error updating todo:', error)
      // Revert on error
      setTodos(prev => prev.map(todo => 
        todo.id === id ? { ...todo, completed: currentStatus } : todo
      ))
    }
  }

  const startEditing = (todo: Todo) => {
    setEditingTodo(todo)
  }

  const cancelEditing = () => {
    setEditingTodo(null)
  }

  const handleFormSubmit = async (todoData: Partial<Todo>) => {
    if (editingTodo) {
      await handleUpdateTodo(todoData)
    } else {
      await handleAddTodo(todoData)
    }
  }

  const pendingTodos = todos.filter(todo => !todo.completed)
  const completedTodos = todos.filter(todo => todo.completed)

  return (
    <div className="todo-app-container">
      <div className="todo-app-content">
        {/* Header */}
        <div className="todo-header">
          <h1 className="todo-title">Todo App</h1>
          {editingTodo && (
            <p className="editing-notice">Editing: {editingTodo.title}</p>
          )}
        </div>

        {/* Todo Form */}
        <TodoForm 
          editingTodo={editingTodo}
          onSubmit={handleFormSubmit}
          onCancel={cancelEditing}
        />

        {/* Loading State */}
        {initialLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        )}

        {/* Tabs */}
        {!initialLoading && (
          <TodoTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            pendingCount={pendingTodos.length}
            completedCount={completedTodos.length}
          />
        )}

        {/* Todo List */}
        {!initialLoading && (
          <div className="todo-list">
            <TodoList 
              todos={todos}
              activeTab={activeTab}
              onEdit={startEditing}
              onDelete={handleDeleteTodo}
              onToggleComplete={handleToggleComplete}
            />
          </div>
        )}
      </div>
    </div>
  )
}