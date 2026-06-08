import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AppState {
    loadingByKey: Record<string, number>
}

const initialState: AppState = {
    loadingByKey: {}
}

const appSlice = createSlice({
    name: 'app',
    initialState,
    reducers: {
        setLoadingByKey: (state, action: PayloadAction<{ key: string; isLoading: boolean }>) => {
            const { key, isLoading } = action.payload

            if (!isLoading) {
                delete state.loadingByKey[key]
                return
            }

            state.loadingByKey[key] = 1
        },
        startLoadingByKey: (state, action: PayloadAction<string>) => {
            const key = action.payload
            state.loadingByKey[key] = (state.loadingByKey[key] ?? 0) + 1
        },
        stopLoadingByKey: (state, action: PayloadAction<string>) => {
            const key = action.payload
            const nextValue = (state.loadingByKey[key] ?? 0) - 1

            if (nextValue <= 0) {
                delete state.loadingByKey[key]
                return
            }

            state.loadingByKey[key] = nextValue
        },
        clearAllLoading: (state) => {
            state.loadingByKey = {}
        }
    }
})

export const { setLoadingByKey, startLoadingByKey, stopLoadingByKey, clearAllLoading } = appSlice.actions

const appReducer = appSlice.reducer
export default appReducer
