import { Role, UserVerifyStatus } from '@/constants/enum'

export type UserType = {
    readonly id: number
    readonly uuid: string
    readonly name: string
    readonly email: string
    readonly date_of_birth: string
    readonly updated_at: string
    readonly created_at: string
    readonly verify: UserVerifyStatus
    readonly bio: string
    readonly location: string
    readonly website: string
    readonly username: string
    readonly avatar: string
    readonly following_count: number
    readonly followers_count: number
    readonly likes_count: number
    readonly is_followed: boolean
    readonly is_owner?: boolean
    readonly role: Role
}

/** @deprecated use UserType */
export type UserSchema = UserType
