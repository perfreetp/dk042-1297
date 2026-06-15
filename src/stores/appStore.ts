import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  isOnline: boolean
  userName: string
  userRole: 'inspector' | 'duty'
  setOnline: (value: boolean) => void
  setUserName: (name: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
      userName: '张工',
      userRole: 'inspector',
      setOnline: (value) => set({ isOnline: value }),
      setUserName: (name) => set({ userName: name }),
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        userName: state.userName,
        userRole: state.userRole,
      }),
    }
  )
)
