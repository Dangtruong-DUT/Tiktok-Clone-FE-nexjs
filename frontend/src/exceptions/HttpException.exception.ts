export class HttpException extends Error {
    constructor(
        protected _data: { message: string; [key: string]: any },
        protected _status: number,
        message = 'Http Error'
    ) {
        super(message)
    }

    get message() {
        return this._data.message || super.message
    }

    get status() {
        return this._status
    }
    get data() {
        return this._data
    }
}
