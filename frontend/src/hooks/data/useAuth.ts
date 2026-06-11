'use client'

import { useAppDispatch } from '@/store/hooks'
import { useRouter as userI18nRouter } from '@/i18n/navigation'
import { useRouter } from 'next/navigation'
import { useLoginMutation, useLogoutMutation, useRegisterMutation } from '@/store/services/user/auth.service'
import { clearStore } from '@/store'
import { startLoadingByKey, stopLoadingByKey } from '@/store/features/appSlice'
import { Role } from '@/constants/enum'
import { LogoutResType } from '@/types/dtos/auth/auth-response.dto'
import { handleFormError } from '@/utils/errors/handle-form-errors.util'
import {
    LoginReqBody,
    LoginReqBodyType,
    RegisterReqBody,
    RegisterReqBodyType
} from '@/types/dtos/auth/auth-request.dto'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { logger } from '@/utils/logger.util'
import { ADMIN_ROUTES, APP_ROUTES } from '@/constants/routes/routes'

const LOGOUT_LOADING_KEY = 'logout'

export function useLoginWithEmail() {
    const router = useRouter()

    const [loginMutate, loginResult] = useLoginMutation()

    const form = useForm<LoginReqBodyType>({
        resolver: zodResolver(LoginReqBody),
        defaultValues: {
            email: '',
            password: ''
        }
    })

    const onSubmit = useCallback(
        async (data: LoginReqBodyType) => {
            try {
                const result = await loginMutate(data).unwrap()
                const destination =
                    result.data.user.role === Role.SUPER_ADMIN ? ADMIN_ROUTES.DASHBOARD : APP_ROUTES.HOME
                router.push(destination)
                toast.success(result.message)
            } catch (error) {
                handleFormError<LoginReqBodyType>({
                    error,
                    setFormError: form.setError
                })
            }
        },
        [loginMutate, router, form.setError]
    )
    return {
        form,
        onSubmit,
        loginResult
    }
}

export function useRegisterWithEmail() {
    const router = userI18nRouter()

    const [registerMutate, registerResult] = useRegisterMutation()

    const form = useForm<RegisterReqBodyType>({
        resolver: zodResolver(RegisterReqBody),
        defaultValues: {
            email: '',
            password: '',
            confirm_password: '',
            name: '',
            date_of_birth: ''
        }
    })

    const onSubmit = useCallback(
        async (data: RegisterReqBodyType) => {
            try {
                const result = await registerMutate(data).unwrap()
                router.push(APP_ROUTES.HOME)
                toast.success(result.message)
            } catch (error) {
                handleFormError<RegisterReqBodyType>({
                    error,
                    setFormError: form.setError
                })
            }
        },
        [registerMutate, router, form.setError]
    )

    return {
        form,
        onSubmit,
        registerResult
    }
}

interface UseLogoutProps {
    onLogout?: () => void
    onSuccess?: (data: LogoutResType) => void
    onError?: (error: unknown) => void
}

export function useLogout(props?: UseLogoutProps) {
    const [logoutMutate, logoutResult] = useLogoutMutation()
    const router = userI18nRouter()
    const dispatch = useAppDispatch()

    const handleLogout = useCallback(async () => {
        props?.onLogout?.()
        try {
            clearStore(dispatch)
            dispatch(startLoadingByKey(LOGOUT_LOADING_KEY))
            const res = await logoutMutate().unwrap()
            router.replace(APP_ROUTES.HOME)
            router.refresh()
            props?.onSuccess?.(res)
        } catch (error) {
            logger.error('Logout error:', error)
            props?.onError?.(error)
        } finally {
            dispatch(stopLoadingByKey(LOGOUT_LOADING_KEY))
        }
    }, [logoutMutate, router, props, dispatch])

    return {
        handleLogout,
        logoutResult
    }
}
