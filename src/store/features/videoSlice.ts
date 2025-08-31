import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface VideoState {
    isMuted: boolean;
}

const initialState: VideoState = {
    isMuted: true,
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
    },
});

export const { toggleMute, setIsMute } = videoSlice.actions;
const videoReducer = videoSlice.reducer;
export default videoReducer;
