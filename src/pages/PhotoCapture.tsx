import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useInspectionStore } from '@/stores/inspectionStore'
import { ArrowLeft, Camera, Trash2, Circle, MoveUpRight, Type } from 'lucide-react'

export default function PhotoCapture() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentRecord, updatePhotos } = useInspectionStore()
  const [activeTool, setActiveTool] = useState<'circle' | 'arrow' | 'text' | null>(null)

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

  const handleTakePhoto = () => {
    const newPhoto = {
      id: `photo-${Date.now()}`,
      url: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=industrial%20electrical%20cable%20connection%20showing%20heat%20damage%2C%20close%20up%20photograph%2C%20metal%20surface%20discoloration%20and%20oxidation&image_size=landscape_4_3`,
      annotations: [],
      timestamp: new Date().toISOString(),
    }
    updatePhotos([...currentRecord.photos, newPhoto])
  }

  const handleRemovePhoto = (photoId: string) => {
    updatePhotos(currentRecord.photos.filter((p) => p.id !== photoId))
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white">
      <header className="px-4 pt-5 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(`/inspect/${id}`)}
            className="p-2 -ml-2 active:scale-90 transition-transform"
          >
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </button>
          <h1 className="text-lg font-semibold">异常拍照</h1>
        </div>
        <span className="text-sm text-slate-400">{currentRecord.photos.length} 张</span>
      </header>

      <div className="px-5">
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 mb-5">
          <p className="text-xs text-amber-300">
            检测到异常项，请拍照记录发热点位置。使用标注工具标记具体位置。
          </p>
        </div>

        {currentRecord.photos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 rounded-full bg-slate-800/60 flex items-center justify-center mb-4">
              <Camera className="w-10 h-10 text-slate-500" />
            </div>
            <p className="text-sm text-slate-400 mb-6">点击下方按钮拍摄异常照片</p>
          </div>
        )}

        {currentRecord.photos.length > 0 && (
          <div className="space-y-3 mb-5">
            {currentRecord.photos.map((photo, i) => (
              <div key={photo.id} className="relative rounded-xl overflow-hidden border border-slate-700/50">
                <img
                  src={photo.url}
                  alt={`异常照片 ${i + 1}`}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs">
                  #{i + 1}
                </div>
                {photo.annotations.map((ann, j) => (
                  <div
                    key={j}
                    className="absolute"
                    style={{
                      left: `${ann.x * 100}%`,
                      top: `${ann.y * 100}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                  >
                    {ann.type === 'circle' && (
                      <div className="w-8 h-8 rounded-full border-2 border-orange-400 animate-pulse" />
                    )}
                    {ann.type === 'arrow' && (
                      <MoveUpRight className="w-6 h-6 text-orange-400 drop-shadow-lg" />
                    )}
                  </div>
                ))}
                <button
                  onClick={() => handleRemovePhoto(photo.id)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-center gap-2 mb-5">
          <button
            onClick={() => setActiveTool(activeTool === 'circle' ? null : 'circle')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all ${
              activeTool === 'circle'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700/50'
            }`}
          >
            <Circle className="w-3.5 h-3.5" />
            圆圈标注
          </button>
          <button
            onClick={() => setActiveTool(activeTool === 'arrow' ? null : 'arrow')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all ${
              activeTool === 'arrow'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700/50'
            }`}
          >
            <MoveUpRight className="w-3.5 h-3.5" />
            箭头标注
          </button>
          <button
            onClick={() => setActiveTool(activeTool === 'text' ? null : 'text')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs transition-all ${
              activeTool === 'text'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700/50'
            }`}
          >
            <Type className="w-3.5 h-3.5" />
            文字标注
          </button>
        </div>

        <div className="flex items-center justify-center mb-8">
          <button
            onClick={handleTakePhoto}
            className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center active:scale-90 transition-transform shadow-lg shadow-orange-500/30 border-4 border-orange-400/30"
          >
            <Camera className="w-7 h-7" />
          </button>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-700/50 px-5 py-4">
        <button
          onClick={() => navigate(`/inspect/${id}/judge`)}
          className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl text-sm font-semibold active:scale-95 transition-transform shadow-lg shadow-orange-500/25"
        >
          继续判定
        </button>
      </div>
    </div>
  )
}
