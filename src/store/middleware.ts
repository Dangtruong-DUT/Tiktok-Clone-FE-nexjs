import { isHttpErrorWithMessage } from "@/helper/checkType";
import clientSessionToken from "@/services/storage/clientSessionToken";
import { storeApiType } from "@/store";
import { setLoggedOutAction } from "@/store/features/authSlice";
import { isRejectedWithValue, Middleware } from "@reduxjs/toolkit";
import { toast } from "sonner";

function isExecuteMutation(action: unknown): action is {
    type: string;
    meta: { arg: { endpointName: string } };
} {
    return (
        typeof action === "object" &&
        action !== null &&
        "type" in action &&
        typeof action.type === "string" &&
        action.type.includes("AuthApi/executeMutation") &&
        "meta" in action &&
        typeof action.meta === "object" &&
        action.meta !== null &&
        "arg" in action.meta &&
        typeof action.meta.arg === "object" &&
        action.meta.arg !== null &&
        "endpointName" in action.meta.arg
    );
}

function isLogoutMutationAction(action: unknown): action is {
    type: string;
    meta: { arg: { endpointName: "logout" } };
} {
    return (
        isExecuteMutation(action) &&
        action.type.includes("AuthApi/executeMutation/fulfilled") &&
        action.meta.arg.endpointName === "logout"
    );
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
function isSetLoggedOutAction(action: unknown): action is { type: string } {
    return (
        typeof action === "object" && action !== null && "type" in action && action.type === "auth/setLoggedOutAction"
    );
}

export const authMiddleware: Middleware = (storeAPI: storeApiType) => (next) => (action) => {
    if (isLogoutMutationAction(action)) {
        storeAPI.dispatch(setLoggedOutAction());
    } else if (isTokenReceivedAction(action)) {
        const { access_token, refresh_token } = action.payload;
        clientSessionToken.setAccessToken(access_token);
        clientSessionToken.setRefreshToken(refresh_token);
    } else if (isSetLoggedOutAction(action)) {
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
