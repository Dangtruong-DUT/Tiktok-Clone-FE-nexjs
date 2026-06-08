export const AsyncStatus = {
    IDLE: 'idle',
    LOADING: 'loading',
    SUCCESS: 'success',
    ERROR: 'error'
} as const

export type AsyncStatusType = (typeof AsyncStatus)[keyof typeof AsyncStatus]

export const AuthStatus = {
    LOADING: 'loading',
    READY: 'ready'
} as const

export type AuthStatusType = (typeof AuthStatus)[keyof typeof AuthStatus]
