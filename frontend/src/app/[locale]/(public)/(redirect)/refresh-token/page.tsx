import { cookies } from 'next/headers'
import RefreshToken from './refresh-token'
import Loading from '@/components/lottie-icons/loading'
import { redirect } from '@/i18n/navigation'
import { LocalesType } from '@/i18n/config'

interface RefreshTokenPageProps {
    searchParams: Promise<{ redirect?: string }>
    params: Promise<{ locale: LocalesType }>
}

export default async function RefreshTokenPage({ searchParams, params }: RefreshTokenPageProps) {
    const { locale } = await params
    const cookieStore = await cookies()
    const hasRefreshToken = !!cookieStore.get('refresh_token')?.value
    const { redirect: redirectPath } = await searchParams

    if (!hasRefreshToken || !redirectPath?.startsWith('/')) {
        redirect({ href: '/', locale })
    }

    return (
        <div className='m-auto flex flex-col items-center'>
            <Loading loop className='size-18' />
            <h1 className='text-center font-semibold text-xl'>Redirecting...</h1>
            <RefreshToken redirectPath={redirectPath!} />
        </div>
    )
}
