import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import { Home, ScanLine, ClipboardList } from 'lucide-react'
import HomePage from '@/pages/Home'
import Scan from '@/pages/Scan'
import Inspect from '@/pages/Inspect'
import PhotoCapture from '@/pages/PhotoCapture'
import Judge from '@/pages/Judge'
import Summary from '@/pages/Summary'
import Records from '@/pages/Records'
import { useAppStore } from '@/stores/appStore'

function BottomNav() {
  const location = useLocation()
  const navigate = useNavigate()

  const tabs = [
    { path: '/', icon: Home, label: '首页' },
    { path: '/scan', icon: ScanLine, label: '扫码' },
    { path: '/records', icon: ClipboardList, label: '记录' },
  ]

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const showNav = ['/', '/scan', '/records'].some((p) => location.pathname === p)

  if (!showNav) return null

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-700/50 px-2 pb-[env(safe-area-inset-bottom)] z-50">
      <div className="flex items-center justify-around py-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path)
          return (
            <button
              key={tab.path}
              onClick={() => navigate(tab.path)}
              className={`flex flex-col items-center gap-0.5 py-1 px-4 rounded-xl transition-all active:scale-90 ${
                active ? 'text-orange-400' : 'text-slate-500'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  active ? 'bg-orange-500/15' : ''
                }`}
              >
                <tab.icon className={`w-5 h-5 ${active ? 'text-orange-400' : 'text-slate-500'}`} />
              </div>
              <span className="text-[10px] font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

function NetworkListener() {
  const { setOnline } = useAppStore()

  useEffect(() => {
    const handleOnline = () => setOnline(true)
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [setOnline])

  return null
}

function AppRoutes() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/scan" element={<Scan />} />
        <Route path="/inspect/:id" element={<Inspect />} />
        <Route path="/inspect/:id/photo" element={<PhotoCapture />} />
        <Route path="/inspect/:id/judge" element={<Judge />} />
        <Route path="/records" element={<Records />} />
        <Route path="/records/:id" element={<Summary />} />
      </Routes>
      <BottomNav />
    </>
  )
}

export default function App() {
  return (
    <Router>
      <NetworkListener />
      <AppRoutes />
    </Router>
  )
}
