'use client'

import { useState } from 'react'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import { useGetCopilotMetricsQuery } from '@/store/services/admin/admin-ai-copilot.service'
import { BarChart2, Loader2 } from 'lucide-react'

type Period = 'today' | 'week' | 'month'

export default function CopilotMetricsPage() {
    const [period, setPeriod] = useState<Period>('today')
    const { data, isLoading } = useGetCopilotMetricsQuery({ period })

    const metrics = (data as { data?: { by_intent?: unknown[]; daily_series?: unknown[]; total_cost?: number } })?.data

    return (
        <AdminLayout
            title='AI Copilot Usage'
            description='Token usage, costs, and intent breakdown for the AI Copilot'
            breadcrumbs={[
                { label: 'Admin', href: ADMIN_ROUTES.DASHBOARD },
                { label: 'AI Studio', href: '/admin/ai-studio' },
                { label: 'Copilot Metrics', href: '#' },
            ]}
        >
            <AdminContainer>
                <div className='flex items-center gap-2 mb-6'>
                    {(['today', 'week', 'month'] as Period[]).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPeriod(p)}
                            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors capitalize ${
                                period === p
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                {isLoading && (
                    <div className='flex items-center justify-center py-12'>
                        <Loader2 className='size-6 animate-spin text-muted-foreground' />
                    </div>
                )}

                {!isLoading && metrics && (
                    <div className='space-y-6'>
                        <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                            {(metrics.by_intent as { intent: string; total_requests: number; total_tokens: number; total_cost: number }[] ?? []).map(
                                (row) => (
                                    <div key={row.intent} className='rounded-xl border bg-card p-4 space-y-1'>
                                        <p className='text-xs text-muted-foreground capitalize'>
                                            {row.intent.replace(/_/g, ' ')}
                                        </p>
                                        <p className='text-xl font-bold tabular-nums'>{row.total_requests}</p>
                                        <p className='text-xs text-muted-foreground'>{row.total_tokens?.toLocaleString()} tokens</p>
                                    </div>
                                ),
                            )}
                        </div>

                        <div>
                            <h3 className='text-sm font-semibold mb-3'>Daily Trend</h3>
                            <div className='rounded-xl border bg-card p-4'>
                                <pre className='text-xs text-muted-foreground overflow-x-auto'>
                                    {JSON.stringify(metrics.daily_series, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>
                )}
            </AdminContainer>
        </AdminLayout>
    )
}
