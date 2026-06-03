'use client'

import { CalendarClock, Check, X, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { useSchedulePostMutation } from '@/store/services/studio-post-schedule.service'
import type { AiCopilotScheduleOutput, AiCopilotMessageStatus } from '@/types/models/ai-copilot.model'

interface CopilotScheduleCardProps {
    messageUuid: string
    output: AiCopilotScheduleOutput
    status: AiCopilotMessageStatus
    onAccept: (messageUuid: string) => void
    onReject: (messageUuid: string) => void
}

export function CopilotScheduleCard({ messageUuid, output, status, onAccept, onReject }: CopilotScheduleCardProps) {
    const t = useTranslations('SnapiStudio.aiCopilot')
    const [schedulePost, { isLoading }] = useSchedulePostMutation()
    const isDone = status === 'accepted' || status === 'rejected'

    const handleAccept = async () => {
        try {
            await schedulePost({
                postUuid:     output.post_uuid,
                scheduled_at: output.scheduled_at,
                timezone:     output.timezone,
            }).unwrap()
            onAccept(messageUuid)
            toast.success(t('scheduleCard.toastSuccess', { time: output.human_readable }))
        } catch (err: unknown) {
            const serverMsg = (err as { data?: { message?: string } })?.data?.message
            toast.error(serverMsg ?? t('scheduleCard.toastError'))
        }
    }

    if (isDone) {
        return (
            <div className='flex items-center gap-1.5 text-xs text-muted-foreground mt-1'>
                {status === 'accepted' ? (
                    <>
                        <Check className='size-3 text-green-500' />
                        <span>{t('scheduleCard.scheduledAs', { time: output.human_readable })}</span>
                    </>
                ) : (
                    <>
                        <X className='size-3' />
                        <span>{t('scheduleCard.cancelled')}</span>
                    </>
                )}
            </div>
        )
    }

    return (
        <div className='mt-2 rounded-xl border border-border bg-card p-3 space-y-3'>
            <div className='flex items-center gap-2'>
                <CalendarClock className='size-4 text-primary shrink-0' />
                <span className='text-xs font-medium text-muted-foreground'>{t('scheduleCard.panelTitle')}</span>
            </div>

            <div className='rounded-lg bg-primary/10 border border-primary/20 px-3 py-2.5'>
                <p className='text-sm font-semibold text-primary'>{output.human_readable}</p>
                <p className='text-[10px] text-muted-foreground mt-0.5'>{output.timezone}</p>
            </div>

            <div className='flex items-center gap-2'>
                <div className='h-1 flex-1 rounded-full bg-muted overflow-hidden'>
                    <div className='h-full bg-primary rounded-full'
                        style={{ width: `${Math.round(output.confidence * 100)}%` }} />
                </div>
                <span className='text-[10px] text-muted-foreground tabular-nums'>
                    {Math.round(output.confidence * 100)}%
                </span>
            </div>

            <div className='flex gap-2'>
                <Button size='sm' className='flex-1 h-7 text-xs' onClick={handleAccept} disabled={isLoading}>
                    {isLoading ? <Loader2 className='size-3 mr-1 animate-spin' /> : <Check className='size-3 mr-1' />}
                    {t('scheduleCard.schedule')}
                </Button>
                <Button size='sm' variant='outline' className='flex-1 h-7 text-xs'
                    onClick={() => onReject(messageUuid)} disabled={isLoading}>
                    <X className='size-3 mr-1' />
                    {t('scheduleCard.changeTime')}
                </Button>
            </div>
        </div>
    )
}
