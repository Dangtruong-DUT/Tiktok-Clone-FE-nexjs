import { UserVerifyStatus } from "@/constants/enum";

export interface UserType {
    _id: string;
    name: string;
    email: string;
    password: string;
    date_of_birth: string;
    updated_at: string;
    created_at: string;
    verify: UserVerifyStatus;
    bio: string;
    location: string;
    website: string;
    username: string;
    avatar: string;
    cover_photo: string;
    following_count: number;
    followers_count: number;
    is_followed: boolean;
    isOwner: boolean;
}
