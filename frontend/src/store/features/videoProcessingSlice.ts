import { EncodingStatus } from '@/constants/enum'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const STORAGE_KEY = 'videoProcessing'
const STALE_HOURS = 24

export interface TrackedEncoding {
    uploadFileUuid: string
    postUuid: string | null
    status: EncodingStatus
    progress: number
    trackedAt: string
}

interface VideoProcessingState {
    tracked: TrackedEncoding[]
}

function isTerminalStatus(status: EncodingStatus): boolean {
    return status === EncodingStatus.READY || status === EncodingStatus.FAILED
}

function loadFromStorage(): TrackedEncoding[] {
    if (typeof window === 'undefined') return []
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed: TrackedEncoding[] = JSON.parse(raw)
        const cutoff = Date.now() - STALE_HOURS * 60 * 60 * 1000
        return parsed.filter((e) => new Date(e.trackedAt).getTime() > cutoff && !isTerminalStatus(e.status))
    } catch {
        return []
    }
}

function saveToStorage(tracked: TrackedEncoding[]): void {
    if (typeof window === 'undefined') return
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tracked))
    } catch {
        // storage quota exceeded or unavailable — ignore
    }
}

const videoProcessingSlice = createSlice({
    name: 'videoProcessing',
    initialState: (): VideoProcessingState => ({
        tracked: loadFromStorage()
    }),
    reducers: {
        trackEncoding(state, action: PayloadAction<TrackedEncoding>) {
            const idx = state.tracked.findIndex((e) => e.uploadFileUuid === action.payload.uploadFileUuid)
            if (idx >= 0) {
                state.tracked[idx] = action.payload
            } else {
                state.tracked.push(action.payload)
            }
            saveToStorage(state.tracked)
        },
        updateEncodingStatus(
            state,
            action: PayloadAction<{ uuid: string; status: EncodingStatus; progress: number }>
        ) {
            const enc = state.tracked.find((e) => e.uploadFileUuid === action.payload.uuid)
            if (enc) {
                enc.status = action.payload.status
                enc.progress = action.payload.progress
                saveToStorage(state.tracked)
            }
        },
        untrackEncoding(state, action: PayloadAction<string>) {
            state.tracked = state.tracked.filter((e) => e.uploadFileUuid !== action.payload)
            saveToStorage(state.tracked)
        },
        clearStaleEncodings(state) {
            const cutoff = Date.now() - STALE_HOURS * 60 * 60 * 1000
            state.tracked = state.tracked.filter(
                (e) => new Date(e.trackedAt).getTime() > cutoff && !isTerminalStatus(e.status)
            )
            saveToStorage(state.tracked)
        }
    }
})

export { isTerminalStatus }
export const { trackEncoding, updateEncodingStatus, untrackEncoding, clearStaleEncodings } =
    videoProcessingSlice.actions
export default videoProcessingSlice.reducer
