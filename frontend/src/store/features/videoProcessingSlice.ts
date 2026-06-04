import { TERMINAL_UPLOAD_STATUSES, VideoUploadStatus } from '@/constants/enum'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

const STORAGE_KEY = 'videoProcessing'
const STALE_HOURS = 24

export interface TrackedEncoding {
    sessionUuid: string
    postUuid: string | null
    status: VideoUploadStatus
    progress: number
    trackedAt: string
}

interface VideoProcessingState {
    tracked: TrackedEncoding[]
}

function isTerminalStatus(status: VideoUploadStatus): boolean {
    return (TERMINAL_UPLOAD_STATUSES as readonly VideoUploadStatus[]).includes(status)
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function loadFromStorage(): TrackedEncoding[] {
    if (typeof window === 'undefined') return []
    try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return []
        const parsed: TrackedEncoding[] = JSON.parse(raw)
        const cutoff = Date.now() - STALE_HOURS * 60 * 60 * 1000
        return parsed.filter(
            (e) =>
                UUID_RE.test(e.sessionUuid) &&
                new Date(e.trackedAt).getTime() > cutoff &&
                !isTerminalStatus(e.status)
        )
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
            const idx = state.tracked.findIndex((e) => e.sessionUuid === action.payload.sessionUuid)
            if (idx >= 0) {
                state.tracked[idx] = action.payload
            } else {
                state.tracked.push(action.payload)
            }
            saveToStorage(state.tracked)
        },
        updateEncodingStatus(
            state,
            action: PayloadAction<{ sessionUuid: string; status: VideoUploadStatus; progress: number }>
        ) {
            const enc = state.tracked.find((e) => e.sessionUuid === action.payload.sessionUuid)
            if (enc) {
                enc.status = action.payload.status
                enc.progress = action.payload.progress
                saveToStorage(state.tracked)
            }
        },
        untrackEncoding(state, action: PayloadAction<string>) {
            state.tracked = state.tracked.filter((e) => e.sessionUuid !== action.payload)
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
