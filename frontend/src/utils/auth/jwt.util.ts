import jwt from 'jsonwebtoken'
import { logger } from '@/utils/logger'

export const decodeJwt = <T>(token: string): T => {
    const decoded = jwt.decode(token)
    if (!decoded || typeof decoded !== 'object') {
        return {} as T
    }
    return decoded as T
}

export const verifyJwt = (token: string, secret: string): boolean => {
    try {
        jwt.verify(token, secret)
        return true
    } catch (error) {
        logger.error('JWT verification failed:', error)
        return false
    }
}
