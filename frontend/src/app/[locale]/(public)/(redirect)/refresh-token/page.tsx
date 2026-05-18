import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import RefreshToken from './refresh-token'
import Loading from '@/components/lottie-icons/loading'

interface RefreshTokenPageProps {
    searchParams: Promise<{ redirect?: string }>
}

export default async function RefreshTokenPage({ searchParams }: RefreshTokenPageProps) {
    const cookieStore = await cookies()
    const hasRefreshToken = !!cookieStore.get('refresh_token')?.value
    const { redirect: redirectPath } = await searchParams

    if (!hasRefreshToken || !redirectPath?.startsWith('/')) {
        redirect('/')
    }

    return (
        <div className='m-auto flex flex-col items-center'>
            <Loading loop className='size-18' />
            <h1 className='text-center font-semibold text-xl'>Redirecting...</h1>
            <RefreshToken redirectPath={redirectPath} />
        </div>
    )
}
