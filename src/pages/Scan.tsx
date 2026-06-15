import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTaskStore } from '@/stores/taskStore'
import { useInspectionStore } from '@/stores/inspectionStore'
import { MOCK_GUN_POSITIONS } from '@/data/mock'
import { ArrowLeft, ScanLine, CheckCircle2, X } from 'lucide-react'

export default function Scan() {
  const navigate = useNavigate()
  const { tasks } = useTaskStore()
  const { initRecord } = useInspectionStore()
  const [scanning, setScanning] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [scanLineY, setScanLineY] = useState(0)

  useEffect(() => {
    if (!scanning) return
    let frame: number
    let y = 0
    const animate = () => {
      y = (y + 1.5) % 200
      setScanLineY(y)
      frame = requestAnimationFrame(animate)
    }
    frame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frame)
  }, [scanning])

  const handleStartScan = () => {
    setScanning(true)
    setScanned(false)
    setScanResult(null)
    setTimeout(() => {
      const randomGun = MOCK_GUN_POSITIONS[Math.floor(Math.random() * MOCK_GUN_POSITIONS.length)]
      setScanResult(randomGun.id)
      setScanned(true)
      setScanning(false)
    }, 2000)
  }

  const handleConfirmScan = () => {
    if (!scanResult) return
    const gunPosition = MOCK_GUN_POSITIONS.find((g) => g.id === scanResult)
    if (!gunPosition) return
    const existingTask = tasks.find((t) => t.gunPosition.id === gunPosition.id)
    const taskId = existingTask?.id || `task-${Date.now()}`
    initRecord(taskId, gunPosition)
    if (existingTask) {
      useTaskStore.getState().updateTaskStatus(taskId, 'in_progress')
    }
    navigate(`/inspect/${taskId}`)
  }

  const foundGun = scanResult ? MOCK_GUN_POSITIONS.find((g) => g.id === scanResult) : null

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="px-4 pt-5 pb-3 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <h1 className="text-lg font-semibold">扫码巡检</h1>
      </header>

      <div className="px-5">
        {!scanning && !scanned && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-48 h-48 mb-8">
              <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-orange-500/40" />
              <div className="absolute inset-4 rounded-xl bg-orange-500/5 flex items-center justify-center">
                <ScanLine className="w-16 h-16 text-orange-400/60" />
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-6">将枪位二维码对准扫描框</p>
            <button
              onClick={handleStartScan}
              className="px-8 py-3.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-base font-semibold active:scale-95 transition-transform shadow-lg shadow-orange-500/25"
            >
              开始扫码
            </button>
          </div>
        )}

        {scanning && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-56 h-56 mb-8">
              <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-orange-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-orange-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-orange-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-orange-400 rounded-br-lg" />
              <div className="absolute inset-0 bg-slate-900/40 rounded-lg overflow-hidden">
                <div
                  className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-orange-400 to-transparent shadow-lg shadow-orange-400/50"
                  style={{ top: `${scanLineY}px`, transition: 'top 0.05s linear' }}
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-sm text-orange-300/80 animate-pulse">识别中...</p>
              </div>
            </div>
            <button
              onClick={() => setScanning(false)}
              className="px-5 py-2 bg-slate-700 rounded-lg text-sm active:scale-95 transition-transform"
            >
              取消扫描
            </button>
          </div>
        )}

        {scanned && foundGun && (
          <div className="py-6">
            <div className="flex items-center justify-center mb-6">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
            <p className="text-center text-sm text-emerald-400 mb-6">识别成功</p>

            <div className="bg-slate-800/80 border border-slate-700/50 rounded-2xl p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">{foundGun.code}</h3>
                {foundGun.lastInspectionResult && (
                  <span
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium ${
                      foundGun.lastInspectionResult === 'normal'
                        ? 'bg-emerald-500/15 text-emerald-400'
                        : foundGun.lastInspectionResult === 'warning'
                          ? 'bg-amber-500/15 text-amber-400'
                          : 'bg-red-500/15 text-red-400'
                    }`}
                  >
                    {foundGun.lastInspectionResult === 'normal'
                      ? '上次正常'
                      : foundGun.lastInspectionResult === 'warning'
                        ? '上次注意'
                        : '上次异常'}
                  </span>
                )}
              </div>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">所属区域</span>
                  <span className="text-sm">{foundGun.area}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">线缆型号</span>
                  <span className="text-sm">{foundGun.cableModel}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">上次巡检</span>
                  <span className="text-sm">{foundGun.lastInspectionDate || '无记录'}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setScanned(false)
                  setScanResult(null)
                }}
                className="flex-1 py-3 bg-slate-700 rounded-xl text-sm font-medium active:scale-95 transition-transform"
              >
                重新扫码
              </button>
              <button
                onClick={handleConfirmScan}
                className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-lg shadow-orange-500/25"
              >
                开始巡检
              </button>
            </div>
          </div>
        )}

        {!scanning && !scanned && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-400 mb-3">或手动选择枪位</h3>
            <div className="space-y-2">
              {MOCK_GUN_POSITIONS.slice(0, 4).map((gp) => (
                <button
                  key={gp.id}
                  onClick={() => {
                    const existingTask = tasks.find((t) => t.gunPosition.id === gp.id)
                    const taskId = existingTask?.id || `task-${Date.now()}`
                    initRecord(taskId, gp)
                    if (existingTask) {
                      useTaskStore.getState().updateTaskStatus(taskId, 'in_progress')
                    }
                    navigate(`/inspect/${taskId}`)
                  }}
                  className="w-full flex items-center gap-3 bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5 text-left active:scale-[0.98] transition-transform"
                >
                  <div
                    className={`w-1 h-8 rounded-full ${
                      gp.lastInspectionResult === 'normal'
                        ? 'bg-emerald-500'
                        : gp.lastInspectionResult === 'warning'
                          ? 'bg-amber-500'
                          : gp.lastInspectionResult === 'danger'
                            ? 'bg-red-500'
                            : 'bg-slate-500'
                    }`}
                  />
                  <div className="flex-1">
                    <span className="text-sm font-semibold">{gp.code}</span>
                    <p className="text-xs text-slate-400">{gp.area}</p>
                  </div>
                  <span className="text-xs text-orange-400">选择</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
