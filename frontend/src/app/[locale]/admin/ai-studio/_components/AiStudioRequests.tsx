'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useListAiRequestsQuery } from '@/store/services/admin/admin-ai-studio.service'
import { TablePagination } from '@/components/data-display/table-pagination'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AI_USAGE_LOG_STATUSES } from '@/constants/admin/ai'
import type { AiUsageLogItemDto } from '@/types/dtos/admin/ai/admin-ai-studio.response.dto'
import type { OffsetPaginationMeta } from '@/types/common/pagination-meta.type'

function LogRow({ item }: { item: AiUsageLogItemDto }) {
    return (
        <TableRow>
            <TableCell className='text-xs font-mono text-muted-foreground'>
                {item.user?.username ?? `#${item.user_id}`}
            </TableCell>
            <TableCell>
                {item.intent ? (
                    <Badge variant='secondary' className='text-[10px] capitalize'>
                        {item.intent.replace(/_/g, ' ')}
                    </Badge>
                ) : (
                    <span className='text-xs text-muted-foreground'>-</span>
                )}
            </TableCell>
            <TableCell className='text-xs tabular-nums'>{item.total_tokens.toLocaleString()}</TableCell>
            <TableCell className='text-xs tabular-nums'>
                {item.cost_usd != null ? `$${item.cost_usd.toFixed(5)}` : '-'}
            </TableCell>
            <TableCell className='text-xs tabular-nums'>
                {item.latency_ms != null ? `${item.latency_ms}ms` : '-'}
            </TableCell>
            <TableCell>
                <Badge
                    variant={item.status === AI_USAGE_LOG_STATUSES.SUCCESS ? 'default' : 'destructive'}
                    className='text-[10px]'
                >
                    {item.status}
                </Badge>
            </TableCell>
            <TableCell className='text-xs text-muted-foreground'>
                {new Date(item.created_at).toLocaleString()}
            </TableCell>
        </TableRow>
    )
}

export function AiStudioRequests() {
    const t = useTranslations('AdminPage')
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(20)
    const { data, isLoading } = useListAiRequestsQuery({ page, per_page: perPage })

    const items = data?.data ?? []
    const meta: OffsetPaginationMeta | undefined =
        data?.meta?.type === 'offset' ? (data.meta as OffsetPaginationMeta) : undefined

    const columns = [
        t('aiStudio.requests.columns.user'),
        t('aiStudio.requests.columns.intent'),
        t('aiStudio.requests.columns.tokens'),
        t('aiStudio.requests.columns.cost'),
        t('aiStudio.requests.columns.latency'),
        t('aiStudio.requests.columns.status'),
        t('aiStudio.requests.columns.time')
    ]

    return (
        <div className='space-y-4'>
            <Card className='overflow-hidden'>
                <Table>
                    <TableHeader>
                        <TableRow className='bg-muted/40'>
                            {columns.map((col) => (
                                <TableHead key={col} className='text-xs font-medium'>
                                    {col}
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading &&
                            Array.from({ length: 8 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell colSpan={columns.length} className='py-2'>
                                        <Skeleton className='h-5 w-full rounded' />
                                    </TableCell>
                                </TableRow>
                            ))}
                        {!isLoading && items.map((item) => <LogRow key={item.id} item={item} />)}
                        {!isLoading && items.length === 0 && (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className='py-8 text-center text-sm text-muted-foreground'
                                >
                                    {t('aiStudio.requests.noRequests')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>

            {meta && meta.last_page > 1 && (
                <TablePagination
                    pagination={meta}
                    page={page}
                    perPage={perPage}
                    onPageChange={setPage}
                    onPerPageChange={(value) => {
                        setPerPage(value)
                        setPage(1)
                    }}
                />
            )}
        </div>
    )
}
