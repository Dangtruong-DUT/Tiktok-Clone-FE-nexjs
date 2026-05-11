'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useGetAdminUsersQuery } from '@/store/services/admin/index'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AutoPagination from '@/components/auto-pagination'
import { Skeleton } from '@/components/ui/skeleton'
import { BanUserDialog } from './ban-user-dialog'
import { UnbanUserDialog } from './unban-user-dialog'
import { DeleteUserDialog } from './delete-user-dialog'
import { RestoreUserDialog } from './restore-user-dialog'
import { ResetUserPasswordDialog } from './reset-user-password-dialog'
import { SendUserMailDialog } from './send-user-mail-dialog'
import {
    formatAdminDate,
    getUserStatus,
    getUserStatusColor,
    formatUserStatus,
    truncateText
} from '@/helpers/admin-helpers'
import { AdminUser } from '@/types/dtos/admin/admin-response.dto'

interface UserTableProps {
    onUserDeleted?: () => void
}

/**
 * UserTable - Displays paginated list of users with filtering and actions
 * Features:
 * - Search by username/email
 * - Filter by status (all, banned, active)
 * - Pagination with per-page selector
 * - Actions: Ban, Unban, Delete
 * - Loading skeleton
 */
export function UserTable({ onUserDeleted }: UserTableProps) {
    const t = useTranslations('AdminPage')

    // State
    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | 'banned' | 'active' | 'deleted'>('all')
    const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent')

    // Selected user for dialogs
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
    const [dialogType, setDialogType] = useState<
        'ban' | 'unban' | 'delete' | 'restore' | 'reset-password' | 'send-mail' | null
    >(null)

    // Fetch data
    const { data, isLoading, isFetching, refetch } = useGetAdminUsersQuery({
        page,
        per_page: perPage,
        q: searchTerm || undefined,
        status: statusFilter,
        order_by: [sortBy === 'recent' ? '-created_at' : 'created_at']
    })

    const users = data?.data || []
    const pagination = data?.meta

    // Handlers
    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setPage(1)
    }

    const handleStatusFilter = (value: string) => {
        setStatusFilter(value as 'all' | 'banned' | 'active' | 'deleted')
        setPage(1)
    }

    const handlePerPageChange = (value: string) => {
        setPerPage(Number(value))
        setPage(1)
    }

    const openDialog = (
        user: AdminUser,
        type: 'ban' | 'unban' | 'delete' | 'restore' | 'reset-password' | 'send-mail'
    ) => {
        setSelectedUser(user)
        setDialogType(type)
    }

    const closeDialog = () => {
        setSelectedUser(null)
        setDialogType(null)
    }

    const handleActionSuccess = () => {
        closeDialog()
        refetch()
        onUserDeleted?.()
    }

    // Render loading skeleton
    if (isLoading) {
        return (
            <div className='space-y-4'>
                <div className='flex gap-2'>
                    <Skeleton className='h-10 flex-1' />
                    <Skeleton className='h-10 w-32' />
                </div>
                <div className='border rounded-lg'>
                    <div className='p-4 space-y-3'>
                        {Array.from({ length: 5 }).map((_, i) => (
                            <Skeleton key={i} className='h-16' />
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className='space-y-4'>
            {/* Header - Search and Filters */}
            <div className='flex flex-col gap-3 md:flex-row md:items-end md:justify-between'>
                <div className='flex-1 relative'>
                    <Input
                        placeholder={t('users.placeholders.searchUsers')}
                        value={searchTerm}
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                </div>

                <div className='flex gap-2'>
                    {/* Status Filter */}
                    <Select value={statusFilter} onValueChange={handleStatusFilter}>
                        <SelectTrigger className='w-32'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='all'>{t('users.filters.allStatuses')}</SelectItem>
                            <SelectItem value='active'>{t('users.filters.active')}</SelectItem>
                            <SelectItem value='banned'>{t('users.filters.banned')}</SelectItem>
                            <SelectItem value='deleted'>{t('users.filters.deleted')}</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Sort By */}
                    <Select
                        value={sortBy}
                        onValueChange={(v) => {
                            setSortBy(v as 'recent' | 'oldest')
                            setPage(1)
                        }}
                    >
                        <SelectTrigger className='w-32'>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value='recent'>{t('users.filters.recent')}</SelectItem>
                            <SelectItem value='oldest'>{t('users.filters.oldest')}</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Table */}
            {users.length === 0 ? (
                <div className='border rounded-lg p-8 text-center'>
                    <p className='text-muted-foreground'>{t('users.emptyState')}</p>
                </div>
            ) : (
                <div className='border rounded-lg overflow-hidden'>
                    <Table>
                        <TableHeader>
                            <TableRow className='bg-muted/50'>
                                <TableHead className='font-semibold'>{t('users.columns.id')}</TableHead>
                                <TableHead className='font-semibold'>{t('users.columns.username')}</TableHead>
                                <TableHead className='font-semibold'>{t('users.columns.email')}</TableHead>
                                <TableHead className='font-semibold'>{t('users.columns.status')}</TableHead>
                                <TableHead className='font-semibold'>{t('users.columns.joinDate')}</TableHead>
                                <TableHead className='text-right font-semibold'>{t('users.columns.actions')}</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map((user) => {
                                const status = getUserStatus(user)

                                return (
                                    <TableRow key={user.id} className='hover:bg-muted/50'>
                                        <TableCell className='font-mono text-sm'>#{user.id}</TableCell>
                                        <TableCell className='font-medium'>{user.username}</TableCell>
                                        <TableCell className='text-sm max-w-xs truncate'>
                                            {truncateText(user.email, 25)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getUserStatusColor(status)}>
                                                {formatUserStatus(status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className='text-sm'>{formatAdminDate(user.created_at)}</TableCell>
                                        <TableCell className='text-right'>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant='ghost' size='sm' disabled={isFetching}>
                                                        ...
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align='end' className='w-48'>
                                                    {status === 'deleted' ? (
                                                        <DropdownMenuItem
                                                            onClick={() => openDialog(user, 'restore')}
                                                            className='cursor-pointer'
                                                        >
                                                            {t('users.actions.restore')}
                                                        </DropdownMenuItem>
                                                    ) : status === 'banned' ? (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => openDialog(user, 'reset-password')}
                                                                className='cursor-pointer'
                                                            >
                                                                {t('users.actions.resetPassword')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => openDialog(user, 'send-mail')}
                                                                className='cursor-pointer'
                                                            >
                                                                {t('users.actions.sendEmail')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => openDialog(user, 'unban')}
                                                                className='cursor-pointer'
                                                            >
                                                                {t('users.actions.unban')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => openDialog(user, 'delete')}
                                                                className='text-red-600 cursor-pointer'
                                                            >
                                                                {t('users.actions.delete')}
                                                            </DropdownMenuItem>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <DropdownMenuItem
                                                                onClick={() => openDialog(user, 'reset-password')}
                                                                className='cursor-pointer'
                                                            >
                                                                {t('users.actions.resetPassword')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => openDialog(user, 'send-mail')}
                                                                className='cursor-pointer'
                                                            >
                                                                {t('users.actions.sendEmail')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => openDialog(user, 'ban')}
                                                                className='text-orange-600 cursor-pointer'
                                                            >
                                                                {t('users.actions.ban')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => openDialog(user, 'delete')}
                                                                className='text-red-600 cursor-pointer'
                                                            >
                                                                {t('users.actions.delete')}
                                                            </DropdownMenuItem>
                                                        </>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* Pagination Controls */}
            {pagination && (
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                    {/* Per Page Selector */}
                    <div className='flex items-center gap-2'>
                        <span className='text-sm text-muted-foreground'>{t('common.perPage')}</span>
                        <Select value={String(perPage)} onValueChange={handlePerPageChange}>
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

                    {/* Info */}
                    <div className='text-sm text-muted-foreground'>
                        {t('common.showingResults', {
                            from: (pagination.current_page - 1) * perPage + 1,
                            to: Math.min(pagination.current_page * perPage, pagination?.total ?? 0),
                            total: pagination?.total ?? 0
                        })}
                    </div>

                    {/* Pagination */}
                    {pagination.last_page > 1 && (
                        <AutoPagination page={page} pageSize={pagination.last_page} onPageChange={setPage} />
                    )}
                </div>
            )}

            {/* Dialogs */}
            {selectedUser && (
                <>
                    <BanUserDialog
                        open={dialogType === 'ban'}
                        userUuid={selectedUser.uuid}
                        username={selectedUser.username}
                        onOpenChange={(open) => !open && closeDialog()}
                        onSuccess={handleActionSuccess}
                    />

                    <UnbanUserDialog
                        open={dialogType === 'unban'}
                        userUuid={selectedUser.uuid}
                        username={selectedUser.username}
                        onOpenChange={(open) => !open && closeDialog()}
                        onSuccess={handleActionSuccess}
                    />

                    <DeleteUserDialog
                        open={dialogType === 'delete'}
                        userUuid={selectedUser.uuid}
                        username={selectedUser.username}
                        onOpenChange={(open) => !open && closeDialog()}
                        onSuccess={handleActionSuccess}
                    />

                    <RestoreUserDialog
                        open={dialogType === 'restore'}
                        userUuid={selectedUser.uuid}
                        username={selectedUser.username}
                        onOpenChange={(open) => !open && closeDialog()}
                        onSuccess={handleActionSuccess}
                    />

                    <ResetUserPasswordDialog
                        open={dialogType === 'reset-password'}
                        userUuid={selectedUser.uuid}
                        username={selectedUser.username}
                        onOpenChange={(open) => !open && closeDialog()}
                        onSuccess={handleActionSuccess}
                    />

                    <SendUserMailDialog
                        open={dialogType === 'send-mail'}
                        userUuid={selectedUser.uuid}
                        username={selectedUser.username}
                        onOpenChange={(open) => !open && closeDialog()}
                        onSuccess={handleActionSuccess}
                    />
                </>
            )}
        </div>
    )
}
