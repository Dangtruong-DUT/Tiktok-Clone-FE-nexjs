'use client'

import { SearchParamsLoader, useSearchParamsLoader } from '@/components/searchparams-loader'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { handleRefreshToken } from '@/lib/auth'
import { useLogoutMutation } from '@/store/services/auth.service'
import { tokenReceived } from '@/store/features/authSlice'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect } from 'react'
import { logger } from '@/utils/logger'

export default function RefreshToken() {
    const refreshTokenFormStore = useAppSelector((state) => state.auth.refresh_token)
    const { searchParams, setSearchParams } = useSearchParamsLoader()
    const redirectQuery = searchParams?.get('redirect')
    const [logoutMutate] = useLogoutMutation()
    const router = useRouter()
    const dispatch = useAppDispatch()

    const handleLogout = useCallback(async () => {
        try {
            await logoutMutate()
            router.push('/')
        } catch (error) {
            logger.error('Error logging out:', error)
        }
    }, [logoutMutate, router])

    const refreshToken = useCallback(async () => {
        await handleRefreshToken({
            onSuccess: (data) => {
                const { access_token, refresh_token } = data.data
                dispatch(tokenReceived({ access_token, refresh_token }))
                if (redirectQuery?.startsWith('/')) {
                    router.replace(redirectQuery)
                    return
                }
                router.replace('/')
            },
            onError: async () => {
                try {
                    await logoutMutate().unwrap()
                } catch (error) {
                    logger.error('Error logging out:', error)
                } finally {
                    router.push('/')
                }
            }
        })
    }, [dispatch, logoutMutate, router, redirectQuery])

    useEffect(() => {
        if (refreshTokenFormStore && refreshToken) {
            refreshToken()
        } else {
            handleLogout()
        }
    }, [refreshToken, refreshTokenFormStore, handleLogout])
    return <SearchParamsLoader onParamsReceived={setSearchParams} />
}
