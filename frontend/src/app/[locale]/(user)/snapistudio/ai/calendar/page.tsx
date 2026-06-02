'use client'

import { useState, useEffect } from 'react'
import { CalendarDays, Plus, Clock, FileText, RefreshCw, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import {
    useGenerateCalendarMutation,
    useListCalendarsQuery,
    useGetCalendarQuery,
    useCreateDraftMutation,
    useScheduleItemMutation,
} from '@/store/services/ai-content-calendar.service'
import type { AiContentCalendarItemType, CalendarItemStatus } from '@/types/models/ai-content-calendar.model'


const DAY_NAMES = ['', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN']

const ITEM_STATUS_STYLE: Record<CalendarItemStatus, string> = {
    idea:      'bg-muted text-muted-foreground',
    draft:     'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
    scheduled: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
    published: 'bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400',
}


export default function ContentCalendarPage() {
    const [niche,         setNiche]         = useState('')
    const [style,         setStyle]         = useState('')
    const [goals,         setGoals]         = useState('')
    const [audience,      setAudience]      = useState('')
    const [selectedUuid,  setSelectedUuid]  = useState<string | null>(null)
    const [showForm,      setShowForm]      = useState(false)

    const [generateCalendar, { isLoading: isGenerating }]      = useGenerateCalendarMutation()
    const [createDraft,      { isLoading: isDrafting }]         = useCreateDraftMutation()
    const [scheduleItem,     { isLoading: isScheduling }]       = useScheduleItemMutation()
    const [schedulingItemUuid, setSchedulingItemUuid]           = useState<string | null>(null)
    const [scheduleDateTime,   setScheduleDateTime]             = useState('')

    const { data: listData, isLoading: isLoadingList } = useListCalendarsQuery({ per_page: 5 })

    // Separate poll-interval state avoids circular reference in hook options
    const [calendarPollInterval, setCalendarPollInterval] = useState(0)

    const { data: calendarData } = useGetCalendarQuery(selectedUuid ?? '', {
        skip:            !selectedUuid,
        pollingInterval: calendarPollInterval,
    })

    const calendarStatus = calendarData?.data?.status
    const calendars      = listData?.data ?? []
    const calendar       = calendarData?.data ?? null

    // Start/stop polling based on terminal status
    useEffect(() => {
        const isPending = calendarStatus === 'pending' || calendarStatus === 'processing'
        setCalendarPollInterval(selectedUuid && isPending ? 2_000 : 0)
    }, [calendarStatus, selectedUuid])

    // Toast when async generation finishes
    useEffect(() => {
        if (calendarStatus === 'completed') {
            toast.success('Lịch nội dung đã được tạo!')
        } else if (calendarStatus === 'failed') {
            toast.error('Tạo lịch thất bại. Vui lòng thử lại.')
        }
    }, [calendarStatus])

    const handleGenerate = async () => {
        if (!niche.trim()) return

        const res = await generateCalendar({
            niche:           niche.trim(),
            content_style:   style.trim() || undefined,
            primary_goals:   goals.split(',').map(g => g.trim()).filter(Boolean),
            target_audience: audience.trim() || undefined,
            creator_language: 'vi',
        }).unwrap()

        setSelectedUuid(res.data.uuid)
        setShowForm(false)
        toast.success('Đang tạo lịch nội dung...')
    }

    const handleCreateDraft = async (itemUuid: string) => {
        await createDraft(itemUuid).unwrap()
        toast.success('Bản nháp đã được tạo!')
    }

    const handleScheduleItem = async (itemUuid: string) => {
        if (!scheduleDateTime) return
        await scheduleItem({
            itemUuid,
            scheduled_at: new Date(scheduleDateTime).toISOString(),
            timezone:     Intl.DateTimeFormat().resolvedOptions().timeZone,
        }).unwrap()
        toast.success('Đã lên lịch đăng!')
        setSchedulingItemUuid(null)
        setScheduleDateTime('')
    }

    return (
        <div className='max-w-3xl mx-auto p-4 space-y-6'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>
                    <div className='flex size-8 items-center justify-center rounded-lg bg-primary/10'>
                        <CalendarDays size={16} className='text-primary' />
                    </div>
                    <div>
                        <h1 className='text-lg font-semibold'>AI Content Calendar</h1>
                        <p className='text-xs text-muted-foreground'>Lịch nội dung 7 ngày được tạo bởi AI</p>
                    </div>
                </div>
                <Button size='sm' onClick={() => setShowForm(v => !v)} className='gap-1.5'>
                    <Plus size={14} />
                    Tạo lịch mới
                </Button>
            </div>

            {/* Generation form */}
            {showForm && (
                <div className='rounded-xl border border-border bg-card p-4 space-y-3'>
                    <div className='grid grid-cols-2 gap-3'>
                        <div className='col-span-2 space-y-1'>
                            <label className='text-xs font-medium text-muted-foreground'>Lĩnh vực / Chủ đề *</label>
                            <input
                                value={niche}
                                onChange={e => setNiche(e.target.value)}
                                placeholder='Ví dụ: Ẩm thực, Fitness, Du lịch...'
                                className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50'
                            />
                        </div>
                        <div className='space-y-1'>
                            <label className='text-xs font-medium text-muted-foreground'>Phong cách</label>
                            <input
                                value={style}
                                onChange={e => setStyle(e.target.value)}
                                placeholder='Comedy, Educational...'
                                className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50'
                            />
                        </div>
                        <div className='space-y-1'>
                            <label className='text-xs font-medium text-muted-foreground'>Mục tiêu (phân cách bằng dấu phẩy)</label>
                            <input
                                value={goals}
                                onChange={e => setGoals(e.target.value)}
                                placeholder='Tăng follower, Tăng reach...'
                                className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50'
                            />
                        </div>
                        <div className='col-span-2 space-y-1'>
                            <label className='text-xs font-medium text-muted-foreground'>Đối tượng mục tiêu</label>
                            <input
                                value={audience}
                                onChange={e => setAudience(e.target.value)}
                                placeholder='Gen Z, Bà nội trợ, Sinh viên...'
                                className='w-full rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-primary/50'
                            />
                        </div>
                    </div>
                    <Button onClick={handleGenerate} disabled={!niche.trim() || isGenerating} className='w-full gap-2'>
                        {isGenerating
                            ? <><RefreshCw size={14} className='animate-spin' /> Đang tạo...</>
                            : <><CalendarDays size={14} /> Tạo lịch 7 ngày</>
                        }
                    </Button>
                </div>
            )}

            {/* Calendar list */}
            {isLoadingList ? (
                <div className='space-y-2'>
                    {[1,2].map(i => <Skeleton key={i} className='h-16 w-full rounded-xl' />)}
                </div>
            ) : calendars.length > 0 ? (
                <div className='space-y-2'>
                    {calendars.map(cal => (
                        <button
                            key={cal.uuid}
                            type='button'
                            onClick={() => setSelectedUuid(cal.uuid)}
                            className={cn(
                                'w-full rounded-xl border px-4 py-3 text-left transition-all',
                                selectedUuid === cal.uuid
                                    ? 'border-primary bg-primary/5'
                                    : 'border-border bg-card hover:border-primary/50'
                            )}
                        >
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm font-medium'>{cal.niche ?? 'Lịch nội dung'}</p>
                                    <p className='text-xs text-muted-foreground'>{cal.created_at.slice(0,10)}</p>
                                </div>
                                <Badge variant='secondary' className='text-xs'>
                                    {cal.status === 'completed' ? `${cal.items_count} ý tưởng` : cal.status}
                                </Badge>
                            </div>
                        </button>
                    ))}
                </div>
            ) : null}

            {/* Selected calendar detail */}
            {calendar && calendar.status === 'completed' && (
                <div className='space-y-3'>
                    {calendar.strategy_notes && (
                        <div className='rounded-xl border border-blue-200 bg-blue-50 dark:bg-blue-950/30 p-3 text-xs text-blue-800 dark:text-blue-300'>
                            💡 {calendar.strategy_notes}
                        </div>
                    )}

                    <div className='space-y-3'>
                        {calendar.items.map((item: AiContentCalendarItemType) => (
                            <div key={item.uuid} className='rounded-xl border border-border bg-card p-4 space-y-2'>
                                <div className='flex items-center justify-between'>
                                    <span className='text-xs font-semibold text-muted-foreground'>
                                        {DAY_NAMES[item.day_of_week] ?? `Ngày ${item.day_of_week}`}
                                    </span>
                                    <span className={cn(
                                        'text-xs px-2 py-0.5 rounded-full font-medium',
                                        ITEM_STATUS_STYLE[item.status]
                                    )}>
                                        {item.status_label}
                                    </span>
                                </div>

                                <p className='text-sm font-medium'>{item.content_idea}</p>

                                {item.hook_idea && (
                                    <p className='text-xs text-muted-foreground italic'>Hook: {item.hook_idea}</p>
                                )}

                                {item.suggested_format && (
                                    <Badge variant='secondary' className='text-xs'>{item.suggested_format}</Badge>
                                )}

                                {item.caption_draft && (
                                    <p className='text-xs bg-muted/50 rounded-lg p-2 line-clamp-2'>{item.caption_draft}</p>
                                )}

                                <div className='flex gap-2 pt-1'>
                                    {item.status === 'idea' && (
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            className='gap-1.5 text-xs h-7'
                                            onClick={() => handleCreateDraft(item.uuid)}
                                            disabled={isDrafting}
                                        >
                                            <FileText size={12} />
                                            Tạo bản nháp
                                        </Button>
                                    )}
                                    {item.status === 'draft' && schedulingItemUuid !== item.uuid && (
                                        <Button
                                            size='sm'
                                            variant='outline'
                                            className='gap-1.5 text-xs h-7'
                                            onClick={() => {
                                                setSchedulingItemUuid(item.uuid)
                                                setScheduleDateTime(new Date(Date.now() + 60_000 * 60).toISOString().slice(0, 16))
                                            }}
                                        >
                                            <Clock size={12} />
                                            Lên lịch
                                        </Button>
                                    )}
                                    {item.status === 'draft' && schedulingItemUuid === item.uuid && (
                                        <div className='flex items-center gap-1.5 flex-wrap'>
                                            <input
                                                type='datetime-local'
                                                value={scheduleDateTime}
                                                min={new Date(Date.now() + 60_000).toISOString().slice(0, 16)}
                                                onChange={e => setScheduleDateTime(e.target.value)}
                                                className='rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-primary/50'
                                            />
                                            <Button
                                                size='sm'
                                                className='h-7 text-xs gap-1'
                                                onClick={() => handleScheduleItem(item.uuid)}
                                                disabled={isScheduling || !scheduleDateTime}
                                            >
                                                {isScheduling ? <RefreshCw size={11} className='animate-spin' /> : <CheckCircle2 size={11} />}
                                                Xác nhận
                                            </Button>
                                            <Button size='sm' variant='ghost' className='h-7 text-xs' onClick={() => setSchedulingItemUuid(null)}>Hủy</Button>
                                        </div>
                                    )}
                                    {item.status === 'scheduled' && (
                                        <p className='text-xs text-muted-foreground flex items-center gap-1'>
                                            <Clock size={12} className='text-yellow-500' />
                                            Đã lên lịch: {item.scheduled_post?.scheduled_at?.slice(0,16).replace('T',' ')}
                                        </p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {calendar && calendar.status === 'pending' && (
                <div className='flex items-center gap-3 rounded-xl border border-border bg-card p-4'>
                    <RefreshCw size={16} className='animate-spin text-primary' />
                    <p className='text-sm'>Đang tạo lịch nội dung... Vui lòng đợi.</p>
                </div>
            )}
        </div>
    )
}
