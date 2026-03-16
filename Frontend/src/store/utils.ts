import { LoginResponseType, RegisterResponseType } from "@/types/response/auth.type";
import { UserType } from "@/types/schemas/User.schema";

export function isExecuteMutation(action: unknown): action is {
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

export function isLogoutMutationAction(action: unknown): action is {
    type: string;
    meta: { arg: { endpointName: "logout" } };
} {
    return (
        isExecuteMutation(action) &&
        action.type.includes("AuthApi/executeMutation/fulfilled") &&
        action.meta.arg.endpointName === "logout"
    );
}

export function isLoginMutationAction(action: unknown): action is {
    type: string;
    meta: { arg: { endpointName: "login" } };
    payload: LoginResponseType;
} {
    return (
        isExecuteMutation(action) &&
        action.type.includes("AuthApi/executeMutation/fulfilled") &&
        action.meta.arg.endpointName === "login" &&
        "payload" in action &&
        typeof action.payload === "object" &&
        action.payload !== null
    );
}

export function isRegisterMutationAction(action: unknown): action is {
    type: string;
    meta: { arg: { endpointName: "register" } };
    payload: RegisterResponseType;
} {
    return (
        isExecuteMutation(action) &&
        action.type.includes("AuthApi/executeMutation/fulfilled") &&
        action.meta.arg.endpointName === "register" &&
        "payload" in action &&
        typeof action.payload === "object" &&
        action.payload !== null
    );
}

export function isTokenReceivedAction(
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

export function isGeMeMutationAction(action: unknown): action is {
    type: string;
    meta: { arg: { endpointName: "getMe" } };
    payload: { data: UserType | null };
} {
    return (
        isExecuteMutation(action) &&
        action.type.includes("UserApi/executeQuery/fulfilled") &&
        action.meta.arg.endpointName === "getMe"
    );
}

export function isSetUserProfileAction(action: unknown): action is { type: string; payload: UserType | null } {
    return (
        typeof action === "object" &&
        action !== null &&
        "type" in action &&
        action.type === "auth/setUserProfile" &&
        "payload" in action &&
        (typeof action.payload === "object" || action.payload === null)
    );
}

export function isSetLoggedOutAction(action: unknown): action is { type: string } {
    return (
        typeof action === "object" && action !== null && "type" in action && action.type === "auth/setLoggedOutAction"
    );
}
