import { isHttpErrorWithMessage } from "@/helper/checkType";
import clientSessionToken from "@/services/storage/clientSessionToken";
import { storeApiType } from "@/store";
import { setLoggedOutAction, setRole, setUserProfile, tokenReceived } from "@/store/features/authSlice";
import {
    isGeMeMutationAction,
    isLoginMutationAction,
    isLogoutMutationAction,
    isRegisterMutationAction,
    isSetLoggedOutAction,
    isSetUserProfileAction,
    isTokenReceivedAction,
} from "@/store/utils";
import { isRejectedWithValue, Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";

export const authMiddleware: Middleware = (storeAPI: storeApiType) => (next) => (action) => {
    if (isTokenReceivedAction(action)) {
        const { access_token, refresh_token } = action.payload;
        clientSessionToken.setAccessToken(access_token);
        clientSessionToken.setRefreshToken(refresh_token);
        return next(action);
    }

    if (isSetLoggedOutAction(action)) {
        clientSessionToken.clearToken();
        return next(action);
    }

    if (isSetUserProfileAction(action)) {
        const userProfile = action.payload;
        clientSessionToken.setUserProfile(userProfile);
        return next(action);
    }

    if (isLoginMutationAction(action)) {
        const { user, access_token, refresh_token } = action.payload.data;
        const role = user.role;
        storeAPI.dispatch(tokenReceived({ access_token, refresh_token }));
        storeAPI.dispatch(setRole(role));
        storeAPI.dispatch(setUserProfile(user));

        return next(action);
    }

    if (isRegisterMutationAction(action)) {
        const { user, access_token, refresh_token } = action.payload.data;
        const role = user.role;
        storeAPI.dispatch(tokenReceived({ access_token, refresh_token }));
        storeAPI.dispatch(setUserProfile(user));
        storeAPI.dispatch(setRole(role));

        return next(action);
    }

    if (isLogoutMutationAction(action)) {
        storeAPI.dispatch(setLoggedOutAction());
        return next(action);
    }

    if (isGeMeMutationAction(action)) {
        if (action?.payload) {
            storeAPI.dispatch(setUserProfile(action.payload.data));
            clientSessionToken.setUserProfile(action.payload.data);
        }
        return next(action);
    }

    return next(action);
};

export const rtkQueryLogger: Middleware = () => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        if (isHttpErrorWithMessage(action.payload)) {
            toast.error(action.payload.data.message);
        }
    }
    return next(action);
};
