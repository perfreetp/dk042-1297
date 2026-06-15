import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useInspectionStore } from '@/stores/inspectionStore'
import { useAppStore } from '@/stores/appStore'
import { RECOMMENDATION_LABELS, TOUCH_TEMPERATURE_LABELS, SYNC_STATUS_LABELS, PhotoAnnotation, SyncStatus } from '@/types'
import { ArrowLeft, ShieldCheck, Eye, ShieldAlert, CheckCircle2, RotateCcw, Copy, MessageSquare, Clock, CloudOff, CloudUpload, CloudDone, CloudAlert, Upload } from 'lucide-react'

const SYNC_CONFIG: Record<SyncStatus, { color: string; bg: string; icon: React.ReactNode }> = {
  pending: { color: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/30', icon: <CloudOff className="w-4 h-4" /> },
  syncing: { color: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/30', icon: <CloudUpload className="w-4 h-4 animate-pulse" /> },
  synced: { color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', icon: <CloudDone className="w-4 h-4" /> },
  failed: { color: 'text-red-400', bg: 'bg-red-500/15 border-red-500/30', icon: <CloudAlert className="w-4 h-4" /> },
}

function AnnotationMarker({ annotation }: { annotation: PhotoAnnotation }) {
  if (annotation.type === 'circle') {
    return (
      <div className="absolute pointer-events-none" style={{ left: `${annotation.x * 100}%`, top: `${annotation.y * 100}%`, transform: 'translate(-50%, -50%)' }}>
        <div className="w-10 h-10 rounded-full border-2 border-orange-400 animate-pulse shadow-[0_0_10px_rgba(255,107,53,0.6)]" />
      </div>
    )
  }
  if (annotation.type === 'arrow') {
    return (
      <div className="absolute pointer-events-none" style={{ left: `${annotation.x * 100}%`, top: `${annotation.y * 100}%`, transform: 'translate(-50%, -50%)' }}>
        <svg className="w-6 h-6 text-orange-400 drop-shadow-lg" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5H7z" /></svg>
      </div>
    )
  }
  if (annotation.type === 'text' && annotation.content) {
    return (
      <div className="absolute pointer-events-none" style={{ left: `${annotation.x * 100}%`, top: `${annotation.y * 100}%`, transform: 'translate(-50%, -50%)' }}>
        <div className="px-2 py-1 bg-orange-500 text-white text-xs rounded font-bold whitespace-nowrap shadow-lg">{annotation.content}</div>
      </div>
    )
  }
  return null
}

export default function Summary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { getRecordById, reinspect, syncRecord } = useInspectionStore()
  const { isOnline } = useAppStore()
  const fromJudge = (location.state as { fromJudge?: boolean })?.fromJudge

  const record = id ? getRecordById(id) : undefined

  if (!record) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center px-5">
        <p className="text-slate-400 mb-4">未找到巡检记录</p>
        <button onClick={() => navigate('/')} className="px-5 py-2 bg-orange-500 rounded-lg text-sm">返回首页</button>
      </div>
    )
  }

  const recConfig = {
    continue: { bg: 'bg-emerald-500/15 border-emerald-500/30', icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />, text: 'text-emerald-400' },
    monitor: { bg: 'bg-amber-500/15 border-amber-500/30', icon: <Eye className="w-6 h-6 text-amber-400" />, text: 'text-amber-400' },
    stop: { bg: 'bg-red-500/15 border-red-500/30', icon: <ShieldAlert className="w-6 h-6 text-red-400" />, text: 'text-red-400' },
  }

  const rec = record.recommendation ? recConfig[record.recommendation] : null
  const syncCfg = SYNC_CONFIG[record.syncStatus]

  const abnormalItems = [
    ...record.gunHeadCheck.filter((c) => c.abnormal).map((c) => `枪头-${c.name}`),
    ...record.cableJointCheck.filter((c) => c.abnormal).map((c) => `接头-${c.name}`),
  ]

  const handleReinspect = () => {
    if (!id) return
    reinspect(id)
    navigate(`/inspect/${record.taskId}`)
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="px-4 pt-5 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(fromJudge ? '/records' : -1)} className="p-2 -ml-2 active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <h1 className="text-lg font-semibold">巡检小结</h1>
      </header>

      <div className="px-5 pb-28">
        {fromJudge && (
          <div className="flex items-center justify-center gap-2 mb-5 py-2">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <span className="text-emerald-400 font-semibold">巡检完成</span>
          </div>
        )}

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">{record.gunPosition.code}</h2>
            <span className="text-xs text-slate-400">{new Date(record.createdAt).toLocaleString('zh-CN')}</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-400">所属区域</span><span>{record.gunPosition.area}</span></div>
            <div className="flex justify-between"><span className="text-slate-400">线缆型号</span><span>{record.gunPosition.cableModel}</span></div>
          </div>
        </div>

        {rec && record.recommendation && (
          <div className={`rounded-2xl border-2 p-4 mb-4 ${rec.bg}`}>
            <div className="flex items-center gap-2.5">
              {rec.icon}
              <span className={`text-base font-bold ${rec.text}`}>{RECOMMENDATION_LABELS[record.recommendation]}</span>
            </div>
          </div>
        )}

        {abnormalItems.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">异常项</h3>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3.5">
              <div className="flex flex-wrap gap-1.5">
                {abnormalItems.map((item) => (
                  <span key={item} className="px-2 py-0.5 text-xs bg-red-500/15 text-red-400 rounded-md">{item}</span>
                ))}
              </div>
            </div>
          </div>
        )}

        {record.touchTemperature && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">手感测温</h3>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5">
              <span className={`text-sm font-semibold ${record.touchTemperature === 'normal' ? 'text-emerald-400' : record.touchTemperature === 'warm' ? 'text-amber-400' : record.touchTemperature === 'hot' ? 'text-orange-400' : 'text-red-400'}`}>
                {TOUCH_TEMPERATURE_LABELS[record.touchTemperature]}
              </span>
            </div>
          </div>
        )}

        {record.meterReading !== null && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">仪表读数</h3>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-slate-400">温度仪表</span><span style={{ fontFamily: 'DIN Alternate, monospace' }}>{record.meterReading}℃</span></div>
              {record.infraredReading !== null && (
                <div className="flex justify-between text-sm"><span className="text-slate-400">红外测温</span><span style={{ fontFamily: 'DIN Alternate, monospace' }}>{record.infraredReading}℃</span></div>
              )}
              <div className="flex justify-between text-sm"><span className="text-slate-400">标准阈值</span><span className="text-orange-400" style={{ fontFamily: 'DIN Alternate, monospace' }}>{record.standardValue}℃</span></div>
            </div>
          </div>
        )}

        {record.suspectedCauses.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">疑似原因</h3>
            <div className="flex flex-wrap gap-1.5">
              {record.suspectedCauses.map((cause) => (
                <span key={cause} className="px-2.5 py-1 text-xs bg-orange-500/15 text-orange-400 rounded-lg border border-orange-500/20">{cause}</span>
              ))}
            </div>
          </div>
        )}

        {record.photos.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">现场照片 <span className="text-xs text-slate-500 font-normal">({record.photos.length}张)</span></h3>
            <div className="space-y-3">
              {record.photos.map((photo, i) => (
                <div key={photo.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
                  <div className="relative">
                    <img src={photo.url} alt={`现场照片 ${i + 1}`} className="w-full h-48 object-cover" />
                    {photo.annotations.map((ann, j) => (
                      <AnnotationMarker key={j} annotation={ann} />
                    ))}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs">
                      #{i + 1}
                    </div>
                  </div>
                  <div className="p-3 space-y-1.5">
                    {photo.remark && (
                      <div className="flex items-start gap-1.5">
                        <MessageSquare className="w-3 h-3 text-slate-500 mt-0.5 shrink-0" />
                        <span className="text-xs text-slate-300">{photo.remark}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-3 text-[10px] text-slate-500">
                      <span className="flex items-center gap-0.5"><Copy className="w-2.5 h-2.5" />{photo.annotations.length} 标注</span>
                      <span className="flex items-center gap-0.5"><Clock className="w-2.5 h-2.5" />{new Date(photo.timestamp).toLocaleString('zh-CN')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">同步状态</h3>
          <div className={`rounded-xl border p-3.5 ${syncCfg.bg}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {syncCfg.icon}
                <span className={`text-sm font-medium ${syncCfg.color}`}>{SYNC_STATUS_LABELS[record.syncStatus]}</span>
              </div>
              {(record.syncStatus === 'pending' || record.syncStatus === 'failed') && (
                <button
                  onClick={() => { if (isOnline) syncRecord(record.id) }}
                  disabled={!isOnline}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium active:scale-95 transition-transform ${
                    isOnline ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Upload className="w-3 h-3" />
                  {isOnline ? '补传' : '离线中'}
                </button>
              )}
            </div>
            {record.syncedAt && (
              <p className="text-xs text-slate-400 mt-1.5 ml-6">同步时间：{new Date(record.syncedAt).toLocaleString('zh-CN')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-700/50 px-5 py-4">
        <div className="flex gap-2">
          <button
            onClick={() => navigate('/records')}
            className="flex-1 py-3 bg-slate-700 rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            返回记录
          </button>
          <button
            onClick={() => navigate(`/report/${id}`)}
            className="flex-1 py-3 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-semibold active:scale-95 transition-transform border border-blue-500/30 flex items-center justify-center gap-1.5"
          >
            <Copy className="w-4 h-4" />
            导出报告
          </button>
          <button
            onClick={handleReinspect}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            复查
          </button>
        </div>
      </div>
    </div>
  )
}
