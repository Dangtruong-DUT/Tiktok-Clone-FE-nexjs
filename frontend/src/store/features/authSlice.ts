import { Role } from '@/constants/enum'
import { UserType } from '@/types/models/user.model'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
    isAuthenticated: boolean
    role: Role | null
    user_profile: Partial<UserType> | null
}

const initialState: AuthState = {
    isAuthenticated: false,
    role: null,
    user_profile: null
}

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthenticated: (state, action: PayloadAction<boolean>) => {
            state.isAuthenticated = action.payload
        },
        setRole: (state, action: PayloadAction<Role | null>) => {
            state.role = action.payload
        },
        setLoggedOutAction: (state) => {
            state.isAuthenticated = false
            state.role = null
            state.user_profile = null
        },
        setUserProfile: (state, action: PayloadAction<Partial<UserType> | null>) => {
            state.user_profile = action.payload
        }
    }
})

export const { setAuthenticated, setLoggedOutAction, setRole, setUserProfile } = authSlice.actions
const authReducer = authSlice.reducer
export default authReducer
