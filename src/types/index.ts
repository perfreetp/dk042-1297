export interface GunPosition {
  id: string
  code: string
  area: string
  cableModel: string
  lastInspectionResult: 'normal' | 'warning' | 'danger' | null
  lastInspectionDate: string | null
}

export interface InspectionTask {
  id: string
  gunPosition: GunPosition
  status: 'pending' | 'in_progress' | 'completed'
  dueDate: string
  priority: 'normal' | 'urgent'
}

export interface CheckItem {
  name: string
  checked: boolean
  abnormal: boolean
}

export interface PhotoAnnotation {
  type: 'circle' | 'arrow' | 'text'
  x: number
  y: number
  content?: string
}

export type SyncStatus = 'pending' | 'syncing' | 'synced' | 'failed'

export const SYNC_STATUS_LABELS: Record<SyncStatus, string> = {
  pending: '待补传',
  syncing: '补传中',
  synced: '已同步',
  failed: '补传失败',
}

export interface InspectionPhoto {
  id: string
  url: string
  annotations: PhotoAnnotation[]
  remark: string
  timestamp: string
}

export interface InspectionRecord {
  id: string
  taskId: string
  gunPosition: GunPosition
  gunHeadCheck: CheckItem[]
  cableJointCheck: CheckItem[]
  touchTemperature: 'normal' | 'warm' | 'hot' | 'burning' | null
  meterReading: number | null
  infraredReading: number | null
  standardValue: number
  photos: InspectionPhoto[]
  suspectedCauses: string[]
  recommendation: 'continue' | 'monitor' | 'stop' | null
  notifiedDuty: boolean
  createdAt: string
  isOffline: boolean
  syncStatus: SyncStatus
  syncedAt: string | null
}

export type InspectionStep = 'gun_head' | 'cable_joint' | 'touch_temp' | 'meter_reading'

export const STEP_ORDER: InspectionStep[] = ['gun_head', 'cable_joint', 'touch_temp', 'meter_reading']

export const STEP_LABELS: Record<InspectionStep, string> = {
  gun_head: '检查枪头',
  cable_joint: '检查线缆接头',
  touch_temp: '手感测温',
  meter_reading: '仪表读数',
}

export const TOUCH_TEMPERATURE_LABELS: Record<string, string> = {
  normal: '正常',
  warm: '温热',
  hot: '较烫',
  burning: '烫手',
}

export const SUSPECTED_CAUSES = [
  '接触不良',
  '过载运行',
  '环境温度过高',
  '线缆老化',
  '接头氧化',
  '螺栓松动',
  '散热不良',
  '其他',
]

export const RECOMMENDATION_LABELS: Record<string, string> = {
  continue: '继续使用',
  monitor: '加强监控',
  stop: '立即停用',
}

export const DEFAULT_GUN_HEAD_CHECKS: CheckItem[] = [
  { name: '氧化', checked: false, abnormal: false },
  { name: '变色', checked: false, abnormal: false },
  { name: '变形', checked: false, abnormal: false },
  { name: '烧蚀', checked: false, abnormal: false },
  { name: '裂纹', checked: false, abnormal: false },
]

export const DEFAULT_CABLE_JOINT_CHECKS: CheckItem[] = [
  { name: '松动', checked: false, abnormal: false },
  { name: '烧蚀', checked: false, abnormal: false },
  { name: '过热痕迹', checked: false, abnormal: false },
  { name: '绝缘破损', checked: false, abnormal: false },
  { name: '腐蚀', checked: false, abnormal: false },
]
