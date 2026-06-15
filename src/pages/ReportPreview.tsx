import { useNavigate, useParams } from 'react-router-dom'
import { useInspectionStore } from '@/stores/inspectionStore'
import { RECOMMENDATION_LABELS, TOUCH_TEMPERATURE_LABELS, SYNC_STATUS_LABELS, PhotoAnnotation, InspectionRecord } from '@/types'
import { ArrowLeft, Copy, CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

function generateReportText(record: InspectionRecord): string {
  const lines: string[] = []
  lines.push('═══════════════════════════════════')
  lines.push('    枪线温升巡检报告')
  lines.push('═══════════════════════════════════')
  lines.push('')
  lines.push(`枪位编号：${record.gunPosition.code}`)
  lines.push(`所属区域：${record.gunPosition.area}`)
  lines.push(`线缆型号：${record.gunPosition.cableModel}`)
  lines.push(`巡检时间：${new Date(record.createdAt).toLocaleString('zh-CN')}`)
  lines.push('')

  lines.push('── 检查结果 ──')
  const gunAbnormals = record.gunHeadCheck.filter((c) => c.abnormal).map((c) => c.name)
  const cableAbnormals = record.cableJointCheck.filter((c) => c.abnormal).map((c) => c.name)
  if (gunAbnormals.length > 0) lines.push(`枪头异常项：${gunAbnormals.join('、')}`)
  else lines.push('枪头检查：正常')
  if (cableAbnormals.length > 0) lines.push(`接头异常项：${cableAbnormals.join('、')}`)
  else lines.push('接头检查：正常')
  lines.push('')

  lines.push('── 温度数据 ──')
  if (record.touchTemperature) lines.push(`手感测温：${TOUCH_TEMPERATURE_LABELS[record.touchTemperature]}`)
  if (record.meterReading !== null) lines.push(`仪表读数：${record.meterReading}℃（标准值 ${record.standardValue}℃）`)
  if (record.infraredReading !== null) lines.push(`红外测温：${record.infraredReading}℃`)
  const isOver = record.meterReading !== null && record.meterReading > record.standardValue
  if (isOver) lines.push(`⚠ 超标 ${record.meterReading! - record.standardValue}℃`)
  lines.push('')

  if (record.suspectedCauses.length > 0) {
    lines.push('── 疑似原因 ──')
    record.suspectedCauses.forEach((c, i) => lines.push(`${i + 1}. ${c}`))
    lines.push('')
  }

  lines.push('── 判定建议 ──')
  if (record.recommendation) {
    const label = RECOMMENDATION_LABELS[record.recommendation]
    lines.push(`▸ ${label}`)
    if (record.recommendation === 'stop') lines.push('  建议立即停用并安排检修')
    if (record.recommendation === 'monitor') lines.push('  建议加强监控频次，关注温度变化')
  }
  lines.push('')

  if (record.photos.length > 0) {
    lines.push('── 异常照片 ──')
    record.photos.forEach((photo, i) => {
      lines.push(`照片${i + 1}：${photo.remark || '（无备注）'}`)
      lines.push(`  标注数：${photo.annotations.length}  拍摄时间：${new Date(photo.timestamp).toLocaleString('zh-CN')}`)
    })
    lines.push('')
  }

  lines.push('── 同步状态 ──')
  lines.push(`${record.isOffline ? '离线保存' : '已同步'} · ${SYNC_STATUS_LABELS[record.syncStatus]}`)
  if (record.syncedAt) lines.push(`同步时间：${new Date(record.syncedAt).toLocaleString('zh-CN')}`)
  if (record.notifiedDuty) lines.push('已通知值班人员')

  lines.push('')
  lines.push('═══════════════════════════════════')
  return lines.join('\n')
}

function AnnotationMarker({ annotation }: { annotation: PhotoAnnotation }) {
  if (annotation.type === 'circle') {
    return (
      <div className="absolute pointer-events-none" style={{ left: `${annotation.x * 100}%`, top: `${annotation.y * 100}%`, transform: 'translate(-50%, -50%)' }}>
        <div className="w-10 h-10 rounded-full border-2 border-orange-400 shadow-[0_0_10px_rgba(255,107,53,0.6)]" />
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

export default function ReportPreview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getRecordById } = useInspectionStore()
  const [copied, setCopied] = useState(false)

  const record = id ? getRecordById(id) : undefined

  if (!record) {
    return (
      <div className="min-h-screen bg-[#0F172A] text-white flex flex-col items-center justify-center px-5">
        <p className="text-slate-400 mb-4">未找到巡检记录</p>
        <button onClick={() => navigate(-1)} className="px-5 py-2 bg-orange-500 rounded-lg text-sm">返回</button>
      </div>
    )
  }

  const reportText = generateReportText(record)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(reportText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = reportText
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2500)
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 active:scale-90 transition-transform">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <h1 className="text-lg font-semibold">巡检报告</h1>
        </div>
        <button
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all active:scale-95 ${
            copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
          }`}
        >
          {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? '已复制' : '复制报告'}
        </button>
      </header>

      <div className="px-5 pb-24">
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-2xl p-5 mb-5">
          <pre className="text-xs text-slate-300 whitespace-pre-wrap leading-relaxed" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans SC", sans-serif' }}>
            {reportText}
          </pre>
        </div>

        {record.photos.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 mb-3">异常照片</h3>
            <div className="space-y-3">
              {record.photos.map((photo, i) => (
                <div key={photo.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden">
                  <div className="relative">
                    <img src={photo.url} alt={`照片 ${i + 1}`} className="w-full h-44 object-cover" />
                    {photo.annotations.map((ann, j) => (
                      <AnnotationMarker key={j} annotation={ann} />
                    ))}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs">#{i + 1}</div>
                  </div>
                  {(photo.remark || photo.annotations.length > 0) && (
                    <div className="p-3 space-y-1">
                      {photo.remark && <p className="text-xs text-slate-300">{photo.remark}</p>}
                      <p className="text-[10px] text-slate-500">{photo.annotations.length} 个标注 · {new Date(photo.timestamp).toLocaleString('zh-CN')}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-700/50 px-5 py-4">
        <button
          onClick={handleCopy}
          className={`w-full py-3 rounded-xl text-sm font-semibold active:scale-95 transition-transform flex items-center justify-center gap-2 ${
            copied ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg shadow-orange-500/25'
          }`}
        >
          {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? '报告已复制到剪贴板' : '一键复制报告文字'}
        </button>
      </div>
    </div>
  )
}
