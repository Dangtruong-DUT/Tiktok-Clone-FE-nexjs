export enum UserVerifyStatus {
    UNVERIFIED,
    VERIFIED
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
    READY,
    FAILED
}

export enum Audience {
    PUBLIC,
    PRIVATE,
    FRIENDS,
    FOLLOWING
}

export enum PrivacyVisibility {
    PUBLIC,
    PRIVATE
}

export enum PosterType {
    POST,
    RE_POST,
    COMMENT,
    QUOTE_POST
}

export enum Role {
    USER,
    SUPER_ADMIN
}

export enum RelationshipType {
    FOLLOW,
    FRIEND
}

export enum NotificationTypeCode {
    LIKE = 1,
    COMMENT = 2,
    FOLLOW = 3,
    MENTION = 4,
    HASHTAG = 5,
    SYSTEM = 6,
    ADMIN = 7,
    SECURITY = 8
}

export type AudienceValue = Exclude<Audience, Audience.FOLLOWING>
export const AUDIENCE_VALUES = [Audience.PUBLIC, Audience.PRIVATE, Audience.FRIENDS] as const satisfies AudienceValue[]
