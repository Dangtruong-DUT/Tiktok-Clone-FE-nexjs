import { EncodingStatus } from "@/constants/enum";

export interface VideoStatusType {
    _id: string;
    name: string;
    status: EncodingStatus;
    message: string;
    created_at: Date;
    updated_at: Date;
}
