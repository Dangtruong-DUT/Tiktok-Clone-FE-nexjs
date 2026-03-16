import { MediaType } from "@/constants/enum";
import { ResType } from "@/types/response/response.type";

export type UploadFileResponse = ResType<
    {
        url: string;
        type: MediaType.HLS_VIDEO | MediaType.VIDEO | MediaType.IMAGE;
    }[],
    void
>;
