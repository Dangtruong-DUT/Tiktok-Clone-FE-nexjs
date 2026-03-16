export type ResType<DataType, MetaType> = {
    data: DataType;
    message: string;
    meta?: MetaType;
};

export type ErrorResponseType = {
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    errors?: Record<string, any>;
};

type ErrorType = {
    [key: string]: {
        msg: string;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
    };
};

export type EntityErrorResType = {
    message: string;
    entity: string;
    errors: ErrorType[];
};
