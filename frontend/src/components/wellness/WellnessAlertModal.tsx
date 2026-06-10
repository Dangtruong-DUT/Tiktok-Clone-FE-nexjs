'use client'

import { Clock, Coffee } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { suppressRule, snoozeRule } from '@/store/features/wellnessSlice'

export function WellnessAlertModal() {
    const dispatch = useAppDispatch()
    const isVisible = useAppSelector((s) => s.wellness.isAlertVisible)
    const activeAlert = useAppSelector((s) => s.wellness.activeAlert)

    if (!isVisible || !activeAlert) return null

    return (
        <div className='fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm'>
            <div className='mx-4 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-2xl animate-in zoom-in-95 fade-in duration-300 [animation-timing-function:cubic-bezier(0.175,0.885,0.32,1.275)]'>
                <div className='mb-4 flex justify-center'>
                    <div className='flex size-14 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-950/40'>
                        <Clock size={28} className='text-yellow-600 dark:text-yellow-400' />
                    </div>
                </div>

                <h2 className='text-center text-base font-semibold text-foreground'>{activeAlert.title}</h2>

                <p className='mt-2 text-center text-sm text-muted-foreground leading-relaxed'>{activeAlert.message}</p>

                <div className='mt-5 flex flex-col gap-2'>
                    <Button onClick={() => dispatch(snoozeRule(activeAlert.ruleUuid))} className='w-full gap-2'>
                        <Coffee size={15} />
                        Nhắc lại sau 10 phút
                    </Button>

                    <Button
                        variant='outline'
                        className='w-full'
                        onClick={() => dispatch(suppressRule(activeAlert.ruleUuid))}
                    >
                        OK — Tiếp tục dùng
                    </Button>
                </div>

                <button
                    className='mt-3 w-full text-center text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors'
                    onClick={() => dispatch(suppressRule(activeAlert.ruleUuid))}
                >
                    Tắt cảnh báo này hôm nay
                </button>
            </div>
        </div>
    )
}
