import { HTTP_STATUS } from '@/constants/http'
import { HttpException } from './HttpException.exception'

export type BusinessExceptionPayload = {
    message: string
    errors?: Record<string, string[]>
}

export class BusinessException extends HttpException {
    constructor(data: BusinessExceptionPayload, message = 'Entity Error') {
        super(data, HTTP_STATUS.UNPROCESSABLE_ENTITY, message)
    }
    override get data(): BusinessExceptionPayload {
        return super.data as BusinessExceptionPayload
    }

    get errors() {
        return this.data.errors || {}
    }
}
