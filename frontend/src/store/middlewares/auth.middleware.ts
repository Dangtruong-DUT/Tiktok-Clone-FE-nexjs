import { storeApiType } from '@/store'
import { setAuthenticated, setLoggedOutAction, setRole, setUserProfile } from '@/store/features/authSlice'
import {
    isGetMeQueryAction,
    isLoginMutationAction,
    isLogoutMutationAction,
    isSignUpMutationAction
} from '@/store/utils/authActionGuards.util'
import { Middleware } from '@reduxjs/toolkit'

export const authMiddleware: Middleware = (storeAPI: storeApiType) => (next) => (action) => {
    if (isLoginMutationAction(action)) {
        const { user } = action.payload.data
        storeAPI.dispatch(setAuthenticated(true))
        storeAPI.dispatch(setRole(user.role))
        storeAPI.dispatch(setUserProfile(user))
        return next(action)
    }

    if (isSignUpMutationAction(action)) {
        const { user } = action.payload.data
        storeAPI.dispatch(setAuthenticated(true))
        storeAPI.dispatch(setRole(user.role))
        storeAPI.dispatch(setUserProfile(user))
        return next(action)
    }

    if (isLogoutMutationAction(action)) {
        storeAPI.dispatch(setLoggedOutAction())
        return next(action)
    }

    if (isGetMeQueryAction(action)) {
        if (action.payload?.data) {
            const user = action.payload.data
            storeAPI.dispatch(setAuthenticated(true))
            storeAPI.dispatch(setRole(user.role))
            storeAPI.dispatch(setUserProfile(user))
        }
        return next(action)
    }

    return next(action)
}
