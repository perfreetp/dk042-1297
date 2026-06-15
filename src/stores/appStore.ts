import { create } from 'zustand'

interface AppState {
  isOnline: boolean
  userName: string
  userRole: 'inspector' | 'duty'
  setOnline: (value: boolean) => void
  setUserName: (name: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  isOnline: navigator.onLine,
  userName: '张工',
  userRole: 'inspector',
  setOnline: (value) => set({ isOnline: value }),
  setUserName: (name) => set({ userName: name }),
}))
