import { JwtPayload } from 'jsonwebtoken'
import { Role, TokenType, UserVerifyStatus } from '@/constants/enum'

export interface TokenPayload extends JwtPayload {
    user_id: string
    uuid: string
    sub: string
    token_Type: TokenType
    verify: UserVerifyStatus
    role: Role
    exp: number
    iat: number
}
