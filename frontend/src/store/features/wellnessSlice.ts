import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { WellnessAction } from '@/types/models/screen-time.model'

type WellnessPageType = 'posts' | 'comment' | 'likes' | 'other'

const WELLNESS_SLICE_NAME = 'wellness' as const

interface WellnessAlert {
    title: string
    message: string
    ruleUuid: string
    action: WellnessAction
}

interface WellnessState {
    sessionUuid: string | null
    sessionStartedAt: number | null
    videoWatchSeconds: number
    isAlertVisible: boolean
    activeAlert: WellnessAlert | null
    todayTotalSeconds: number
    todayVideoSeconds: number
    dismissedRules: string[]
    snoozedRules: Record<string, number>
    pageType: WellnessPageType
}

const initialState: WellnessState = {
    sessionUuid: null,
    sessionStartedAt: null,
    videoWatchSeconds: 0,
    isAlertVisible: false,
    activeAlert: null,
    todayTotalSeconds: 0,
    todayVideoSeconds: 0,
    dismissedRules: [],
    snoozedRules: {},
    pageType: 'posts'
}

const wellnessSlice = createSlice({
    name: WELLNESS_SLICE_NAME,
    initialState,
    reducers: {
        setSession(state, action: PayloadAction<{ uuid: string; startedAt: number }>) {
            state.sessionUuid = action.payload.uuid
            state.sessionStartedAt = action.payload.startedAt
            state.videoWatchSeconds = 0
        },

        clearSession(state) {
            state.sessionUuid = null
            state.sessionStartedAt = null
            state.videoWatchSeconds = 0
        },

        showAlert(state, action: PayloadAction<WellnessAlert>) {
            state.isAlertVisible = true
            state.activeAlert = action.payload
        },

        dismissAlert(state, action: PayloadAction<{ resetContinuous?: boolean }>) {
            state.isAlertVisible = false
            state.activeAlert = null
            if (action.payload.resetContinuous) {
                // Reset session start time so continuous timer restarts from zero
                state.sessionStartedAt = Date.now()
            }
        },

        addVideoSeconds(state, action: PayloadAction<number>) {
            state.videoWatchSeconds += action.payload
        },

        setTodayStats(state, action: PayloadAction<{ totalSeconds: number; videoSeconds: number }>) {
            state.todayTotalSeconds = action.payload.totalSeconds
            state.todayVideoSeconds = action.payload.videoSeconds
        },

        suppressRule(state, action: PayloadAction<string>) {
            if (!state.dismissedRules.includes(action.payload)) {
                state.dismissedRules.push(action.payload)
            }
            state.isAlertVisible = false
            state.activeAlert = null
        },

        snoozeRule(state, action: PayloadAction<string>) {
            state.snoozedRules[action.payload] = Date.now() + 10 * 60 * 1000
            state.isAlertVisible = false
            state.activeAlert = null
        },

        clearSessionDismissals(state) {
            state.dismissedRules = []
            state.snoozedRules = {}
        },

        setPageType(state, action: PayloadAction<WellnessPageType>) {
            state.pageType = action.payload
        }
    }
})

export const {
    setSession,
    clearSession,
    showAlert,
    dismissAlert,
    addVideoSeconds,
    setTodayStats,
    suppressRule,
    snoozeRule,
    clearSessionDismissals,
    setPageType
} = wellnessSlice.actions

export default wellnessSlice.reducer
