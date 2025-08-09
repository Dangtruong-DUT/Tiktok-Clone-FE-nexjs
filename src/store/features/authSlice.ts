import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    refresh_token: string | null;
    access_token: string | null;
}

const initialState: AuthState = {
    refresh_token: null,
    access_token: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        tokenReceived: (state, action: PayloadAction<{ refresh_token: string; access_token: string }>) => {
            state.refresh_token = action.payload.refresh_token;
            state.access_token = action.payload.access_token;
        },
        loggedOut: (state) => {
            state.refresh_token = null;
            state.access_token = null;
        },
    },
});

export const { tokenReceived, loggedOut } = authSlice.actions;
const authReducer = authSlice.reducer;
export default authReducer;
