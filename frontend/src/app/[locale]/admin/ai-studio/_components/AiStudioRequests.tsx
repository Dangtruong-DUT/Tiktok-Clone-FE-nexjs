'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useListAiRequestsQuery } from '@/store/services/admin/admin-ai-studio.service'
import { TablePagination } from '@/components/data-display/table-pagination'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { AI_STUDIO_REQUEST_TABLE_COLUMNS, AI_USAGE_LOG_STATUSES } from '@/constants/admin/ai'
import type { AiUsageLogItemDto } from '@/types/dtos/admin/ai/admin-ai-studio.response.dto'
import type { OffsetPaginationMeta } from '@/types/common/pagination-meta.type'

function LogRow({ item }: { item: AiUsageLogItemDto }) {
    return (
        <tr className='border-b border-border hover:bg-muted/30 transition-colors'>
            <td className='py-2.5 px-4 text-xs font-mono text-muted-foreground'>
                {item.user?.username ?? `#${item.user_id}`}
            </td>
            <td className='py-2.5 px-4'>
                {item.intent ? (
                    <Badge variant='secondary' className='text-[10px] capitalize'>
                        {item.intent.replace(/_/g, ' ')}
                    </Badge>
                ) : (
                    <span className='text-xs text-muted-foreground'>-</span>
                )}
            </td>
            <td className='py-2.5 px-4 text-xs tabular-nums'>{item.total_tokens.toLocaleString()}</td>
            <td className='py-2.5 px-4 text-xs tabular-nums'>{item.cost_usd != null ? `$${item.cost_usd.toFixed(5)}` : '-'}</td>
            <td className='py-2.5 px-4 text-xs tabular-nums'>{item.latency_ms != null ? `${item.latency_ms}ms` : '-'}</td>
            <td className='py-2.5 px-4'>
                <Badge
                    variant={item.status === AI_USAGE_LOG_STATUSES.SUCCESS ? 'default' : 'destructive'}
                    className='text-[10px]'
                >
                    {item.status}
                </Badge>
            </td>
            <td className='py-2.5 px-4 text-xs text-muted-foreground'>{new Date(item.created_at).toLocaleString()}</td>
        </tr>
    )
}

export function AiStudioRequests() {
    const t = useTranslations('AdminPage')
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(20)
    const { data, isLoading } = useListAiRequestsQuery({ page, per_page: perPage })

    const pagination = data?.data
    const items = pagination?.data ?? []
    const meta: OffsetPaginationMeta | undefined = pagination
        ? {
              type: 'offset',
              current_page: pagination.current_page,
              last_page: pagination.last_page,
              per_page: pagination.per_page,
              total: pagination.total
          }
        : undefined

    return (
        <div className='space-y-4'>
            <Card className='overflow-hidden'>
                <table className='w-full'>
                    <thead>
                        <tr className='border-b border-border bg-muted/40'>
                            {AI_STUDIO_REQUEST_TABLE_COLUMNS.map((column) => (
                                <th key={column} className='py-2.5 px-4 text-left text-xs font-medium text-muted-foreground'>
                                    {column}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading &&
                            Array.from({ length: 8 }).map((_, index) => (
                                <tr key={index}>
                                    <td colSpan={AI_STUDIO_REQUEST_TABLE_COLUMNS.length} className='py-2 px-4'>
                                        <Skeleton className='h-5 w-full rounded' />
                                    </td>
                                </tr>
                            ))}
                        {!isLoading && items.map((item) => <LogRow key={item.id} item={item} />)}
                        {!isLoading && items.length === 0 && (
                            <tr>
                                <td
                                    colSpan={AI_STUDIO_REQUEST_TABLE_COLUMNS.length}
                                    className='py-8 text-center text-sm text-muted-foreground'
                                >
                                    {t('aiStudio.requests.noRequests')}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
