'use client'

import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import { Button } from '@/components/ui/button'
import { UserVerifyStatus } from '@/constants/enum'
import { useResendVerifyEmailMutation } from '@/store/services/user.service'
import { MailCheck, Loader } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'

const RESEND_COOLDOWN_SECONDS = 180
const RESEND_COOLDOWN_STORAGE_KEY = 'settings:verify-email:resend-cooldown-until'

export default function VerifyEmailForm() {
    const t = useTranslations('SnapiStudio.settings')
    const user = useCurrentUserData()
    const [resendVerifyEmailMutate, { isLoading }] = useResendVerifyEmailMutation()
    const [remainingCooldown, setRemainingCooldown] = useState(0)

    const isUnverified = user?.verify === UserVerifyStatus.UNVERIFIED
    const isVerified = user?.verify === UserVerifyStatus.VERIFIED

    useEffect(() => {
        const updateRemainingCooldown = () => {
            const cooldownUntil = Number(localStorage.getItem(RESEND_COOLDOWN_STORAGE_KEY) || 0)
            const diffSeconds = Math.max(0, Math.ceil((cooldownUntil - Date.now()) / 1000))

            setRemainingCooldown(diffSeconds)

            if (diffSeconds === 0 && cooldownUntil > 0) {
                localStorage.removeItem(RESEND_COOLDOWN_STORAGE_KEY)
            }
        }

        updateRemainingCooldown()
        const intervalId = window.setInterval(updateRemainingCooldown, 1000)

        return () => {
            window.clearInterval(intervalId)
        }
    }, [])

    const cooldownLabel = useMemo(() => {
        const minutes = Math.floor(remainingCooldown / 60)
        const seconds = remainingCooldown % 60
        const formattedTime = `${minutes}:${String(seconds).padStart(2, '0')}`

        return `${t('verifyEmail.resendButton')} (${formattedTime})`
    }, [remainingCooldown, t])

    const handleResendVerifyEmail = useCallback(async () => {
        if (isLoading || !isUnverified || remainingCooldown > 0) return

        try {
            const response = await resendVerifyEmailMutate().unwrap()
            toast.success(response.message)

            const cooldownUntil = Date.now() + RESEND_COOLDOWN_SECONDS * 1000
            localStorage.setItem(RESEND_COOLDOWN_STORAGE_KEY, String(cooldownUntil))
            setRemainingCooldown(RESEND_COOLDOWN_SECONDS)
        } catch (error) {
            toast.error(t('verifyEmail.resendError'))
            console.error('Error resending verify email:', error)
        }
    }, [isLoading, isUnverified, remainingCooldown, resendVerifyEmailMutate, t])

    if (!user) return null

    return (
        <div className='space-y-6'>
            <div className='flex items-center gap-2 mb-6'>
                <div className='p-2 rounded-full bg-brand/10'>
                    <MailCheck className='w-5 h-5 text-brand' />
                </div>
                <div>
                    <h3 className='font-semibold'>
                        {isVerified ? t('verifyEmail.verifiedTitle') : t('verifyEmail.title')}
                    </h3>
                    <p className='text-sm text-muted-foreground'>
                        {isVerified ? t('verifyEmail.verifiedDescription') : t('verifyEmail.description')}
                    </p>
                </div>
            </div>

            {isVerified ? (
                <div className='space-y-4'>
                    <div className='rounded-xl p-4 border bg-muted/40'>
                        <p className='text-xs uppercase tracking-wide text-muted-foreground mb-2'>
                            {t('verifyEmail.emailLabel')}
                        </p>
                        <p className='text-sm sm:text-base font-medium text-foreground'>{user.email || ''}</p>
                    </div>
                    <div className='rounded-xl p-4 border border-brand/30 bg-brand/5'>
                        <p className='text-sm text-foreground'>{t('verifyEmail.verifiedDescription')}</p>
                    </div>
                </div>
            ) : (
                <div className='space-y-4'>
                    <div className='rounded-xl p-4 border bg-muted/40'>
                        <p className='text-xs uppercase tracking-wide text-muted-foreground mb-2'>
                            {t('verifyEmail.emailLabel')}
                        </p>
                        <p className='text-sm sm:text-base font-medium text-foreground'>{user.email || ''}</p>
                    </div>

                    <div className='text-sm text-muted-foreground'>
                        {t('verifyEmail.notice', { email: user.email || '' })}
                    </div>

                    <Button
                        size='lg'
                        type='button'
                        disabled={isLoading || remainingCooldown > 0}
                        onClick={handleResendVerifyEmail}
                        className='w-full rounded-full border border-brand/40 bg-transparent text-brand hover:bg-brand/10 hover:text-brand [&_svg]:size-5!'
                    >
                        {isLoading ? <Loader className='animate-spin' /> : t('verifyEmail.resendButton')}
                    </Button>
                </div>
            )}

            {isUnverified && remainingCooldown > 0 && <p className='text-xs text-muted-foreground'>{cooldownLabel}</p>}
        </div>
    )
}
