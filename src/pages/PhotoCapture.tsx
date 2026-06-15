import { useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useInspectionStore } from '@/stores/inspectionStore'
import { PhotoAnnotation, InspectionPhoto } from '@/types'
import { ArrowLeft, Camera, Trash2, Circle, MoveUpRight, Type } from 'lucide-react'

type AnnotationTool = 'circle' | 'arrow' | 'text' | null

function AnnotationOverlay({ annotation, onRemove }: { annotation: PhotoAnnotation; onRemove: () => void }) {
  if (annotation.type === 'circle') {
    return (
      <div
        className="absolute cursor-pointer group"
        style={{
          left: `${annotation.x * 100}%`,
          top: `${annotation.y * 100}%`,
          transform: 'translate(-50%, -50%)',
        }}
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
        <div className="w-10 h-10 rounded-full border-2 border-orange-400 animate-pulse shadow-[0_0_10px_rgba(255,107,53,0.6)] group-hover:border-red-400" />
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
          点击删除
        </div>
      </div>
    )
  }
  if (annotation.type === 'arrow') {
    return (
      <div
        className="absolute cursor-pointer group"
        style={{
          left: `${annotation.x * 100}%`,
          top: `${annotation.y * 100}%`,
          transform: 'translate(-50%, -50%)',
        }}
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
        <MoveUpRight className="w-7 h-7 text-orange-400 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] group-hover:text-red-400" />
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
          点击删除
        </div>
      </div>
    )
  }
  if (annotation.type === 'text' && annotation.content) {
    return (
      <div
        className="absolute cursor-pointer group"
        style={{
          left: `${annotation.x * 100}%`,
          top: `${annotation.y * 100}%`,
          transform: 'translate(-50%, -50%)',
        }}
        onClick={(e) => {
          e.stopPropagation()
          onRemove()
        }}
      >
        <div className="px-2 py-1 bg-orange-500 text-white text-xs rounded font-bold whitespace-nowrap shadow-lg group-hover:bg-red-500">
          {annotation.content}
        </div>
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap">
          点击删除
        </div>
      </div>
    )
  }
  return null
}

export default function PhotoCapture() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentRecord, addPhoto, removePhoto, addAnnotation } = useInspectionStore()
  const [activeTool, setActiveTool] = useState<AnnotationTool>(null)
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null)
  const imgRefs = useRef<Record<string, HTMLImageElement | null>>({})

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
    const newPhoto: InspectionPhoto = {
      id: `photo-${Date.now()}`,
      url: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=industrial%20electrical%20cable%20connection%20close%20up%2C%20copper%20connector%20with%20heat%20discoloration%2C%20factory%20environment%2C%20realistic%20photograph&image_size=landscape_4_3`,
      annotations: [],
      timestamp: new Date().toISOString(),
    }
    addPhoto(newPhoto)
    setActivePhotoId(newPhoto.id)
  }

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>, photo: InspectionPhoto) => {
    if (!activeTool) return
    const img = e.currentTarget
    const rect = img.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height

    if (activeTool === 'text') {
      const text = prompt('请输入标注文字：')
      if (!text) return
      addAnnotation(photo.id, { type: 'text', x, y, content: text })
    } else {
      addAnnotation(photo.id, { type: activeTool, x, y })
    }
  }

  const handleRemoveAnnotation = (photoId: string, annIndex: number) => {
    const photo = currentRecord.photos.find((p) => p.id === photoId)
    if (!photo) return
    const newAnnotations = photo.annotations.filter((_, i) => i !== annIndex)
    const updatedPhotos = currentRecord.photos.map((p) =>
      p.id === photoId ? { ...p, annotations: newAnnotations } : p
    )
    useInspectionStore.getState().updatePhotos(updatedPhotos)
  }

  const activePhoto = currentRecord.photos.find((p) => p.id === activePhotoId)

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
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3.5 mb-4">
          <p className="text-xs text-amber-300">
            检测到异常项，请拍照记录发热点位置。选择标注工具后，点击照片对应位置添加标记。
          </p>
        </div>

        {currentRecord.photos.length > 0 && (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-300 mb-2">标注工具</h3>
              <div className="flex gap-2">
                {[
                  { key: 'circle' as const, icon: <Circle className="w-4 h-4" />, label: '圆圈' },
                  { key: 'arrow' as const, icon: <MoveUpRight className="w-4 h-4" />, label: '箭头' },
                  { key: 'text' as const, icon: <Type className="w-4 h-4" />, label: '文字' },
                ].map((tool) => (
                  <button
                    key={tool.key}
                    onClick={() => setActiveTool(activeTool === tool.key ? null : tool.key)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      activeTool === tool.key
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                    }`}
                  >
                    {tool.icon}
                    {tool.label}
                  </button>
                ))}
              </div>
              {activeTool && (
                <p className="text-xs text-orange-400/80 mt-2">
                  已选「{activeTool === 'circle' ? '圆圈' : activeTool === 'arrow' ? '箭头' : '文字'}」工具，点击照片位置添加标注
                </p>
              )}
            </div>

            <div className="space-y-3 mb-5">
              {currentRecord.photos.map((photo, i) => (
                <div
                  key={photo.id}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all ${
                    activePhotoId === photo.id ? 'border-orange-500' : 'border-slate-700/50'
                  }`}
                >
                  <img
                    ref={(el) => {
                      imgRefs.current[photo.id] = el
                    }}
                    src={photo.url}
                    alt={`异常照片 ${i + 1}`}
                    className={`w-full h-52 object-cover ${activeTool ? 'cursor-crosshair' : ''}`}
                    onClick={(e) => handleImageClick(e, photo)}
                  />
                  {photo.annotations.map((ann, j) => (
                    <AnnotationOverlay
                      key={j}
                      annotation={ann}
                      onRemove={() => handleRemoveAnnotation(photo.id, j)}
                    />
                  ))}
                  <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-md text-xs">
                    #{i + 1} · {photo.annotations.length}标注
                  </div>
                  <button
                    onClick={() => removePhoto(photo.id)}
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center active:scale-90 transition-transform"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}

        {currentRecord.photos.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-24 h-24 rounded-full bg-slate-800/60 flex items-center justify-center mb-4">
              <Camera className="w-10 h-10 text-slate-500" />
            </div>
            <p className="text-sm text-slate-400 mb-6">点击下方按钮拍摄异常照片</p>
          </div>
        )}

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
