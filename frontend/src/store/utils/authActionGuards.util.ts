import { LoginResponseType, RegisterResponseType, UserAuthType } from '@/types/dtos/auth/auth-response.dto'

export function isExecuteMutation(action: unknown): action is {
    type: string
    meta: { arg: { endpointName: string } }
} {
    return (
        typeof action === 'object' &&
        action !== null &&
        'type' in action &&
        typeof action.type === 'string' &&
        'meta' in action &&
        typeof action.meta === 'object' &&
        action.meta !== null &&
        'arg' in action.meta &&
        typeof action.meta.arg === 'object' &&
        action.meta.arg !== null &&
        'endpointName' in action.meta.arg
    )
}

export function isLogoutMutationAction(action: unknown): action is {
    type: string
    meta: { arg: { endpointName: 'logout' } }
} {
    return (
        isExecuteMutation(action) &&
        action.type.includes('AuthApi/executeMutation/fulfilled') &&
        action.meta.arg.endpointName === 'logout'
    )
}

export function isLoginMutationAction(action: unknown): action is {
    type: string
    meta: { arg: { endpointName: 'login' } }
    payload: LoginResponseType
} {
    return (
        isExecuteMutation(action) &&
        action.type.includes('AuthApi/executeMutation/fulfilled') &&
        action.meta.arg.endpointName === 'login' &&
        'payload' in action &&
        typeof action.payload === 'object' &&
        action.payload !== null
    )
}

export function isSignUpMutationAction(action: unknown): action is {
    type: string
    meta: { arg: { endpointName: 'register' } }
    payload: RegisterResponseType
} {
    return (
        isExecuteMutation(action) &&
        action.type.includes('AuthApi/executeMutation/fulfilled') &&
        action.meta.arg.endpointName === 'register' &&
        'payload' in action &&
        typeof action.payload === 'object' &&
        action.payload !== null
    )
}

export function isGetMeQueryAction(action: unknown): action is {
    type: string
    meta: { arg: { endpointName: 'getMe' } }
    payload: { data: UserAuthType | null }
} {
    return (
        isExecuteMutation(action) &&
        action.type.includes('UserApi/executeQuery/fulfilled') &&
        action.meta.arg.endpointName === 'getMe' &&
        'payload' in action &&
        typeof action.payload === 'object' &&
        action.payload !== null
    )
}
