import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInspectionStore } from '@/stores/inspectionStore'
import { RECOMMENDATION_LABELS } from '@/types'
import {
  ClipboardList,
  ChevronRight,
  RotateCcw,
  Upload,
  CheckCircle2,
  AlertTriangle,
  Search,
  Filter,
} from 'lucide-react'

export default function Records() {
  const navigate = useNavigate()
  const { records, syncOfflineRecords, getOfflineRecords } = useInspectionStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'abnormal' | 'normal'>('all')
  const [syncing, setSyncing] = useState(false)

  const offlineRecords = getOfflineRecords()

  const filteredRecords = records.filter((r) => {
    const matchSearch =
      !searchTerm ||
      r.gunPosition.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.gunPosition.area.toLowerCase().includes(searchTerm.toLowerCase())
    const hasAbnormal =
      r.gunHeadCheck.some((c) => c.abnormal) ||
      r.cableJointCheck.some((c) => c.abnormal) ||
      r.recommendation === 'stop' ||
      r.recommendation === 'monitor'
    if (filterType === 'abnormal') return matchSearch && hasAbnormal
    if (filterType === 'normal') return matchSearch && !hasAbnormal
    return matchSearch
  })

  const groupedRecords = filteredRecords.reduce<Record<string, typeof records>>((acc, record) => {
    const date = new Date(record.createdAt).toLocaleDateString('zh-CN')
    if (!acc[date]) acc[date] = []
    acc[date].push(record)
    return acc
  }, {})

  const handleSync = () => {
    setSyncing(true)
    setTimeout(() => {
      syncOfflineRecords()
      setSyncing(false)
    }, 1500)
  }

  const getStatusColor = (record: (typeof records)[0]) => {
    if (record.recommendation === 'stop') return 'text-red-400'
    if (record.recommendation === 'monitor') return 'text-amber-400'
    return 'text-emerald-400'
  }

  const getStatusBg = (record: (typeof records)[0]) => {
    if (record.recommendation === 'stop') return 'bg-red-500/15 border-red-500/20'
    if (record.recommendation === 'monitor') return 'bg-amber-500/15 border-amber-500/20'
    return 'bg-emerald-500/15 border-emerald-500/20'
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="px-5 pt-6 pb-3">
        <h1 className="text-xl font-bold tracking-tight">巡检记录</h1>
        <p className="text-sm text-slate-400 mt-0.5">历史巡检与复查</p>
      </header>

      <div className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="搜索枪位编号或区域"
            className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl pl-9 pr-4 py-2.5 text-sm placeholder:text-slate-500 focus:outline-none focus:border-orange-500/50"
          />
        </div>
      </div>

      <div className="px-5 mb-4 flex gap-2">
        {[
          { key: 'all' as const, label: '全部' },
          { key: 'abnormal' as const, label: '异常' },
          { key: 'normal' as const, label: '正常' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterType(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterType === f.key
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {offlineRecords.length > 0 && (
        <div className="mx-5 mb-4">
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-amber-300">{offlineRecords.length} 条离线记录待补传</span>
            </div>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="flex items-center gap-1 px-3 py-1.5 bg-amber-500/20 text-amber-400 rounded-lg text-xs font-medium active:scale-95 transition-transform disabled:opacity-50"
            >
              <Upload className="w-3 h-3" />
              {syncing ? '同步中...' : '补传'}
            </button>
          </div>
        </div>
      )}

      <div className="px-5 pb-24">
        {filteredRecords.length === 0 && (
          <div className="text-center py-16">
            <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-600" />
            <p className="text-sm text-slate-500">暂无巡检记录</p>
          </div>
        )}

        {Object.entries(groupedRecords).map(([date, dateRecords]) => (
          <div key={date} className="mb-5">
            <div className="flex items-center gap-2 mb-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              <span className="text-xs text-slate-400 font-medium">{date}</span>
              <div className="flex-1 h-px bg-slate-800" />
            </div>
            <div className="space-y-2">
              {dateRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{record.gunPosition.code}</span>
                        {record.isOffline && (
                          <span className="px-1.5 py-0.5 text-[10px] bg-amber-500/15 text-amber-400 rounded">
                            离线
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{record.gunPosition.area}</p>
                    </div>
                    <div className={`px-2 py-0.5 text-[10px] rounded-md border font-medium ${getStatusBg(record)}`}>
                      <span className={getStatusColor(record)}>
                        {record.recommendation ? RECOMMENDATION_LABELS[record.recommendation] : '未判定'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
                    <span>
                      {new Date(record.createdAt).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {record.meterReading !== null && (
                      <span style={{ fontFamily: 'DIN Alternate, monospace' }}>
                        {record.meterReading}℃ / {record.standardValue}℃
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/records/${record.id}`)}
                      className="flex-1 py-2 bg-slate-700/50 rounded-lg text-xs text-slate-300 flex items-center justify-center gap-1 active:scale-95 transition-transform"
                    >
                      <CheckCircle2 className="w-3 h-3" />
                      查看详情
                    </button>
                    <button
                      onClick={() => {
                        useInspectionStore.getState().reinspect(record.id)
                        navigate(`/inspect/reinspect`)
                      }}
                      className="flex-1 py-2 bg-orange-500/15 rounded-lg text-xs text-orange-400 flex items-center justify-center gap-1 active:scale-95 transition-transform border border-orange-500/20"
                    >
                      <RotateCcw className="w-3 h-3" />
                      一键复查
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
