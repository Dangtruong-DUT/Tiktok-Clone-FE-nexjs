'use client'

import { useMemo, useState } from 'react'
import { useTranslations } from 'next-intl'
import { useCreateAppealMutation, useGetMyAppealsQuery } from '@/store/services/appeal.service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import AutoPagination from '@/components/auto-pagination'
import { toast } from 'sonner'
import { formatAdminDate, truncateText } from '@/helpers/admin-helpers'
import { AlertCircle } from 'lucide-react'
import {
    APPEAL_RESOURCE_TYPES,
    APPEAL_STATUSES,
    APPEAL_STATUS_VALUES,
    APPEAL_TYPES,
    APPEAL_TYPE_VALUES,
    type AppealStatus,
    type AppealType
} from '@/constants/appeal.const'

const FILTER_ALL = 'all' as const
type StudioResourceType =
    | typeof APPEAL_RESOURCE_TYPES.USER
    | typeof APPEAL_RESOURCE_TYPES.POST
    | typeof APPEAL_RESOURCE_TYPES.COMMENT

const STUDIO_RESOURCE_TYPES: StudioResourceType[] = [
    APPEAL_RESOURCE_TYPES.USER,
    APPEAL_RESOURCE_TYPES.POST,
    APPEAL_RESOURCE_TYPES.COMMENT
]

export default function StudioAppealsPage() {
    const t = useTranslations('SnapiStudio.appeals')

    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<typeof FILTER_ALL | AppealStatus>(FILTER_ALL)

    const [formData, setFormData] = useState({
        appeal_type: APPEAL_TYPES.POST_DELETED as AppealType,
        resource_type: APPEAL_RESOURCE_TYPES.POST as StudioResourceType,
        resource_id: '',
        reason: ''
    })

    const { data, isLoading, refetch } = useGetMyAppealsQuery({
        page,
        per_page: perPage,
        appeal_status: statusFilter === FILTER_ALL ? undefined : statusFilter,
        order_by: ['-created_at']
    })

    const [createAppeal, createState] = useCreateAppealMutation()

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

    const handleSubmitAppeal = async () => {
        const resourceId = formData.resource_id.trim() === '' ? null : Number(formData.resource_id)

        if (formData.reason.trim().length < 20) {
            toast.error(t('errors.reasonMinLength'))
            return
        }

        if (resourceId !== null && Number.isNaN(resourceId)) {
            toast.error(t('errors.resourceIdInvalid'))
            return
        }

        try {
            await createAppeal({
                appeal_type: formData.appeal_type,
                resource_type: formData.resource_type,
                resource_id: resourceId,
                reason: formData.reason.trim()
            }).unwrap()

            toast.success(t('messages.createSuccess'))
            setFormData((prev) => ({ ...prev, reason: '', resource_id: '' }))
            refetch()
        } catch (error) {
            const errorMessage = (error as { data?: { message?: string } })?.data?.message
            toast.error(errorMessage || t('messages.createError'))
        }
    }

    const getStatusVariant = (status: string) => {
        if (status === APPEAL_STATUSES.APPROVED) return 'bg-green-100 text-green-800'
        if (status === APPEAL_STATUSES.REJECTED) return 'bg-red-100 text-red-800'
        return 'bg-yellow-100 text-yellow-800'
    }

    return (
        <div className='max-w-6xl mx-auto p-4 md:p-6 space-y-6'>
            <Card>
                <CardHeader>
                    <CardTitle>{t('create.title')}</CardTitle>
                    <CardDescription>{t('create.description')}</CardDescription>
                </CardHeader>
                <CardContent className='space-y-4'>
                    <div className='grid grid-cols-1 md:grid-cols-3 gap-3'>
                        <div className='space-y-2'>
                            <Label>{t('create.appealType')}</Label>
                            <Select
                                value={formData.appeal_type}
                                onValueChange={(value: AppealType) =>
                                    setFormData((prev) => ({ ...prev, appeal_type: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {APPEAL_TYPE_VALUES.map((appealType) => (
                                        <SelectItem key={appealType} value={appealType}>
                                            {t(`types.${appealType}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label>{t('create.resourceType')}</Label>
                            <Select
                                value={formData.resource_type}
                                onValueChange={(value: StudioResourceType) =>
                                    setFormData((prev) => ({ ...prev, resource_type: value }))
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {STUDIO_RESOURCE_TYPES.map((resourceType) => (
                                        <SelectItem key={resourceType} value={resourceType}>
                                            {t(`resourceTypes.${resourceType}`)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className='space-y-2'>
                            <Label>{t('create.resourceId')}</Label>
                            <Input
                                value={formData.resource_id}
                                onChange={(event) =>
                                    setFormData((prev) => ({ ...prev, resource_id: event.target.value }))
                                }
                                placeholder={t('create.resourceIdPlaceholder')}
                            />
                        </div>
                    </div>

                    <div className='space-y-2'>
                        <Label>{t('create.reason')}</Label>
                        <Textarea
                            value={formData.reason}
                            onChange={(event) => setFormData((prev) => ({ ...prev, reason: event.target.value }))}
                            placeholder={t('create.reasonPlaceholder')}
                            className='min-h-[120px]'
                        />
                    </div>

                    <Button onClick={handleSubmitAppeal} disabled={createState.isLoading}>
                        {createState.isLoading ? t('create.submitting') : t('create.submit')}
                    </Button>
                </CardContent>
            </Card>

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
                                                {truncateText(appeal.reason, 100)}
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
