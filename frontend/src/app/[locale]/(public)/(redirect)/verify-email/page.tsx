'use client'

import ErrorIcon from '@/components/lottie-icons/error-icon'
import Loading from '@/components/lottie-icons/loading'
import VerifyIcon from '@/components/lottie-icons/verify-icon'
import { SearchParamsLoader, useSearchParamsLoader } from '@/components/common/search-params-loader'
import { useAppDispatch } from '@/store/hooks'
import { useRouter } from '@/i18n/navigation'
import { useVerifyEmailMutation } from '@/store/services/user/auth.service'
import { setAuthenticated, setRole, setUserProfile } from '@/store/features/authSlice'
import { useCallback, useEffect, useState } from 'react'
import { logger } from '@/utils/logger.util'
import { AsyncStatus, AsyncStatusType } from '@/constants/status/async'
import { APP_ROUTES } from '@/constants/routes/routes'

type VerifyEmailStatus = Exclude<AsyncStatusType, 'idle'>

type StatusIconConfig = {
    Icon: React.ComponentType<{ className?: string; loop?: boolean }>
    className: string
    loop?: boolean
}

const STATUS_ICON_CONFIG: Record<VerifyEmailStatus, StatusIconConfig> = {
    [AsyncStatus.LOADING]: { Icon: Loading, className: 'size-18', loop: true },
    [AsyncStatus.SUCCESS]: { Icon: VerifyIcon, className: 'size-35', loop: true },
    [AsyncStatus.ERROR]: { Icon: ErrorIcon, className: 'size-20' }
}

const STATUS_TITLE: Record<VerifyEmailStatus, string> = {
    [AsyncStatus.LOADING]: 'Verifying...',
    [AsyncStatus.SUCCESS]: 'Verification Successful!',
    [AsyncStatus.ERROR]: 'Sorry your verify code invalid or you have already verified your email.'
}

export default function VerifyPage() {
    const { searchParams, setSearchParams } = useSearchParamsLoader()
    const dispatch = useAppDispatch()
    const router = useRouter()
    const token = searchParams?.get('token')
    const [verifyEmailMutate] = useVerifyEmailMutation()
    const [verifyStatus, setVerifyStatus] = useState<VerifyEmailStatus>(AsyncStatus.LOADING)

    const handleVerifyEmail = useCallback(
        async (token: string) => {
            try {
                const response = await verifyEmailMutate({ email_verify_token: token }).unwrap()
                const { user } = response.data
                dispatch(setAuthenticated(true))
                dispatch(setRole(user.role))
                dispatch(setUserProfile(user))
                router.push(APP_ROUTES.HOME)
                setVerifyStatus(AsyncStatus.SUCCESS)
            } catch (error) {
                logger.error('Error verifying email:', error)
                setVerifyStatus(AsyncStatus.ERROR)
            }
        },
        [dispatch, router, verifyEmailMutate]
    )

    useEffect(() => {
        if (token) {
            handleVerifyEmail(token)
        }
    }, [token, handleVerifyEmail])

    const { Icon, className, loop } = STATUS_ICON_CONFIG[verifyStatus]

    return (
        <div className='m-auto flex flex-col items-center gap-4'>
            <div className='size-35 flex items-center justify-center'>
                <Icon className={className} loop={loop} />
            </div>
            <h1 className='text-center font-semibold text-xl w-md'>{STATUS_TITLE[verifyStatus]}</h1>
            <SearchParamsLoader onParamsReceived={setSearchParams} />
        </div>
    )
}
