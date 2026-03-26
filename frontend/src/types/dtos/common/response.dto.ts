import {
    HttpResponseWithData,
    HttpResponseWithEntityErrors,
    HttpResponseWithMeta
} from '@/types/common/http-response.type'

export type ResType<DataType, MetaType = void> = [MetaType] extends [void]
    ? HttpResponseWithData<DataType>
    : HttpResponseWithMeta<DataType, MetaType>

export type ErrorResponseType = HttpResponseWithEntityErrors

export type EntityErrorResType = HttpResponseWithEntityErrors
