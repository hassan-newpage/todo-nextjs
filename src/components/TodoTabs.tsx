'use client'

interface TodoTabsProps {
  activeTab: 'pending' | 'completed'
  onTabChange: (tab: 'pending' | 'completed') => void
  pendingCount: number
  completedCount: number
}

export default function TodoTabs({ 
  activeTab, 
  onTabChange, 
  pendingCount, 
  completedCount 
}: TodoTabsProps) {
  return (
    <div className="todo-tabs-container">
      <div className="todo-tabs">
        <button
          onClick={() => onTabChange('pending')}
          className={`todo-tab ${activeTab === 'pending' ? 'active' : ''}`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => onTabChange('completed')}
          className={`todo-tab ${activeTab === 'completed' ? 'active' : ''}`}
        >
          Completed ({completedCount})
        </button>
      </div>
    </div>
  )
}