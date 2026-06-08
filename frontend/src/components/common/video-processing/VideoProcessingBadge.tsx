'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { SNAPISTUDIO_ROUTES } from '@/constants/routes/routes'
import { useAppSelector } from '@/store/hooks'
import { isTerminalStatus } from '@/store/features/videoProcessingSlice'

interface VideoProcessingBadgeProps {
    className?: string
}

export function VideoProcessingBadge({ className }: VideoProcessingBadgeProps) {
    const t = useTranslations('SnapiStudio.upload.processing')
    const tracked = useAppSelector((s) => s.videoProcessing.tracked)
    const pending = tracked.filter((e) => !isTerminalStatus(e.status))

    if (pending.length === 0) return null

    return (
        <Link href={SNAPISTUDIO_ROUTES.CONTENT}>
            <div className={cn('flex items-center gap-2 text-xs text-muted-foreground', className)}>
                <div className='relative flex size-2'>
                    <span className='animate-ping absolute inline-flex size-full rounded-full bg-primary opacity-75' />
                    <span className='relative inline-flex rounded-full size-2 bg-primary' />
                </div>
                <span>{t('pending', { count: pending.length })}</span>
            </div>
        </Link>
    )
}
