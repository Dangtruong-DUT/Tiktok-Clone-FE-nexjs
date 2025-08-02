import { UserVerifyStatus } from "@/constants/enum";

export interface UserType {
    _id: string;
    name: string;
    email: string;
    password: string;
    date_of_birth: string;
    updated_at: string;
    created_at: string;
    email_verify_token: string;
    forgot_password_token: string;
    verify: UserVerifyStatus;
    bio: string;
    location: string;
    website: string;
    username: string;
    avatar: string;
    cover_photo: string;
}
