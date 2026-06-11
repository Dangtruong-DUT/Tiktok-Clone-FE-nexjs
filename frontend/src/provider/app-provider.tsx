'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useContext, useEffect, useState } from 'react'
import NextTopLoader from 'nextjs-toploader'
import { Toaster } from '@/components/ui/sonner'
import { useGetMeQuery } from '@/store/services/user/user.service'
import GlobalAppLoader from '@/components/common/global-app-loader'
import WelcomeScreen from '@/components/common/welcome-screen'
import { VideoProcessingTracker } from '@/components/common/video-processing/VideoProcessingTracker'
import { useProactiveTokenRefresh } from '@/hooks/data/useProactiveTokenRefresh'
import { AuthStatus, AuthStatusType } from '@/constants/status/async'

interface AppContextType {
    authStatus: AuthStatusType
    /** True if an access_token cookie existed at server-render time.
     *  Reliable for banned users whose getMe may fail but who ARE authenticated. */
    hasSession: boolean
}

const AppContext = createContext<AppContextType>({
    authStatus: AuthStatus.LOADING,
    hasSession: false
})

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            staleTime: 1000 * 60 * 5
        }
    }
})

function AuthInitializer({ initialAuthenticated, onReady }: { initialAuthenticated: boolean; onReady: () => void }) {
    const { isSuccess, isError } = useGetMeQuery(undefined, {
        skip: !initialAuthenticated
    })

    useProactiveTokenRefresh()

    useEffect(() => {
        if (!initialAuthenticated || isSuccess || isError) {
            onReady()
        }
    }, [initialAuthenticated, isSuccess, isError, onReady])

    return null
}

export function AppProvider({
    children,
    initialAuthenticated
}: {
    children: React.ReactNode
    initialAuthenticated: boolean
}) {
    const [authStatus, setAuthStatus] = useState<AuthStatusType>(AuthStatus.LOADING)

    return (
        <AppContext value={{ authStatus, hasSession: initialAuthenticated }}>
            <QueryClientProvider client={queryClient}>
                <AuthInitializer
                    initialAuthenticated={initialAuthenticated}
                    onReady={() => setAuthStatus(AuthStatus.READY)}
                />
                {children}
                <Toaster position='top-center' />
                <GlobalAppLoader />
                <WelcomeScreen />
                <VideoProcessingTracker />
                <NextTopLoader showSpinner={false} color='var(--color-brand)' />
            </QueryClientProvider>
        </AppContext>
    )
}

export function useAppContext() {
    const context = useContext(AppContext)
    if (!context) {
        throw new Error('useAppContext must be used within an AppProvider')
    }
    return context
}
