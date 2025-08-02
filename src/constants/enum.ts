export enum UserVerifyStatus {
    UNVERIFIED,
    VERIFIED,
    BANNED
}

export enum TokenType {
    ACCESS_TOKEN,
    REFRESH_TOKEN,
    FORGOT_PASSWORD_TOKEN,
    EMAIL_VERIFY_TOKEN
}

export enum MediaType {
    IMAGE,
    VIDEO,
    HLS_VIDEO
}

export enum EncodingStatus {
    PENDING,
    PROCESSING,
    COMPLETED,
    FAILED
}

export enum Audience {
    PUBLIC,
    PRIVATE,
    FRIENDS
}

export enum PosterType {
    POST,
    RE_POST,
    COMMENT,
    QUOTE_POST
}
