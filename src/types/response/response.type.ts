export type ResType<DataType, MetaType> = {
    data: DataType;
    message: string;
    meta?: MetaType;
};
