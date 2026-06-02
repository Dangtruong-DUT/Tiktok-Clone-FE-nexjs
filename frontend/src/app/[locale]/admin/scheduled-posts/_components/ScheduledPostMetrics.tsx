'use client'

import { useState } from 'react'
import { useGetScheduledPostMetricsQuery } from '@/store/services/admin/admin-scheduled-posts.service'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts'
import { Clock, CheckCircle2, XCircle, Ban, TrendingUp, Users, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'


const PERIODS = [
    { value: 'today', label: 'Hôm nay' },
    { value: 'week',  label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
] as const


interface StatCardProps {
    label: string
    value: string | number
    sub?:  string
    icon:  React.ElementType
    color?: string
}


function StatCard({ label, value, sub, icon: Icon, color = 'text-foreground' }: StatCardProps) {
    return (
        <Card className='p-4 space-y-2'>
            <div className='flex items-center justify-between'>
                <span className='text-xs text-muted-foreground font-medium uppercase tracking-wide'>{label}</span>
                <Icon size={16} className='text-muted-foreground' />
            </div>
            <p className={cn('text-2xl font-bold', color)}>{value}</p>
            {sub && <p className='text-xs text-muted-foreground'>{sub}</p>}
        </Card>
    )
}


export function ScheduledPostMetrics() {
    const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')
    const { data, isLoading } = useGetScheduledPostMetricsQuery({ period })
    const m = data?.data

    return (
        <div className='space-y-6'>
            {/* Period selector */}
            <div className='flex gap-2'>
                {PERIODS.map((p) => (
                    <button
                        key={p.value}
                        onClick={() => setPeriod(p.value)}
                        className={cn(
                            'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                            period === p.value
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:text-foreground'
                        )}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Stat cards */}
            {isLoading ? (
                <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                    {Array.from({ length: 7 }).map((_, i) => (
                        <Skeleton key={i} className='h-24 rounded-xl' />
                    ))}
                </div>
            ) : m ? (
                <>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                        <StatCard label='Total Scheduled'  value={m.total}     icon={Clock}        />
                        <StatCard label='Pending'          value={m.pending}   icon={Timer}        color='text-yellow-500' />
                        <StatCard label='Published'        value={m.published} icon={CheckCircle2} color='text-green-500'  />
                        <StatCard label='Failed'           value={m.failed}    icon={XCircle}      color='text-destructive' />
                        <StatCard label='Cancelled'        value={m.cancelled} icon={Ban}          color='text-muted-foreground' />
                        <StatCard
                            label='Success Rate'
                            value={m.success_rate !== null ? `${m.success_rate}%` : '—'}
                            icon={TrendingUp}
                            color={m.success_rate !== null && m.success_rate >= 90 ? 'text-green-500' : 'text-yellow-500'}
                        />
                        <StatCard
                            label='Avg Publish Delay'
                            value={m.avg_delay_minutes !== null ? `${m.avg_delay_minutes}m` : '—'}
                            sub='Từ scheduled_at → published_at'
                            icon={Timer}
                        />
                        <StatCard
                            label='By Source'
                            value={`${m.by_source.manual} / ${m.by_source.calendar}`}
                            sub='Manual / Calendar'
                            icon={Users}
                        />
                    </div>

                    {/* Daily chart */}
                    {m.daily_series.length > 0 && (
                        <Card className='p-4'>
                            <p className='text-sm font-semibold mb-4'>Xu hướng theo ngày</p>
                            <ResponsiveContainer width='100%' height={220}>
                                <BarChart data={m.daily_series} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray='3 3' className='stroke-border' />
                                    <XAxis dataKey='date' tick={{ fontSize: 11 }} tickFormatter={d => d.slice(5)} />
                                    <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                                    <Tooltip />
                                    <Legend wrapperStyle={{ fontSize: 12 }} />
                                    <Bar dataKey='published' name='Published' fill='#22c55e' radius={[3,3,0,0]} />
                                    <Bar dataKey='failed'    name='Failed'    fill='#ef4444' radius={[3,3,0,0]} />
                                    <Bar dataKey='cancelled' name='Cancelled' fill='#6b7280' radius={[3,3,0,0]} />
                                    <Bar dataKey='pending'   name='Pending'   fill='#eab308' radius={[3,3,0,0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </Card>
                    )}

                    {/* Top schedulers */}
                    {m.top_schedulers.length > 0 && (
                        <Card className='p-4'>
                            <p className='text-sm font-semibold mb-3'>Top Schedulers</p>
                            <div className='space-y-2'>
                                {m.top_schedulers.map((u, i) => (
                                    <div key={u.uuid} className='flex items-center justify-between py-1.5 border-b border-border last:border-0'>
                                        <div className='flex items-center gap-3'>
                                            <span className='text-xs text-muted-foreground w-4 text-right'>{i + 1}</span>
                                            <div>
                                                <p className='text-sm font-medium'>{u.name}</p>
                                                <p className='text-xs text-muted-foreground'>@{u.username}</p>
                                            </div>
                                        </div>
                                        <div className='text-right'>
                                            <p className='text-sm font-medium'>{u.total} scheduled</p>
                                            <p className='text-xs text-green-500'>{u.published} published</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                    )}
                </>
            ) : null}
        </div>
    )
}
