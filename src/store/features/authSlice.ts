import { Role } from "@/constants/enum";
import { UserType } from "@/types/schemas/User.schema";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
    refresh_token: string | null;
    access_token: string | null;
    role: Role | null;
    user_profile: UserType | null;
}

const initialState: AuthState = {
    refresh_token: null,
    access_token: null,
    role: null,
    user_profile: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        tokenReceived: (state, action: PayloadAction<{ refresh_token: string; access_token: string }>) => {
            state.refresh_token = action.payload.refresh_token;
            state.access_token = action.payload.access_token;
        },
        setRole: (state, action: PayloadAction<Role | null>) => {
            state.role = action.payload;
        },
        setLoggedOutAction: (state) => {
            state.refresh_token = null;
            state.access_token = null;
            state.role = null;
        },
        setUserProfile: (state, action: PayloadAction<UserType | null>) => {
            state.user_profile = action.payload;
        },
    },
});

export const { tokenReceived, setLoggedOutAction, setRole, setUserProfile } = authSlice.actions;
const authReducer = authSlice.reducer;
export default authReducer;
