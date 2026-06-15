import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useInspectionStore } from '@/stores/inspectionStore'
import { useAppStore } from '@/stores/appStore'
import { RECOMMENDATION_LABELS, SYNC_STATUS_LABELS, TOUCH_TEMPERATURE_LABELS, SyncStatus, InspectionRecord } from '@/types'
import {
  ClipboardList,
  ChevronRight,
  RotateCcw,
  Upload,
  Search,
  CloudOff,
  CloudUpload,
  CloudDone,
  CloudAlert,
  Clock,
  TrendingUp,
  Flame,
  MessageSquare,
} from 'lucide-react'

type ViewMode = 'list' | 'sync_queue' | 'gun_timeline'

const SYNC_STATUS_CONFIG: Record<SyncStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/20', icon: <CloudOff className="w-3 h-3" /> },
  syncing: { color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/20', icon: <CloudUpload className="w-3 h-3 animate-pulse" /> },
  synced: { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/20', icon: <CloudDone className="w-3 h-3" /> },
  failed: { color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/20', icon: <CloudAlert className="w-3 h-3" /> },
}

function SyncQueueView() {
  const navigate = useNavigate()
  const { records, syncRecord, syncAllOffline } = useInspectionStore()
  const { isOnline } = useAppStore()

  const groups: { status: SyncStatus; label: string }[] = [
    { status: 'pending', label: '待补传' },
    { status: 'syncing', label: '补传中' },
    { status: 'failed', label: '补传失败' },
    { status: 'synced', label: '已同步' },
  ]

  const pendingCount = records.filter((r) => r.syncStatus === 'pending' || r.syncStatus === 'failed').length

  return (
    <div>
      {pendingCount > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CloudOff className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-amber-300">{pendingCount} 条记录待处理</span>
          </div>
          <button
            onClick={() => { if (isOnline) syncAllOffline() }}
            disabled={!isOnline}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
              isOnline ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Upload className="w-3 h-3" />
            {isOnline ? '全部补传' : '离线中'}
          </button>
        </div>
      )}

      {groups.map((group) => {
        const groupRecords = records.filter((r) => r.syncStatus === group.status)
        if (groupRecords.length === 0 && group.status !== 'synced') return null
        const config = SYNC_STATUS_CONFIG[group.status]
        return (
          <div key={group.status} className="mb-5">
            <div className="flex items-center gap-2 mb-2.5">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${config.bg} ${config.color}`}>
                {config.icon}
                {group.label}
              </div>
              <span className="text-xs text-slate-500">{groupRecords.length} 条</span>
            </div>
            <div className="space-y-2">
              {groupRecords.map((record) => (
                <div key={record.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="font-semibold text-sm">{record.gunPosition.code}</span>
                      <span className="text-xs text-slate-400 ml-2">{record.gunPosition.area}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-[10px] rounded-md border font-medium ${config.bg} ${config.color}`}>
                        {config.icon}
                        {SYNC_STATUS_LABELS[record.syncStatus]}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                    <span>{new Date(record.createdAt).toLocaleString('zh-CN')}</span>
                    {record.meterReading !== null && (
                      <span style={{ fontFamily: 'DIN Alternate, monospace' }}>{record.meterReading}℃</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/records/${record.id}`)}
                      className="flex-1 py-2 bg-slate-700/50 rounded-lg text-xs text-slate-300 flex items-center justify-center gap-1 active:scale-95 transition-transform"
                    >
                      查看详情
                    </button>
                    {(record.syncStatus === 'pending' || record.syncStatus === 'failed') && (
                      <button
                        onClick={() => { if (isOnline) syncRecord(record.id) }}
                        disabled={!isOnline}
                        className={`flex-1 py-2 rounded-lg text-xs font-medium flex items-center justify-center gap-1 active:scale-95 transition-transform ${
                          isOnline ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Upload className="w-3 h-3" />
                        {isOnline ? '补传' : '离线中'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {groupRecords.length === 0 && group.status === 'synced' && (
                <p className="text-xs text-slate-600 text-center py-3">暂无已同步记录</p>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function GunTimelineView() {
  const navigate = useNavigate()
  const { getGroupedByGunPosition } = useInspectionStore()
  const grouped = getGroupedByGunPosition()

  if (Object.keys(grouped).length === 0) {
    return (
      <div className="text-center py-16">
        <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <p className="text-sm text-slate-500">暂无巡检记录</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {Object.entries(grouped).map(([gpId, recs]) => {
        const sorted = [...recs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        const gp = sorted[0].gunPosition
        return (
          <div key={gpId}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                <Flame className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <span className="font-semibold text-sm">{gp.code}</span>
                <p className="text-xs text-slate-400">{gp.area} · {gp.cableModel}</p>
              </div>
              <span className="ml-auto text-xs text-slate-500">{sorted.length} 次巡检</span>
            </div>

            {sorted.length > 1 && (
              <div className="mb-3 bg-slate-800/40 border border-slate-700/30 rounded-xl p-3">
                <p className="text-[10px] text-slate-500 mb-2 font-medium">温度变化趋势</p>
                <div className="flex items-end gap-1 h-12">
                  {[...sorted].reverse().map((r, i) => {
                    const temp = r.meterReading || 0
                    const maxTemp = Math.max(...sorted.map((s) => s.meterReading || 0), r.standardValue)
                    const height = maxTemp > 0 ? Math.max(8, (temp / maxTemp) * 48) : 8
                    const isOver = temp > r.standardValue
                    return (
                      <div key={r.id} className="flex-1 flex flex-col items-center gap-0.5">
                        <span className="text-[9px] text-slate-400" style={{ fontFamily: 'DIN Alternate, monospace' }}>{temp || '-'}</span>
                        <div
                          className={`w-full rounded-sm ${isOver ? 'bg-red-500/60' : 'bg-emerald-500/40'}`}
                          style={{ height: `${height}px` }}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="flex items-end gap-1 mt-0.5">
                  {[...sorted].reverse().map((r) => (
                    <div key={r.id} className="flex-1 text-center">
                      <span className="text-[8px] text-slate-600">
                        {new Date(r.createdAt).toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2 ml-4 border-l-2 border-slate-700/50 pl-4">
              {sorted.map((record) => {
                const recColor = record.recommendation === 'stop' ? 'text-red-400' : record.recommendation === 'monitor' ? 'text-amber-400' : 'text-emerald-400'
                return (
                  <button
                    key={record.id}
                    onClick={() => navigate(`/records/${record.id}`)}
                    className="w-full text-left bg-slate-800/60 border border-slate-700/50 rounded-xl p-3 active:scale-[0.98] transition-transform"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-400">
                        {new Date(record.createdAt).toLocaleString('zh-CN')}
                      </span>
                      <span className={`text-xs font-medium ${recColor}`}>
                        {record.recommendation ? RECOMMENDATION_LABELS[record.recommendation] : '未判定'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      {record.meterReading !== null && (
                        <span style={{ fontFamily: 'DIN Alternate, monospace' }}>
                          {record.meterReading}℃
                        </span>
                      )}
                      {record.touchTemperature && (
                        <span>{TOUCH_TEMPERATURE_LABELS[record.touchTemperature]}</span>
                      )}
                      {record.photos.length > 0 && (
                        <span className="flex items-center gap-0.5">
                          <MessageSquare className="w-3 h-3" />
                          {record.photos.length}照
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function Records() {
  const navigate = useNavigate()
  const { records, getOfflineRecords } = useInspectionStore()
  const { isOnline } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const offlineRecords = getOfflineRecords()

  const filteredRecords = records.filter((r) => {
    const matchSearch =
      !searchTerm ||
      r.gunPosition.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.gunPosition.area.toLowerCase().includes(searchTerm.toLowerCase())
    return matchSearch
  })

  const groupedByDate = filteredRecords.reduce<Record<string, InspectionRecord[]>>((acc, record) => {
    const date = new Date(record.createdAt).toLocaleDateString('zh-CN')
    if (!acc[date]) acc[date] = []
    acc[date].push(record)
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="px-5 pt-6 pb-3">
        <h1 className="text-xl font-bold tracking-tight">巡检记录</h1>
        <p className="text-sm text-slate-400 mt-0.5">历史巡检与复查</p>
      </header>

      <div className="px-5 mb-3">
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
          { key: 'list' as ViewMode, label: '全部记录' },
          { key: 'sync_queue' as ViewMode, label: `离线队列${offlineRecords.length > 0 ? ` (${offlineRecords.length})` : ''}` },
          { key: 'gun_timeline' as ViewMode, label: '枪位时间线' },
        ].map((v) => (
          <button
            key={v.key}
            onClick={() => setViewMode(v.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === v.key ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>

      <div className="px-5 pb-24">
        {viewMode === 'sync_queue' && <SyncQueueView />}

        {viewMode === 'gun_timeline' && <GunTimelineView />}

        {viewMode === 'list' && (
          <>
            {filteredRecords.length === 0 && (
              <div className="text-center py-16">
                <ClipboardList className="w-12 h-12 mx-auto mb-3 text-slate-600" />
                <p className="text-sm text-slate-500">暂无巡检记录</p>
              </div>
            )}

            {Object.entries(groupedByDate).map(([date, dateRecords]) => (
              <div key={date} className="mb-5">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                  <span className="text-xs text-slate-400 font-medium">{date}</span>
                  <div className="flex-1 h-px bg-slate-800" />
                </div>
                <div className="space-y-2">
                  {dateRecords.map((record) => {
                    const syncCfg = SYNC_STATUS_CONFIG[record.syncStatus]
                    return (
                      <div key={record.id} className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-sm">{record.gunPosition.code}</span>
                              <span className={`flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] rounded border font-medium ${syncCfg.bg} ${syncCfg.color}`}>
                                {syncCfg.icon}
                                {SYNC_STATUS_LABELS[record.syncStatus]}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400">{record.gunPosition.area}</p>
                          </div>
                          <div className={`px-2 py-0.5 text-[10px] rounded-md border font-medium ${
                            record.recommendation === 'stop' ? 'bg-red-500/15 border-red-500/20 text-red-400'
                              : record.recommendation === 'monitor' ? 'bg-amber-500/15 border-amber-500/20 text-amber-400'
                              : 'bg-emerald-500/15 border-emerald-500/20 text-emerald-400'
                          }`}>
                            {record.recommendation ? RECOMMENDATION_LABELS[record.recommendation] : '未判定'}
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 mb-2.5">
                          <span>{new Date(record.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
                          {record.meterReading !== null && (
                            <span style={{ fontFamily: 'DIN Alternate, monospace' }}>{record.meterReading}℃ / {record.standardValue}℃</span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/records/${record.id}`)}
                            className="flex-1 py-2 bg-slate-700/50 rounded-lg text-xs text-slate-300 flex items-center justify-center gap-1 active:scale-95 transition-transform"
                          >
                            查看详情
                          </button>
                          <button
                            onClick={() => {
                              const newRecordId = useInspectionStore.getState().reinspect(record.id)
                              if (newRecordId) navigate(`/inspect/${record.taskId}`)
                            }}
                            className="flex-1 py-2 bg-orange-500/15 rounded-lg text-xs text-orange-400 flex items-center justify-center gap-1 active:scale-95 transition-transform border border-orange-500/20"
                          >
                            <RotateCcw className="w-3 h-3" />
                            一键复查
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  )
}
