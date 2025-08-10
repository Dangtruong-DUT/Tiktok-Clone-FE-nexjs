import { EntityError } from "@/types/errors";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export function isFetchBaseQueryError(error: unknown): error is FetchBaseQueryError {
    return typeof error === "object" && error !== null && "status" in error;
}

export function isEntityError(error: unknown): error is EntityError {
    return (
        isFetchBaseQueryError(error) &&
        error.status === 422 &&
        typeof error.data === "object" &&
        error.data !== null &&
        !(error.data instanceof Array)
    );
}

export function isHttpErrorWithMessage(payload: unknown): payload is { data: { message: string }; status: number } {
    return (
        typeof payload === "object" &&
        payload !== null &&
        "data" in payload &&
        "status" in payload &&
        typeof payload.data === "object" &&
        payload.data !== null &&
        "message" in payload.data &&
        payload.status !== 422
    );
}
