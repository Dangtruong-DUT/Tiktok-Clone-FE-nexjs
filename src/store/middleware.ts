import { isHttpErrorWithMessage } from "@/helper/checkType";
import clientSessionToken from "@/services/storage/clientSessionToken";
import { storeApiType } from "@/store";
import { clearToken } from "@/store/features/authSlice";
import { isRejectedWithValue, Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";

function isLogoutAction(action: unknown): action is { type: string } {
    return typeof action === "object" && action !== null && "type" in action && action.type === "auth/logout/fulfilled";
}

function isTokenReceivedAction(
    action: unknown
): action is { type: string; payload: { access_token: string; refresh_token: string } } {
    return (
        typeof action === "object" &&
        action !== null &&
        "type" in action &&
        action.type === "auth/tokenReceived" &&
        "payload" in action &&
        typeof action.payload === "object" &&
        action.payload !== null &&
        "access_token" in action.payload &&
        "refresh_token" in action.payload
    );
}
function isClearTokenAction(action: unknown): action is { type: string } {
    return typeof action === "object" && action !== null && "type" in action && action.type === "auth/loggedOut";
}

export const authMiddleware: Middleware = (storeAPI: storeApiType) => (next) => (action) => {
    if (isLogoutAction(action)) {
        storeAPI.dispatch(clearToken());
    } else if (isTokenReceivedAction(action)) {
        const { access_token, refresh_token } = action.payload;
        clientSessionToken.setAccessToken(access_token);
        clientSessionToken.setRefreshToken(refresh_token);
    } else if (isClearTokenAction(action)) {
        clientSessionToken.clearToken();
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
