import { storeApiType } from "@/store";
import { loggedOut } from "@/store/features/authSlice";
import { isRejectedWithValue, Middleware } from "@reduxjs/toolkit";

function isLogoutAction(action: unknown): action is { type: string } {
    return typeof action === "object" && action !== null && "type" in action && action.type === "auth/logout/fulfilled";
}

export const rtkQueryAuthMiddleware: Middleware = (storeAPI: storeApiType) => (next) => (action) => {
    if (isLogoutAction(action)) {
        storeAPI.dispatch(loggedOut());
    }
    return next(action);
};

export const rtkQueryLogger: Middleware = (storeAPI: storeApiType) => (next) => (action) => {
    if (isRejectedWithValue(action)) {
        console.error("RTK Query Error:", action);
    }
    return next(action);
};
