import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useInspectionStore } from '@/stores/inspectionStore'
import { useTaskStore } from '@/stores/taskStore'
import { SUSPECTED_CAUSES, RECOMMENDATION_LABELS, TOUCH_TEMPERATURE_LABELS } from '@/types'
import { ArrowLeft, Send, CheckCircle2, AlertTriangle, ShieldAlert, ShieldCheck, Eye } from 'lucide-react'

export default function Judge() {
  const { id } = useParams()
  const navigate = useNavigate()
  const {
    currentRecord,
    updateSuspectedCauses,
    updateRecommendation,
    setNotifiedDuty,
    completeInspection,
  } = useInspectionStore()
  const [notifySent, setNotifySent] = useState(false)
  const [selectedCauses, setSelectedCauses] = useState<string[]>([])

  if (!currentRecord) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center px-5">
        <p className="text-slate-400 mb-4">无巡检记录</p>
        <button onClick={() => navigate('/')} className="px-5 py-2 bg-orange-500 rounded-lg text-sm">
          返回首页
        </button>
      </div>
    )
  }

  const generateRecommendation = (): 'continue' | 'monitor' | 'stop' => {
    const hasGunHeadAbnormal = currentRecord.gunHeadCheck.some((c) => c.abnormal)
    const hasCableAbnormal = currentRecord.cableJointCheck.some((c) => c.abnormal)
    const isBurning = currentRecord.touchTemperature === 'burning'
    const isHot = currentRecord.touchTemperature === 'hot'
    const isOverTemp =
      currentRecord.meterReading !== null && currentRecord.meterReading > currentRecord.standardValue * 1.3
    const isSlightlyOverTemp =
      currentRecord.meterReading !== null &&
      currentRecord.meterReading > currentRecord.standardValue &&
      currentRecord.meterReading <= currentRecord.standardValue * 1.3

    if (isBurning || isOverTemp || (hasGunHeadAbnormal && hasCableAbnormal)) return 'stop'
    if (isHot || isSlightlyOverTemp || hasGunHeadAbnormal || hasCableAbnormal) return 'monitor'
    return 'continue'
  }

  const recommendation = currentRecord.recommendation || generateRecommendation()

  const toggleCause = (cause: string) => {
    const newCauses = selectedCauses.includes(cause)
      ? selectedCauses.filter((c) => c !== cause)
      : [...selectedCauses, cause]
    setSelectedCauses(newCauses)
    updateSuspectedCauses(newCauses)
  }

  const handleNotify = () => {
    setNotifySent(true)
    setNotifiedDuty(true)
    setTimeout(() => setNotifySent(false), 3000)
  }

  const handleComplete = () => {
    updateRecommendation(recommendation)
    completeInspection()
    if (id) {
      useTaskStore.getState().updateTaskStatus(id, 'completed')
    }
    navigate(`/inspect/${id}/summary`, { state: { fromJudge: true } })
  }

  const recConfig = {
    continue: {
      bg: 'bg-emerald-500/15 border-emerald-500/30',
      icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
      text: 'text-emerald-400',
      label: RECOMMENDATION_LABELS.continue,
      desc: '各项指标正常，可继续使用',
    },
    monitor: {
      bg: 'bg-amber-500/15 border-amber-500/30',
      icon: <Eye className="w-8 h-8 text-amber-400" />,
      text: 'text-amber-400',
      label: RECOMMENDATION_LABELS.monitor,
      desc: '存在轻微异常，需加强监控频次',
    },
    stop: {
      bg: 'bg-red-500/15 border-red-500/30',
      icon: <ShieldAlert className="w-8 h-8 text-red-400" />,
      text: 'text-red-400',
      label: RECOMMENDATION_LABELS.stop,
      desc: '存在严重异常，建议立即停用检修',
    },
  }

  const rec = recConfig[recommendation]

  const abnormalItems = [
    ...currentRecord.gunHeadCheck.filter((c) => c.abnormal).map((c) => `枪头-${c.name}`),
    ...currentRecord.cableJointCheck.filter((c) => c.abnormal).map((c) => `接头-${c.name}`),
  ]

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="px-4 pt-5 pb-3 flex items-center gap-3">
        <button
          onClick={() => {
            if (currentRecord.photos.length > 0) {
              navigate(`/inspect/${id}/photo`)
            } else {
              navigate(`/inspect/${id}`)
            }
          }}
          className="p-2 -ml-2 active:scale-90 transition-transform"
        >
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <h1 className="text-lg font-semibold">现场判定</h1>
      </header>

      <div className="px-5 pb-28">
        <div className={`rounded-2xl border-2 p-5 mb-5 ${rec.bg}`}>
          <div className="flex items-center gap-3 mb-2">
            {rec.icon}
            <div>
              <h2 className={`text-xl font-bold ${rec.text}`}>{rec.label}</h2>
              <p className="text-xs text-slate-400 mt-0.5">{rec.desc}</p>
            </div>
          </div>
        </div>

        {abnormalItems.length > 0 && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">异常项汇总</h3>
            <div className="flex flex-wrap gap-2">
              {abnormalItems.map((item) => (
                <span key={item} className="px-2.5 py-1 text-xs bg-red-500/15 text-red-400 rounded-lg border border-red-500/20">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {currentRecord.touchTemperature && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">手感测温</h3>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">热感等级</span>
                <span
                  className={`text-sm font-semibold ${
                    currentRecord.touchTemperature === 'normal'
                      ? 'text-emerald-400'
                      : currentRecord.touchTemperature === 'warm'
                        ? 'text-amber-400'
                        : currentRecord.touchTemperature === 'hot'
                          ? 'text-orange-400'
                          : 'text-red-400'
                  }`}
                >
                  {TOUCH_TEMPERATURE_LABELS[currentRecord.touchTemperature]}
                </span>
              </div>
            </div>
          </div>
        )}

        {currentRecord.meterReading !== null && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">仪表读数</h3>
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">温度仪表</span>
                <span className="text-sm font-semibold" style={{ fontFamily: 'DIN Alternate, monospace' }}>
                  {currentRecord.meterReading}℃
                </span>
              </div>
              {currentRecord.infraredReading !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">红外测温</span>
                  <span className="text-sm font-semibold" style={{ fontFamily: 'DIN Alternate, monospace' }}>
                    {currentRecord.infraredReading}℃
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">标准阈值</span>
                <span className="text-sm text-orange-400" style={{ fontFamily: 'DIN Alternate, monospace' }}>
                  {currentRecord.standardValue}℃
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="mb-5">
          <h3 className="text-sm font-semibold text-slate-300 mb-2">疑似原因</h3>
          <p className="text-xs text-slate-500 mb-3">可多选</p>
          <div className="flex flex-wrap gap-2">
            {SUSPECTED_CAUSES.map((cause) => (
              <button
                key={cause}
                onClick={() => toggleCause(cause)}
                className={`px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                  selectedCauses.includes(cause)
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-slate-800/60 text-slate-400 border border-slate-700/50'
                }`}
              >
                {cause}
              </button>
            ))}
          </div>
        </div>

        {recommendation !== 'continue' && (
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">通知值班人员</h3>
            <button
              onClick={handleNotify}
              disabled={notifySent || currentRecord.notifiedDuty}
              className={`w-full py-3 rounded-xl text-sm font-medium flex items-center justify-center gap-2 transition-all active:scale-95 ${
                notifySent || currentRecord.notifiedDuty
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-blue-500/15 text-blue-400 border border-blue-500/30'
              }`}
            >
              {notifySent || currentRecord.notifiedDuty ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  已通知值班人员
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  发送异常通知
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-700/50 px-5 py-4">
        <button
          onClick={handleComplete}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-lg shadow-orange-500/25"
        >
          完成巡检
        </button>
      </div>
    </div>
  )
}
