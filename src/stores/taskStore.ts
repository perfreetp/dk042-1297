import { create } from 'zustand'
import { InspectionTask } from '@/types'
import { MOCK_TASKS } from '@/data/mock'

interface TaskState {
  tasks: InspectionTask[]
  updateTaskStatus: (taskId: string, status: InspectionTask['status']) => void
  getTodayTasks: () => InspectionTask[]
  getCompletedCount: () => number
  getPendingCount: () => number
  getUrgentCount: () => number
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: MOCK_TASKS,

  updateTaskStatus: (taskId, status) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    })),

  getTodayTasks: () => {
    const today = new Date().toISOString().split('T')[0]
    return get().tasks.filter((t) => t.dueDate === today)
  },

  getCompletedCount: () => get().tasks.filter((t) => t.status === 'completed').length,

  getPendingCount: () => get().tasks.filter((t) => t.status === 'pending').length,

  getUrgentCount: () =>
    get().tasks.filter((t) => t.status === 'pending' && t.priority === 'urgent').length,
}))
