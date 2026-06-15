import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useInspectionStore } from '@/stores/inspectionStore'
import { useTaskStore } from '@/stores/taskStore'
import {
  InspectionStep,
  STEP_ORDER,
  STEP_LABELS,
  TOUCH_TEMPERATURE_LABELS,
  CheckItem,
} from '@/types'
import {
  ArrowLeft,
  Check,
  ChevronRight,
  ThermometerSun,
  Cable,
  Crosshair,
  Gauge,
} from 'lucide-react'

const STEP_ICONS: Record<InspectionStep, React.ReactNode> = {
  gun_head: <Crosshair className="w-4 h-4" />,
  cable_joint: <Cable className="w-4 h-4" />,
  touch_temp: <ThermometerSun className="w-4 h-4" />,
  meter_reading: <Gauge className="w-4 h-4" />,
}

export default function Inspect() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentRecord, updateGunHeadCheck, updateCableJointCheck, updateTouchTemperature, updateMeterReading, hasAbnormality } = useInspectionStore()
  const [currentStep, setCurrentStep] = useState<InspectionStep>('gun_head')

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

  const stepIndex = STEP_ORDER.indexOf(currentStep)
  const isLastStep = stepIndex === STEP_ORDER.length - 1

  const handleNext = () => {
    if (isLastStep) {
      if (hasAbnormality()) {
        navigate(`/inspect/${id}/photo`)
      } else {
        navigate(`/inspect/${id}/judge`)
      }
    } else {
      setCurrentStep(STEP_ORDER[stepIndex + 1])
    }
  }

  const handlePrev = () => {
    if (stepIndex > 0) {
      setCurrentStep(STEP_ORDER[stepIndex - 1])
    }
  }

  const toggleCheckItem = (items: CheckItem[], index: number, type: 'gunHead' | 'cableJoint') => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, checked: !item.checked, abnormal: !item.checked ? item.abnormal : false } : item
    )
    if (type === 'gunHead') updateGunHeadCheck(newItems)
    else updateCableJointCheck(newItems)
  }

  const toggleAbnormal = (items: CheckItem[], index: number, type: 'gunHead' | 'cableJoint') => {
    const newItems = items.map((item, i) =>
      i === index ? { ...item, abnormal: !item.abnormal, checked: item.abnormal ? item.checked : true } : item
    )
    if (type === 'gunHead') updateGunHeadCheck(newItems)
    else updateCableJointCheck(newItems)
  }

  const touchTempOptions: Array<{ value: 'normal' | 'warm' | 'hot' | 'burning'; color: string; bgColor: string }> = [
    { value: 'normal', color: 'text-emerald-400', bgColor: 'bg-emerald-500/15 border-emerald-500/30' },
    { value: 'warm', color: 'text-amber-400', bgColor: 'bg-amber-500/15 border-amber-500/30' },
    { value: 'hot', color: 'text-orange-400', bgColor: 'bg-orange-500/15 border-orange-500/30' },
    { value: 'burning', color: 'text-red-400', bgColor: 'bg-red-500/15 border-red-500/30' },
  ]

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="px-4 pt-5 pb-3 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 active:scale-90 transition-transform">
          <ArrowLeft className="w-5 h-5 text-slate-300" />
        </button>
        <div className="flex-1">
          <h1 className="text-base font-semibold">{currentRecord.gunPosition.code}</h1>
          <p className="text-xs text-slate-400">{currentRecord.gunPosition.area}</p>
        </div>
      </header>

      <div className="px-5 mb-4">
        <div className="flex items-center gap-1">
          {STEP_ORDER.map((step, i) => (
            <div key={step} className="flex items-center flex-1">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-all ${
                  i === stepIndex
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : i < stepIndex
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'bg-slate-800 text-slate-500'
                }`}
              >
                {i < stepIndex ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  STEP_ICONS[step]
                )}
                <span className="hidden sm:inline">{STEP_LABELS[step]}</span>
              </div>
              {i < STEP_ORDER.length - 1 && (
                <ChevronRight className="w-3 h-3 text-slate-600 mx-0.5 shrink-0" />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 pb-24">
        {currentStep === 'gun_head' && (
          <div>
            <h2 className="text-lg font-semibold mb-1">检查枪头</h2>
            <p className="text-sm text-slate-400 mb-5">勾选发现的异常项</p>
            <div className="space-y-2.5">
              {currentRecord.gunHeadCheck.map((item, i) => (
                <div
                  key={item.name}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    item.abnormal
                      ? 'bg-red-500/10 border-red-500/30'
                      : item.checked
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-slate-800/60 border-slate-700/50'
                  }`}
                >
                  <button
                    onClick={() => toggleAbnormal(currentRecord.gunHeadCheck, i, 'gunHead')}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      item.abnormal
                        ? 'bg-red-500 border-red-500'
                        : 'border-slate-500'
                    }`}
                  >
                    {item.abnormal && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <span className={`flex-1 text-sm font-medium ${item.abnormal ? 'text-red-400' : ''}`}>
                    {item.name}
                  </span>
                  <span className={`text-xs ${item.abnormal ? 'text-red-400' : 'text-slate-500'}`}>
                    {item.abnormal ? '异常' : '正常'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'cable_joint' && (
          <div>
            <h2 className="text-lg font-semibold mb-1">检查线缆接头</h2>
            <p className="text-sm text-slate-400 mb-5">勾选发现的异常项</p>
            <div className="space-y-2.5">
              {currentRecord.cableJointCheck.map((item, i) => (
                <div
                  key={item.name}
                  className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                    item.abnormal
                      ? 'bg-red-500/10 border-red-500/30'
                      : item.checked
                        ? 'bg-emerald-500/5 border-emerald-500/20'
                        : 'bg-slate-800/60 border-slate-700/50'
                  }`}
                >
                  <button
                    onClick={() => toggleAbnormal(currentRecord.cableJointCheck, i, 'cableJoint')}
                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all ${
                      item.abnormal
                        ? 'bg-red-500 border-red-500'
                        : 'border-slate-500'
                    }`}
                  >
                    {item.abnormal && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <span className={`flex-1 text-sm font-medium ${item.abnormal ? 'text-red-400' : ''}`}>
                    {item.name}
                  </span>
                  <span className={`text-xs ${item.abnormal ? 'text-red-400' : 'text-slate-500'}`}>
                    {item.abnormal ? '异常' : '正常'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'touch_temp' && (
          <div>
            <h2 className="text-lg font-semibold mb-1">手感测温</h2>
            <p className="text-sm text-slate-400 mb-5">选择手摸枪头/接头的热感等级</p>
            <div className="grid grid-cols-2 gap-3">
              {touchTempOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateTouchTemperature(opt.value)}
                  className={`p-5 rounded-2xl border-2 transition-all active:scale-95 ${
                    currentRecord.touchTemperature === opt.value
                      ? `${opt.bgColor} scale-105`
                      : 'bg-slate-800/60 border-slate-700/50'
                  }`}
                >
                  <div className={`text-2xl font-bold mb-1 ${opt.color}`} style={{ fontFamily: 'DIN Alternate, monospace' }}>
                    {TOUCH_TEMPERATURE_LABELS[opt.value]}
                  </div>
                  <p className="text-xs text-slate-400">
                    {opt.value === 'normal' && '无明显温升'}
                    {opt.value === 'warm' && '略感温热'}
                    {opt.value === 'hot' && '明显烫手'}
                    {opt.value === 'burning' && '无法持续触摸'}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {currentStep === 'meter_reading' && (
          <div>
            <h2 className="text-lg font-semibold mb-1">仪表读数</h2>
            <p className="text-sm text-slate-400 mb-5">录入温度仪表和红外测温数据</p>

            <div className="space-y-5">
              <div>
                <label className="text-sm text-slate-400 mb-2 block">温度仪表读数 (℃)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={currentRecord.meterReading ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      updateMeterReading(val ? Number(val) : null, currentRecord.infraredReading)
                    }}
                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-3.5 text-2xl font-bold text-center focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/25"
                    style={{ fontFamily: 'DIN Alternate, monospace' }}
                    placeholder="--"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">℃</span>
                </div>
                {currentRecord.meterReading !== null && currentRecord.meterReading > currentRecord.standardValue && (
                  <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                    ⚠ 超过标准值 {currentRecord.standardValue}℃
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm text-slate-400 mb-2 block">红外测温值 (℃)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={currentRecord.infraredReading ?? ''}
                    onChange={(e) => {
                      const val = e.target.value
                      updateMeterReading(currentRecord.meterReading, val ? Number(val) : null)
                    }}
                    className="w-full bg-slate-800/80 border border-slate-700/50 rounded-xl px-4 py-3.5 text-2xl font-bold text-center focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/25"
                    style={{ fontFamily: 'DIN Alternate, monospace' }}
                    placeholder="--"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">℃</span>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">标准温度阈值</span>
                  <span className="text-lg font-bold text-orange-400" style={{ fontFamily: 'DIN Alternate, monospace' }}>
                    {currentRecord.standardValue}℃
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-700/50 px-5 py-4">
        <div className="flex gap-3">
          {stepIndex > 0 && (
            <button
              onClick={handlePrev}
              className="px-5 py-3 bg-slate-700 rounded-xl text-sm font-medium active:scale-95 transition-transform"
            >
              上一步
            </button>
          )}
          <button
            onClick={handleNext}
            className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-lg shadow-orange-500/25"
          >
            {isLastStep ? '完成检查' : '下一步'}
          </button>
        </div>
      </div>
    </div>
  )
}
