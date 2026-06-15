import { useNavigate } from 'react-router-dom'
import { useTaskStore } from '@/stores/taskStore'
import { useAppStore } from '@/stores/appStore'
import { useInspectionStore } from '@/stores/inspectionStore'
import {
  ScanLine,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wifi,
  WifiOff,
  ChevronRight,
  Flame,
} from 'lucide-react'

export default function Home() {
  const navigate = useNavigate()
  const { tasks, getCompletedCount, getPendingCount, getUrgentCount } = useTaskStore()
  const { userName, isOnline } = useAppStore()
  const { getOfflineRecords } = useInspectionStore()

  const completed = getCompletedCount()
  const pending = getPendingCount()
  const urgent = getUrgentCount()
  const total = tasks.length
  const progress = total > 0 ? Math.round((completed / total) * 100) : 0
  const offlineCount = getOfflineRecords().length

  const todayTasks = tasks.filter((t) => t.status === 'pending')

  const circumference = 2 * Math.PI * 54
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight">枪线温升巡检</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs">
            {isOnline ? (
              <Wifi className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            )}
            <span className={isOnline ? 'text-emerald-400' : 'text-amber-400'}>
              {isOnline ? '在线' : '离线'}
            </span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-sm font-bold">
            {userName[0]}
          </div>
        </div>
      </header>

      {offlineCount > 0 && (
        <div className="mx-5 mb-4 px-4 py-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs text-amber-300">{offlineCount} 条离线记录待补传</span>
        </div>
      )}

      <section className="mx-5 mb-6">
        <div className="bg-gradient-to-br from-[#1B3A5C] to-[#0F2440] rounded-2xl p-5 border border-slate-700/50">
          <div className="flex items-center gap-5">
            <div className="relative w-28 h-28 shrink-0">
              <svg className="w-28 h-28 -rotate-90" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="rgba(255,255,255,0.08)"
                  strokeWidth="8"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="54"
                  fill="none"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-700 ease-out"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#FF6B35" />
                    <stop offset="100%" stopColor="#FF3D00" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold tracking-tight" style={{ fontFamily: 'DIN Alternate, monospace' }}>
                  {progress}%
                </span>
                <span className="text-[10px] text-slate-400 mt-0.5">完成率</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">今日任务</span>
                <span className="text-lg font-bold">{total}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">已完成</span>
                <span className="text-lg font-bold text-emerald-400">{completed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">待巡检</span>
                <span className="text-lg font-bold text-orange-400">{pending}</span>
              </div>
              {urgent > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">紧急项</span>
                  <span className="text-lg font-bold text-red-400">{urgent}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-5 mb-6">
        <h2 className="text-base font-semibold mb-3">快捷操作</h2>
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={() => navigate('/scan')}
            className="flex flex-col items-center gap-2 bg-gradient-to-b from-orange-500/20 to-orange-600/5 border border-orange-500/20 rounded-2xl py-4 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center">
              <ScanLine className="w-6 h-6 text-orange-400" />
            </div>
            <span className="text-xs text-orange-300">扫码巡检</span>
          </button>
          <button
            onClick={() => navigate('/records')}
            className="flex flex-col items-center gap-2 bg-gradient-to-b from-blue-500/20 to-blue-600/5 border border-blue-500/20 rounded-2xl py-4 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6 text-blue-400" />
            </div>
            <span className="text-xs text-blue-300">巡检记录</span>
          </button>
          <button
            onClick={() => navigate('/records')}
            className="flex flex-col items-center gap-2 bg-gradient-to-b from-red-500/20 to-red-600/5 border border-red-500/20 rounded-2xl py-4 active:scale-95 transition-transform"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <Flame className="w-6 h-6 text-red-400" />
            </div>
            <span className="text-xs text-red-300">异常追踪</span>
          </button>
        </div>
      </section>

      <section className="mx-5 pb-24">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold">今日待办</h2>
          <span className="text-xs text-slate-500">{pending} 项待完成</span>
        </div>
        <div className="space-y-2.5">
          {todayTasks.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-500/50" />
              <p className="text-sm">今日任务已全部完成</p>
            </div>
          )}
          {todayTasks.map((task) => (
            <button
              key={task.id}
              onClick={() => {
                useInspectionStore.getState().initRecord(task.id, task.gunPosition)
                useTaskStore.getState().updateTaskStatus(task.id, 'in_progress')
                navigate(`/inspect/${task.id}`)
              }}
              className="w-full flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5 text-left active:scale-[0.98] transition-transform"
            >
              <div
                className={`w-1 h-10 rounded-full shrink-0 ${
                  task.priority === 'urgent'
                    ? 'bg-red-500'
                    : task.gunPosition.lastInspectionResult === 'warning'
                      ? 'bg-amber-500'
                      : task.gunPosition.lastInspectionResult === 'danger'
                        ? 'bg-red-500'
                        : 'bg-emerald-500'
                }`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{task.gunPosition.code}</span>
                  {task.priority === 'urgent' && (
                    <span className="px-1.5 py-0.5 text-[10px] bg-red-500/20 text-red-400 rounded-md font-medium">
                      紧急
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{task.gunPosition.area}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {task.gunPosition.lastInspectionResult && (
                  <span
                    className={`px-2 py-0.5 text-[10px] rounded-md font-medium ${
                      task.gunPosition.lastInspectionResult === 'normal'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : task.gunPosition.lastInspectionResult === 'warning'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {task.gunPosition.lastInspectionResult === 'normal'
                      ? '正常'
                      : task.gunPosition.lastInspectionResult === 'warning'
                        ? '注意'
                        : '异常'}
                  </span>
                )}
                <Clock className="w-4 h-4 text-slate-500" />
                <ChevronRight className="w-4 h-4 text-slate-600" />
              </div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
