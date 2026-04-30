'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetMyAppealsQuery } from '@/store/services/appeal.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import AutoPagination from '@/components/auto-pagination'
import { formatAdminDate, truncateText } from '@/helpers/admin-helpers'
import { AlertCircle } from 'lucide-react'
import {
    APPEAL_STATUSES,
    APPEAL_STATUS_VALUES,
    type AppealStatus
} from '@/constants/appeal.const'

const FILTER_ALL = 'all' as const

export default function StudioAppealsPage() {
    const t = useTranslations('SnapiStudio.appeals')

    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<typeof FILTER_ALL | AppealStatus>(FILTER_ALL)

    const { data, isLoading } = useGetMyAppealsQuery({
        page,
        per_page: perPage,
        appeal_status: statusFilter === FILTER_ALL ? undefined : statusFilter,
        order_by: ['-created_at']
    })

    const appeals = useMemo(() => {
        const list = data?.data ?? []
        const keyword = searchTerm.trim().toLowerCase()

        if (!keyword) return list

        return list.filter((appeal) => {
            return [
                appeal.appeal_type,
                appeal.resource_type,
                appeal.reason,
                appeal.status,
                String(appeal.resource_id ?? '')
            ]
                .join(' ')
                .toLowerCase()
                .includes(keyword)
        })
    }, [data?.data, searchTerm])

    const pagination = data?.meta
    const totalItems = pagination?.total ?? appeals.length

    const getStatusVariant = (status: string) => {
        if (status === APPEAL_STATUSES.APPROVED) return 'bg-green-100 text-green-800'
        if (status === APPEAL_STATUSES.REJECTED) return 'bg-red-100 text-red-800'
        return 'bg-yellow-100 text-yellow-800'
    }

    return (
        <div className='max-w-6xl mx-auto p-4 md:p-6 space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle>{t('list.title')}</CardTitle>
                    <CardDescription>{t('list.description')}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
                        <Input
                            value={searchTerm}
                            onChange={(event) => {
                                setSearchTerm(event.target.value)
                                setPage(1)
                            }}
                            placeholder={t('list.searchPlaceholder')}
                        />

                        <div className='flex gap-2'>
                            <Select
                                value={statusFilter}
                                onValueChange={(value: typeof FILTER_ALL | AppealStatus) => {
                                    setStatusFilter(value)
                                    setPage(1)
                                }}
                            >
                                <SelectTrigger className='w-48'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={FILTER_ALL}>{t('list.filters.allStatuses')}</SelectItem>
                                    {APPEAL_STATUS_VALUES.map((status) => (
                                        <SelectItem key={status} value={status}>
                                            {t(`statuses.${status}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className='space-y-3'>
                            {Array.from({ length: 5 }).map((_, index) => (
                                <Skeleton key={index} className='h-14' />
                            ))}
                        </div>
                    ) : appeals.length === 0 ? (
                        <div className='border rounded-lg p-8 text-center'>
                            <AlertCircle className='w-12 h-12 text-muted-foreground mx-auto mb-3' />
                            <p className='text-muted-foreground'>{t('list.emptyState')}</p>
                        </div>
                    ) : (
                        <div className='border rounded-lg overflow-hidden'>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('list.columns.id')}</TableHead>
                                        <TableHead>{t('list.columns.type')}</TableHead>
                                        <TableHead>{t('list.columns.reason')}</TableHead>
                                        <TableHead>{t('list.columns.status')}</TableHead>
                                        <TableHead>{t('list.columns.createdAt')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {appeals.map((appeal) => (
                                        <TableRow key={appeal.id}>
                                            <TableCell className='font-mono text-sm'>#{appeal.id}</TableCell>
                                            <TableCell>{t(`types.${appeal.appeal_type}`)}</TableCell>
                                            <TableCell className='max-w-lg'>
                                                {truncateText(appeal.reason ?? '', 100)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusVariant(appeal.status)}>
                                                    {t(`statuses.${appeal.status}`)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{formatAdminDate(appeal.created_at)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {pagination && (
                        <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                            <div className='flex items-center gap-2'>
                                <span className='text-sm text-muted-foreground'>{t('list.perPage')}</span>
                                <Select
                                    value={String(perPage)}
                                    onValueChange={(value) => {
                                        setPerPage(Number(value))
                                        setPage(1)
                                    }}
                                >
                                    <SelectTrigger className='w-20'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='5'>5</SelectItem>
                                        <SelectItem value='10'>10</SelectItem>
                                        <SelectItem value='25'>25</SelectItem>
                                        <SelectItem value='50'>50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className='text-sm text-muted-foreground'>
                                {t('list.showingResults', {
                                    from: (pagination.current_page - 1) * perPage + 1,
                                    to: Math.min(pagination.current_page * perPage, totalItems),
                                    total: totalItems
                                })}
                            </div>

                            {pagination.last_page > 1 && (
                                <AutoPagination page={page} pageSize={pagination.last_page} onPageChange={setPage} />
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
