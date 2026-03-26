'use client'

import ErrorIcon from '@/components/lottie-icons/error-icon'
import Loading from '@/components/lottie-icons/loading'
import VerifyIcon from '@/components/lottie-icons/verify-icon'
import { SearchParamsLoader, useSearchParamsLoader } from '@/components/searchparams-loader'
import { useAppDispatch } from '@/store/hooks'
import { useRouter } from '@/i18n/navigation'
import { useVerifyEmailMutation } from '@/store/services/auth.service'
import { setRole, tokenReceived } from '@/store/features/authSlice'
import { useCallback, useEffect, useState } from 'react'
export default function VerifyPage() {
    const { searchParams, setSearchParams } = useSearchParamsLoader()

    const dispatch = useAppDispatch()

    const router = useRouter()

    const token = searchParams?.get('token')
    const [verifyEmailMutate] = useVerifyEmailMutation()
    const [VerifyStatus, setVerifyStatus] = useState<'loading' | 'success' | 'error'>('loading')

    const handleVerifyEmail = useCallback(
        async (token: string) => {
            try {
                const response = await verifyEmailMutate({ email_verify_token: token }).unwrap()
                const { access_token, refresh_token, user } = response.data
                dispatch(tokenReceived({ access_token, refresh_token }))
                dispatch(setRole(user.role))
                router.push('/')
                setVerifyStatus('success')
            } catch (error) {
                console.error('Error verifying email:', error)
                setVerifyStatus('error')
            }
        },
        [verifyEmailMutate]
    )

    useEffect(() => {
        if (token) {
            handleVerifyEmail(token)
        }
    }, [token, handleVerifyEmail])

    const statusTitle = {
        loading: 'Verifying...',
        success: 'Verification Successful!',
        error: 'Sorry your verify code invalid or you have already verified your email.'
    }

    return (
        <div className='m-auto flex flex-col items-center gap-4'>
            <div className='size-35 flex items-center justify-center'>
                {VerifyStatus === 'loading' && <Loading loop className='size-18' />}
                {VerifyStatus === 'success' && <VerifyIcon className='size-35' loop />}
                {VerifyStatus === 'error' && <ErrorIcon className='size-20' />}
            </div>

            <h1 className='text-center font-semibold text-xl w-md '>{statusTitle[VerifyStatus]}</h1>
            <SearchParamsLoader onParamsReceived={setSearchParams} />
        </div>
    )
}
