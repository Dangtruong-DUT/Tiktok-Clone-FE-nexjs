import { ResType } from "@/types/response/response.type";

export interface UserIndicatorItem {
    date: string;
    likes_count: number;
    guests_view: number;
    users_view: number;
    comments_count: number;
}

export interface UserIndicatorsData {
    likes_count: number;
    guests_view: number;
    users_view: number;
    comments_count: number;
    Indicator: UserIndicatorItem[];
}

export type UserIndicatorsResponse = {
    message: string;
    data: UserIndicatorsData;
};
