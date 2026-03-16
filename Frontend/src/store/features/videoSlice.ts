import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VideoState {
    isMuted: boolean;
    volume: number;
}

const initialState: VideoState = {
    isMuted: true,
    volume: 0.5,
};

const videoSlice = createSlice({
    name: "video",
    initialState,
    reducers: {
        toggleMute: (state) => {
            state.isMuted = !state.isMuted;
        },
        setIsMute: (state, action: PayloadAction<boolean>) => {
            state.isMuted = action.payload;
        },
        setVolume: (state, action: PayloadAction<number>) => {
            state.volume = Math.min(1, Math.max(0, action.payload));
        },
    },
});

export const { toggleMute, setIsMute, setVolume } = videoSlice.actions;
const videoReducer = videoSlice.reducer;
export default videoReducer;
