'use client'

import { Clock, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { dismissAlert } from '@/store/features/wellnessSlice'
import { WELLNESS_ACTIONS } from '@/constants/wellness'

export function WellnessAlertModal() {
    const dispatch     = useAppDispatch()
    const isVisible    = useAppSelector((s) => s.wellness.isAlertVisible)
    const activeAlert  = useAppSelector((s) => s.wellness.activeAlert)

    if (!isVisible || !activeAlert) return null

    const handleRest = () => {
        dispatch(dismissAlert({ resetContinuous: true }))
    }

    const handleContinue = () => {
        dispatch(dismissAlert({ resetContinuous: false }))
    }

    const isSoftBlock = activeAlert.action === WELLNESS_ACTIONS.SOFT_BLOCK

    return (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm'>
            <div className='mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-200'>
                {/* Icon */}
                <div className='mb-4 flex justify-center'>
                    <div className='flex size-14 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-950/40'>
                        <Clock size={28} className='text-yellow-600 dark:text-yellow-400' />
                    </div>
                </div>

                {/* Title */}
                <h2 className='text-center text-base font-semibold text-foreground'>
                    {activeAlert.title}
                </h2>

                {/* Message */}
                <p className='mt-2 text-center text-sm text-muted-foreground leading-relaxed'>
                    {activeAlert.message}
                </p>

                {/* Actions */}
                <div className='mt-5 flex flex-col gap-2'>
                    <Button onClick={handleRest} className='w-full gap-2'>
                        <Coffee size={15} />
                        Nghỉ ngơi ngay
                    </Button>

                    {!isSoftBlock && (
                        <Button
                            variant='ghost'
                            className='w-full text-muted-foreground text-sm'
                            onClick={handleContinue}
                        >
                            Tiếp tục dùng
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
