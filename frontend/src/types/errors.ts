/* eslint-disable @typescript-eslint/no-explicit-any */
import { HTTP_STATUS } from "@/constants/http";

export type EntityErrorPayload = {
    message: string;
    errors: Record<string, { path: string; msg: string }>;
};

export class HttpError extends Error {
    constructor(
        protected _data: { message: string; [key: string]: any },
        protected _status: number,
        message = "Http Error"
    ) {
        super(message);
    }
    get status() {
        return this._status;
    }
    get data() {
        return this._data;
    }
}

export class EntityError extends HttpError {
    constructor(data: EntityErrorPayload, message = "Entity Error") {
        super(data, HTTP_STATUS.ENTITY_ERROR_STATUS, message);
    }
    override get status() {
        return HTTP_STATUS.ENTITY_ERROR_STATUS;
    }
    override get data(): EntityErrorPayload {
        return super.data as EntityErrorPayload;
    }
}
