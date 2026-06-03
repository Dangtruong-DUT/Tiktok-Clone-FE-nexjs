'use client'

import { useState } from 'react'
import { useListAiRequestsQuery } from '@/store/services/admin/admin-ai-studio.service'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface UsageLogRow {
    id: number
    user_id: number
    intent: string | null
    total_tokens: number
    cost_usd: number | null
    latency_ms: number | null
    status: string
    model: string | null
    created_at: string
    user?: { uuid: string; username: string }
}

function LogRow({ item }: { item: UsageLogRow }) {
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
                    <span className='text-xs text-muted-foreground'>—</span>
                )}
            </td>
            <td className='py-2.5 px-4 text-xs tabular-nums'>
                {item.total_tokens.toLocaleString()}
            </td>
            <td className='py-2.5 px-4 text-xs tabular-nums'>
                {item.cost_usd != null ? `$${Number(item.cost_usd).toFixed(5)}` : '—'}
            </td>
            <td className='py-2.5 px-4 text-xs tabular-nums'>
                {item.latency_ms != null ? `${item.latency_ms}ms` : '—'}
            </td>
            <td className='py-2.5 px-4'>
                <Badge
                    variant={item.status === 'success' ? 'default' : 'destructive'}
                    className='text-[10px]'
                >
                    {item.status}
                </Badge>
            </td>
            <td className='py-2.5 px-4 text-xs text-muted-foreground'>
                {new Date(item.created_at).toLocaleString()}
            </td>
        </tr>
    )
}

export function AiStudioRequests() {
    const [page, setPage] = useState(1)
    const { data, isLoading } = useListAiRequestsQuery({ page, per_page: 20 })

    const items = (data?.data?.data ?? []) as UsageLogRow[]
    const meta  = data?.data as { current_page?: number; last_page?: number; total?: number } | undefined

    return (
        <div className='space-y-4'>
            <Card className='overflow-hidden'>
                <table className='w-full'>
                    <thead>
                        <tr className='border-b border-border bg-muted/40'>
                            {['User', 'Intent', 'Tokens', 'Cost', 'Latency', 'Status', 'Time'].map((h) => (
                                <th key={h} className='py-2.5 px-4 text-left text-xs font-medium text-muted-foreground'>
                                    {h}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading &&
                            Array.from({ length: 8 }).map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={7} className='py-2 px-4'>
                                        <Skeleton className='h-5 w-full rounded' />
                                    </td>
                                </tr>
                            ))}
                        {!isLoading && items.map((item) => <LogRow key={item.id} item={item} />)}
                        {!isLoading && items.length === 0 && (
                            <tr>
                                <td colSpan={7} className='py-8 text-center text-sm text-muted-foreground'>
                                    No usage logs yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </Card>

            {/* Pagination */}
            {meta && (meta.last_page ?? 1) > 1 && (
                <div className='flex items-center justify-between text-sm'>
                    <span className='text-muted-foreground text-xs'>
                        Total: {(meta.total ?? 0).toLocaleString()}
                    </span>
                    <div className='flex items-center gap-2'>
                        <button
                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className='p-1.5 rounded hover:bg-muted disabled:opacity-40'
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className='text-xs tabular-nums'>
                            {meta.current_page} / {meta.last_page}
                        </span>
                        <button
                            onClick={() => setPage((p) => Math.min(meta.last_page ?? p, p + 1))}
                            disabled={page === meta.last_page}
                            className='p-1.5 rounded hover:bg-muted disabled:opacity-40'
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
