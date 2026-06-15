import { create } from 'zustand'
import {
  InspectionRecord,
  CheckItem,
  InspectionPhoto,
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
  updateSuspectedCauses: (causes: string[]) => void
  updateRecommendation: (value: InspectionRecord['recommendation']) => void
  setNotifiedDuty: (value: boolean) => void
  completeInspection: () => void
  loadRecord: (recordId: string) => void
  getRecordsByGunPosition: (gunPositionId: string) => InspectionRecord[]
  hasAbnormality: () => boolean
  reinspect: (recordId: string) => void
  syncOfflineRecords: () => void
  getOfflineRecords: () => InspectionRecord[]
}

export const useInspectionStore = create<InspectionState>((set, get) => ({
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
    if (!currentRecord) return
    const completedRecord = {
      ...currentRecord,
      isOffline: !navigator.onLine,
      syncedAt: navigator.onLine ? new Date().toISOString() : null,
    }
    set({
      currentRecord: null,
      records: [completedRecord, ...records],
    })
  },

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
    if (record) {
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
    }
  },

  syncOfflineRecords: () =>
    set((state) => ({
      records: state.records.map((r) =>
        r.isOffline ? { ...r, isOffline: false, syncedAt: new Date().toISOString() } : r
      ),
    })),

  getOfflineRecords: () => get().records.filter((r) => r.isOffline),
}))
