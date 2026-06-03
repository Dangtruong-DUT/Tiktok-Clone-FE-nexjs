'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useListAiRequestsQuery } from '@/store/services/admin/admin-ai-studio.service'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { AiContentSuggestionType, AiSuggestionStatus } from '@/types/models/ai-content-suggestion.model'

const STATUS_COLORS: Record<AiSuggestionStatus, string> = {
    pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    processing: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    failed: 'bg-red-100 text-red-800 border-red-200'
}

function RequestRow({ item }: { item: AiContentSuggestionType }) {
    const t = useTranslations('AdminPage')
    const [expanded, setExpanded] = useState(false)
    const totalTokens = (item as unknown as Record<string, unknown>).token_usage
        ? (((item as unknown as Record<string, unknown>).token_usage as Record<string, number>).total_tokens ?? 0)
        : null

    return (
        <>
            <tr
                className='border-b border-border hover:bg-muted/40 cursor-pointer text-sm'
                onClick={() => setExpanded((v) => !v)}
            >
                <td className='px-4 py-3 font-mono text-xs text-muted-foreground truncate max-w-[120px]'>
                    {item.uuid.slice(0, 8)}...
                </td>
                <td className='px-4 py-3'>
                    <Badge className={`text-xs border ${STATUS_COLORS[item.status]} font-medium`}>{item.status}</Badge>
                </td>
                <td className='px-4 py-3 capitalize text-xs'>{item.content_intent ?? '—'}</td>
                <td className='px-4 py-3 text-xs text-muted-foreground'>{item.model ?? '—'}</td>
                <td className='px-4 py-3 text-xs text-muted-foreground text-right'>
                    {totalTokens != null ? totalTokens.toLocaleString() : '—'}
                </td>
                <td className='px-4 py-3 text-xs text-muted-foreground'>
                    {item.applied_at ? t('aiStudio.requests.appliedMark') : '—'}
                </td>
                <td className='px-4 py-3 text-xs text-muted-foreground whitespace-nowrap'>
                    {new Date(item.created_at).toLocaleString()}
                </td>
            </tr>
            {expanded && (
                <tr className='bg-muted/20 border-b border-border'>
                    <td colSpan={7} className='px-4 py-3'>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-3 text-xs'>
                            {item.short_caption && (
                                <div>
                                    <p className='font-medium text-muted-foreground mb-1'>
                                        {t('aiStudio.requests.detail.shortCaption')}
                                    </p>
                                    <p className='text-foreground'>{item.short_caption}</p>
                                </div>
                            )}
                            {item.hashtags?.length > 0 && (
                                <div>
                                    <p className='font-medium text-muted-foreground mb-1'>
                                        {t('aiStudio.requests.detail.hashtags')}
                                    </p>
                                    <p className='text-foreground'>{item.hashtags.join(' ')}</p>
                                </div>
                            )}
                            {item.error_message && (
                                <div className='col-span-2'>
                                    <p className='font-medium text-red-500 mb-1'>
                                        {t('aiStudio.requests.detail.error')}
                                    </p>
                                    <p className='text-red-600 bg-red-50 rounded p-2'>{item.error_message}</p>
                                </div>
                            )}
                            {item.safety_notes && (
                                <div className='col-span-2'>
                                    <p className='font-medium text-yellow-600 mb-1'>
                                        {t('aiStudio.requests.detail.safetyNotes')}
                                    </p>
                                    <p className='text-yellow-700'>{item.safety_notes}</p>
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    )
}

export function AiStudioRequests() {
    const t = useTranslations('AdminPage')
    const [status, setStatus] = useState<string>('all')
    const [page, setPage] = useState(1)

    const { data, isLoading } = useListAiRequestsQuery({
        status: status === 'all' ? undefined : status,
        page,
        per_page: 20
    })

    const items = data?.data ?? []
    const meta = data?.meta

    return (
        <div className='space-y-4'>
            {/* Filters */}
            <div className='flex items-center gap-3'>
                <Select
                    value={status}
                    onValueChange={(v) => {
                        setStatus(v)
                        setPage(1)
                    }}
                >
                    <SelectTrigger className='w-36 h-8 text-sm'>
                        <SelectValue placeholder={t('aiStudio.requests.filters.allStatuses')} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value='all'>{t('aiStudio.requests.filters.allStatuses')}</SelectItem>
                        <SelectItem value='pending'>{t('aiStudio.requests.filters.pending')}</SelectItem>
                        <SelectItem value='processing'>{t('aiStudio.requests.filters.processing')}</SelectItem>
                        <SelectItem value='completed'>{t('aiStudio.requests.filters.completed')}</SelectItem>
                        <SelectItem value='failed'>{t('aiStudio.requests.filters.failed')}</SelectItem>
                    </SelectContent>
                </Select>
                {meta && meta.type === 'offset' && meta.total != null && (
                    <span className='text-xs text-muted-foreground ml-auto'>
                        {t('aiStudio.requests.total', { count: meta.total.toLocaleString() })}
                    </span>
                )}
            </div>

            {/* Table */}
            <Card className='overflow-hidden'>
                {isLoading ? (
                    <div className='p-4 space-y-3'>
                        {Array.from({ length: 8 }).map((_, i) => (
                            <Skeleton key={i} className='h-10' />
                        ))}
                    </div>
                ) : (
                    <div className='overflow-x-auto'>
                        <table className='w-full text-sm'>
                            <thead>
                                <tr className='border-b border-border bg-muted/50'>
                                    <th className='px-4 py-2.5 text-left text-xs font-medium text-muted-foreground'>
                                        {t('aiStudio.requests.columns.uuid')}
                                    </th>
                                    <th className='px-4 py-2.5 text-left text-xs font-medium text-muted-foreground'>
                                        {t('aiStudio.requests.columns.status')}
                                    </th>
                                    <th className='px-4 py-2.5 text-left text-xs font-medium text-muted-foreground'>
                                        {t('aiStudio.requests.columns.intent')}
                                    </th>
                                    <th className='px-4 py-2.5 text-left text-xs font-medium text-muted-foreground'>
                                        {t('aiStudio.requests.columns.model')}
                                    </th>
                                    <th className='px-4 py-2.5 text-right text-xs font-medium text-muted-foreground'>
                                        {t('aiStudio.requests.columns.tokens')}
                                    </th>
                                    <th className='px-4 py-2.5 text-left text-xs font-medium text-muted-foreground'>
                                        {t('aiStudio.requests.columns.applied')}
                                    </th>
                                    <th className='px-4 py-2.5 text-left text-xs font-medium text-muted-foreground'>
                                        {t('aiStudio.requests.columns.created')}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className='py-12 text-center text-muted-foreground text-sm'>
                                            {t('aiStudio.requests.noRequests')}
                                        </td>
                                    </tr>
                                ) : (
                                    items.map((item) => <RequestRow key={item.uuid} item={item} />)
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Pagination */}
            {meta && meta.type === 'offset' && meta.last_page > 1 && (
                <div className='flex items-center justify-center gap-2'>
                    <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className='p-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed'
                    >
                        <ChevronLeft size={14} />
                    </button>
                    <span className='text-sm text-muted-foreground'>
                        {t('aiStudio.requests.pagination.page', {
                            current: meta.current_page,
                            total: meta.last_page
                        })}
                    </span>
                    <button
                        onClick={() => setPage((p) => Math.min(meta.last_page, p + 1))}
                        disabled={page === meta.last_page}
                        className='p-1.5 rounded-md border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed'
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    )
}
