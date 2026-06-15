import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  InspectionRecord,
  CheckItem,
  InspectionPhoto,
  PhotoAnnotation,
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
  syncOfflineRecords: () => void
  getOfflineRecords: () => InspectionRecord[]
}

export const useInspectionStore = create<InspectionState>()(
  persist(
    (set, get) => ({
      currentRecord: null,
      records: MOCK_RECORDS,

      initRecord: (taskId, gunPosition) => {
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
          isOffline: !navigator.onLine,
          syncedAt: null,
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
            ? {
                ...state.currentRecord,
                photos: state.currentRecord.photos.filter((p) => p.id !== photoId),
              }
            : null,
        })),

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
        const completedRecord: InspectionRecord = {
          ...currentRecord,
          isOffline: !navigator.onLine,
          syncedAt: navigator.onLine ? new Date().toISOString() : null,
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
          syncedAt: null,
        }
        set({ currentRecord: newRecord })
        return newRecord.id
      },

      syncOfflineRecords: () =>
        set((state) => ({
          records: state.records.map((r) =>
            r.isOffline ? { ...r, isOffline: false, syncedAt: new Date().toISOString() } : r
          ),
        })),

      getOfflineRecords: () => get().records.filter((r) => r.isOffline),
    }),
    {
      name: 'inspection-store',
      partialize: (state) => ({
        records: state.records,
      }),
    }
  )
)
