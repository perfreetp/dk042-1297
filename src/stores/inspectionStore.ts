import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  InspectionRecord,
  CheckItem,
  InspectionPhoto,
  PhotoAnnotation,
  SyncStatus,
  DEFAULT_GUN_HEAD_CHECKS,
  DEFAULT_CABLE_JOINT_CHECKS,
} from '@/types'
import { MOCK_RECORDS } from '@/data/mock'

interface InspectionState {
  currentRecord: InspectionRecord | null
  records: InspectionRecord[]
  initRecord: (taskId: string, gunPosition: InspectionRecord['gunPosition']) => void
  updateGunHeadCheck: (items: CheckItem[]) => void
  updateCableJointCheck: (items: CheckItem[]) => void
  updateTouchTemperature: (value: InspectionRecord['touchTemperature']) => void
  updateMeterReading: (meter: number | null, infrared: number | null) => void
  updatePhotos: (photos: InspectionPhoto[]) => void
  addPhoto: (photo: InspectionPhoto) => void
  removePhoto: (photoId: string) => void
  updatePhotoRemark: (photoId: string, remark: string) => void
  addAnnotation: (photoId: string, annotation: PhotoAnnotation) => void
  updateSuspectedCauses: (causes: string[]) => void
  updateRecommendation: (value: InspectionRecord['recommendation']) => void
  setNotifiedDuty: (value: boolean) => void
  completeInspection: () => string | null
  getRecordById: (recordId: string) => InspectionRecord | undefined
  loadRecord: (recordId: string) => void
  getRecordsByGunPosition: (gunPositionId: string) => InspectionRecord[]
  hasAbnormality: () => boolean
  reinspect: (recordId: string) => string | null
  syncRecord: (recordId: string) => void
  syncAllOffline: () => void
  getOfflineRecords: () => InspectionRecord[]
  getRecordsBySyncStatus: (status: SyncStatus) => InspectionRecord[]
  getGroupedByGunPosition: () => Record<string, InspectionRecord[]>
}

const getInitialSyncStatus = (): SyncStatus => {
  if (navigator.onLine) return 'synced'
  return 'pending'
}

export const useInspectionStore = create<InspectionState>()(
  persist(
    (set, get) => ({
      currentRecord: null,
      records: MOCK_RECORDS,

      initRecord: (taskId, gunPosition) => {
        const isOnline = navigator.onLine
        const record: InspectionRecord = {
          id: `rec-${Date.now()}`,
          taskId,
          gunPosition,
          gunHeadCheck: DEFAULT_GUN_HEAD_CHECKS.map((c) => ({ ...c })),
          cableJointCheck: DEFAULT_CABLE_JOINT_CHECKS.map((c) => ({ ...c })),
          touchTemperature: null,
          meterReading: null,
          infraredReading: null,
          standardValue: 60,
          photos: [],
          suspectedCauses: [],
          recommendation: null,
          notifiedDuty: false,
          createdAt: new Date().toISOString(),
          isOffline: !isOnline,
          syncStatus: isOnline ? 'synced' : 'pending',
          syncedAt: isOnline ? new Date().toISOString() : null,
        }
        set({ currentRecord: record })
      },

      updateGunHeadCheck: (items) =>
        set((state) => ({
          currentRecord: state.currentRecord ? { ...state.currentRecord, gunHeadCheck: items } : null,
        })),

      updateCableJointCheck: (items) =>
        set((state) => ({
          currentRecord: state.currentRecord ? { ...state.currentRecord, cableJointCheck: items } : null,
        })),

      updateTouchTemperature: (value) =>
        set((state) => ({
          currentRecord: state.currentRecord ? { ...state.currentRecord, touchTemperature: value } : null,
        })),

      updateMeterReading: (meter, infrared) =>
        set((state) => ({
          currentRecord: state.currentRecord
            ? { ...state.currentRecord, meterReading: meter, infraredReading: infrared }
            : null,
        })),

      updatePhotos: (photos) =>
        set((state) => ({
          currentRecord: state.currentRecord ? { ...state.currentRecord, photos } : null,
        })),

      addPhoto: (photo) =>
        set((state) => ({
          currentRecord: state.currentRecord
            ? { ...state.currentRecord, photos: [...state.currentRecord.photos, photo] }
            : null,
        })),

      removePhoto: (photoId) =>
        set((state) => ({
          currentRecord: state.currentRecord
            ? { ...state.currentRecord, photos: state.currentRecord.photos.filter((p) => p.id !== photoId) }
            : null,
        })),

      updatePhotoRemark: (photoId, remark) =>
        set((state) => {
          if (!state.currentRecord) return state
          return {
            currentRecord: {
              ...state.currentRecord,
              photos: state.currentRecord.photos.map((p) =>
                p.id === photoId ? { ...p, remark } : p
              ),
            },
          }
        }),

      addAnnotation: (photoId, annotation) =>
        set((state) => {
          if (!state.currentRecord) return state
          return {
            currentRecord: {
              ...state.currentRecord,
              photos: state.currentRecord.photos.map((p) =>
                p.id === photoId ? { ...p, annotations: [...p.annotations, annotation] } : p
              ),
            },
          }
        }),

      updateSuspectedCauses: (causes) =>
        set((state) => ({
          currentRecord: state.currentRecord ? { ...state.currentRecord, suspectedCauses: causes } : null,
        })),

      updateRecommendation: (value) =>
        set((state) => ({
          currentRecord: state.currentRecord ? { ...state.currentRecord, recommendation: value } : null,
        })),

      setNotifiedDuty: (value) =>
        set((state) => ({
          currentRecord: state.currentRecord ? { ...state.currentRecord, notifiedDuty: value } : null,
        })),

      completeInspection: () => {
        const { currentRecord, records } = get()
        if (!currentRecord) return null
        const isOnline = navigator.onLine
        const completedRecord: InspectionRecord = {
          ...currentRecord,
          isOffline: !isOnline,
          syncStatus: isOnline ? 'synced' : 'pending',
          syncedAt: isOnline ? new Date().toISOString() : null,
        }
        set({
          currentRecord: null,
          records: [completedRecord, ...records],
        })
        return completedRecord.id
      },

      getRecordById: (recordId) => get().records.find((r) => r.id === recordId),

      loadRecord: (recordId) => {
        const record = get().records.find((r) => r.id === recordId)
        if (record) {
          set({ currentRecord: { ...record, id: `rec-${Date.now()}`, createdAt: new Date().toISOString() } })
        }
      },

      getRecordsByGunPosition: (gunPositionId) =>
        get().records.filter((r) => r.gunPosition.id === gunPositionId),

      hasAbnormality: () => {
        const { currentRecord } = get()
        if (!currentRecord) return false
        const hasGunHeadAbnormal = currentRecord.gunHeadCheck.some((c) => c.abnormal)
        const hasCableAbnormal = currentRecord.cableJointCheck.some((c) => c.abnormal)
        const isHot = currentRecord.touchTemperature === 'hot' || currentRecord.touchTemperature === 'burning'
        const isOverTemp =
          currentRecord.meterReading !== null && currentRecord.meterReading > currentRecord.standardValue
        return hasGunHeadAbnormal || hasCableAbnormal || isHot || isOverTemp
      },

      reinspect: (recordId) => {
        const record = get().records.find((r) => r.id === recordId)
        if (!record) return null
        const newRecord: InspectionRecord = {
          ...record,
          id: `rec-${Date.now()}`,
          gunHeadCheck: DEFAULT_GUN_HEAD_CHECKS.map((c) => ({ ...c })),
          cableJointCheck: DEFAULT_CABLE_JOINT_CHECKS.map((c) => ({ ...c })),
          touchTemperature: null,
          meterReading: null,
          infraredReading: null,
          photos: [],
          suspectedCauses: [],
          recommendation: null,
          notifiedDuty: false,
          createdAt: new Date().toISOString(),
          isOffline: !navigator.onLine,
          syncStatus: navigator.onLine ? 'synced' : 'pending',
          syncedAt: navigator.onLine ? new Date().toISOString() : null,
        }
        set({ currentRecord: newRecord })
        return newRecord.id
      },

      syncRecord: (recordId) => {
        const isOnline = navigator.onLine
        if (!isOnline) return
        set((state) => ({
          records: state.records.map((r) =>
            r.id === recordId ? { ...r, syncStatus: 'syncing' as SyncStatus } : r
          ),
        }))
        setTimeout(() => {
          const success = Math.random() > 0.1
          set((state) => ({
            records: state.records.map((r) =>
              r.id === recordId
                ? {
                    ...r,
                    syncStatus: success ? ('synced' as SyncStatus) : ('failed' as SyncStatus),
                    isOffline: !success,
                    syncedAt: success ? new Date().toISOString() : null,
                  }
                : r
            ),
          }))
        }, 1500)
      },

      syncAllOffline: () => {
        const isOnline = navigator.onLine
        if (!isOnline) return
        const offlineRecords = get().records.filter((r) => r.syncStatus === 'pending' || r.syncStatus === 'failed')
        offlineRecords.forEach((r) => {
          get().syncRecord(r.id)
        })
      },

      getOfflineRecords: () =>
        get().records.filter((r) => r.syncStatus === 'pending' || r.syncStatus === 'failed' || r.syncStatus === 'syncing'),

      getRecordsBySyncStatus: (status) => get().records.filter((r) => r.syncStatus === status),

      getGroupedByGunPosition: () =>
        get().records.reduce<Record<string, InspectionRecord[]>>((acc, record) => {
          const key = record.gunPosition.id
          if (!acc[key]) acc[key] = []
          acc[key].push(record)
          return acc
        }, {}),
    }),
    {
      name: 'inspection-store',
      partialize: (state) => ({
        records: state.records,
      }),
    }
  )
)
