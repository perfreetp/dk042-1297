import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useInspectionStore } from '@/stores/inspectionStore'
import { RECOMMENDATION_LABELS, TOUCH_TEMPERATURE_LABELS } from '@/types'
import { ArrowLeft, ShieldCheck, Eye, ShieldAlert, CheckCircle2, RotateCcw } from 'lucide-react'

export default function Summary() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { records } = useInspectionStore()
  const fromJudge = (location.state as { fromJudge?: boolean })?.fromJudge

  const record = fromJudge
    ? useInspectionStore.getState().currentRecord
    : records.find((r) => r.id === id)

  if (!record) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center px-5">
        <p className="text-slate-400 mb-4">未找到巡检记录</p>
        <button onClick={() => navigate('/')} className="px-5 py-2 bg-orange-500 rounded-lg text-sm">
          返回首页
        </button>
      </div>
    )
  }

  const recConfig = {
    continue: {
      bg: 'bg-emerald-500/15 border-emerald-500/30',
      icon: <ShieldCheck className="w-6 h-6 text-emerald-400" />,
      text: 'text-emerald-400',
    },
    monitor: {
      bg: 'bg-amber-500/15 border-amber-500/30',
      icon: <Eye className="w-6 h-6 text-amber-400" />,
      text: 'text-amber-400',
    },
    stop: {
      bg: 'bg-red-500/15 border-red-500/30',
      icon: <ShieldAlert className="w-6 h-6 text-red-400" />,
      text: 'text-red-400',
    },
  }

  const rec = record.recommendation ? recConfig[record.recommendation] : null

  const abnormalItems = [
    ...record.gunHeadCheck.filter((c) => c.abnormal).map((c) => `枪头-${c.name}`),
    ...record.cableJointCheck.filter((c) => c.abnormal).map((c) => `接头-${c.name}`),
  ]

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="px-4 pt-5 pb-3 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <h1 className="text-lg font-semibold">巡检小结</h1>
      </header>

      <div className="px-5 pb-24">
        {fromJudge && (
          <div className="flex items-center justify-center gap-2 mb-5">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            <span className="text-emerald-400 font-semibold">巡检完成</span>
          </div>
        )}

        <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">{record.gunPosition.code}</h2>
            <span className="text-xs text-slate-400">
              {new Date(record.createdAt).toLocaleString('zh-CN')}
            </span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">所属区域</span>
              <span>{record.gunPosition.area}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">线缆型号</span>
              <span>{record.gunPosition.cableModel}</span>
            </div>
          </div>
        </div>

        {rec && record.recommendation && (
          <div className={`rounded-2xl border-2 p-4 mb-4 ${rec.bg}`}>
            <div className="flex items-center gap-2.5">
              {rec.icon}
              <span className={`text-base font-bold ${rec.text}`}>
                {RECOMMENDATION_LABELS[record.recommendation]}
              </span>
            </div>
          </div>
        )}

        {abnormalItems.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">异常项</h3>
            <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3.5">
              <div className="flex flex-wrap gap-1.5">
                {abnormalItems.map((item) => (
                  <span key={item} className="px-2 py-0.5 text-xs bg-red-500/15 text-red-400 rounded-md">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {record.touchTemperature && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">手感测温</h3>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5">
              <span className={`text-sm font-semibold ${
                record.touchTemperature === 'normal' ? 'text-emerald-400'
                  : record.touchTemperature === 'warm' ? 'text-amber-400'
                    : record.touchTemperature === 'hot' ? 'text-orange-400'
                      : 'text-red-400'
              }`}>
                {TOUCH_TEMPERATURE_LABELS[record.touchTemperature]}
              </span>
            </div>
          </div>
        )}

        {record.meterReading !== null && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">仪表读数</h3>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">温度仪表</span>
                <span style={{ fontFamily: 'DIN Alternate, monospace' }}>{record.meterReading}℃</span>
              </div>
              {record.infraredReading !== null && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">红外测温</span>
                  <span style={{ fontFamily: 'DIN Alternate, monospace' }}>{record.infraredReading}℃</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">标准阈值</span>
                <span className="text-orange-400" style={{ fontFamily: 'DIN Alternate, monospace' }}>
                  {record.standardValue}℃
                </span>
              </div>
            </div>
          </div>
        )}

        {record.suspectedCauses.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">疑似原因</h3>
            <div className="flex flex-wrap gap-1.5">
              {record.suspectedCauses.map((cause) => (
                <span key={cause} className="px-2.5 py-1 text-xs bg-orange-500/15 text-orange-400 rounded-lg border border-orange-500/20">
                  {cause}
                </span>
              ))}
            </div>
          </div>
        )}

        {record.photos.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">现场照片</h3>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {record.photos.map((photo, i) => (
                <div key={photo.id} className="shrink-0 w-32 h-24 rounded-lg overflow-hidden border border-slate-700/50">
                  <img src={photo.url} alt={`照片 ${i + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
          {record.isOffline ? (
            <span className="text-amber-400">离线保存 · 待补传</span>
          ) : (
            <span>已同步 · {record.syncedAt ? new Date(record.syncedAt).toLocaleString('zh-CN') : ''}</span>
          )}
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-700/50 px-5 py-4">
        <div className="flex gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex-1 py-3 bg-slate-700 rounded-xl text-sm font-medium active:scale-95 transition-transform"
          >
            返回首页
          </button>
          <button
            onClick={() => {
              useInspectionStore.getState().reinspect(record.id)
              navigate(`/inspect/${id}`)
            }}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-lg shadow-orange-500/25 flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            一键复查
          </button>
        </div>
      </div>
    </div>
  )
}
