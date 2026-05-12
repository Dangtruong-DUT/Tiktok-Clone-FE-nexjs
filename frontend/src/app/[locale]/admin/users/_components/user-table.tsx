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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'
import { Trash2, ShieldOff, ShieldCheck, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { AdminTableToolbar, AdminTablePagination, AdminTableWrapper } from '@/components/admin'
import { BanUserDialog } from './ban-user-dialog'
import { UnbanUserDialog } from './unban-user-dialog'
import { DeleteUserDialog } from './delete-user-dialog'
import { RestoreUserDialog } from './restore-user-dialog'
import { ResetUserPasswordDialog } from './reset-user-password-dialog'
import { SendUserMailDialog } from './send-user-mail-dialog'
import { UserDetailDialog } from './user-detail-dialog'
import { formatAdminDate, getUserStatus, getUserStatusColor, truncateText } from '@/helpers/admin-helpers'
import type { AdminUser } from '@/types/dtos/admin/admin-response.dto'

interface UserTableProps {
    onUserDeleted?: () => void
}

type UserStatusFilter = 'all' | 'banned' | 'active' | 'deleted'
type SortOrder = 'recent' | 'oldest'
type DialogType = 'detail' | 'ban' | 'unban' | 'delete' | 'restore' | 'reset-password' | 'send-mail'

export function UserTable({ onUserDeleted }: UserTableProps) {
    const t = useTranslations('AdminPage')

    const [page, setPage] = useState(1)
    const [perPage, setPerPage] = useState(10)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all')
    const [sortBy, setSortBy] = useState<SortOrder>('recent')
    const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
    const [dialogType, setDialogType] = useState<DialogType | null>(null)

    const { data, isLoading, isFetching, refetch } = useGetAdminUsersQuery({
        page,
        per_page: perPage,
        q: searchTerm || undefined,
        status: statusFilter,
        order_by: [sortBy === 'recent' ? '-created_at' : 'created_at']
    })

    const users = data?.data ?? []
    const pagination = data?.meta

    const hasActiveFilters = statusFilter !== 'all' || sortBy !== 'recent'

    const handleSearch = (value: string) => {
        setSearchTerm(value)
        setPage(1)
    }

    const handleResetFilters = () => {
        setStatusFilter('all')
        setSortBy('recent')
        setPage(1)
    }

    const openDialog = (user: AdminUser, type: DialogType) => {
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

    if (isLoading) {
        return (
            <div className='space-y-4'>
                <div className='rounded-xl border bg-card shadow-xs p-3'>
                    <Skeleton className='h-9 w-full rounded-lg' />
                </div>
                <div className='rounded-xl border bg-card shadow-xs overflow-hidden divide-y'>
                    <div className='bg-muted/40 px-3 py-3'><Skeleton className='h-4 w-3/4' /></div>
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className='flex items-center gap-4 px-3 py-4'>
                            <Skeleton className='h-4 w-8 shrink-0' />
                            <Skeleton className='h-4 w-32' />
                            <Skeleton className='h-4 flex-1' />
                            <Skeleton className='h-5 w-16 rounded-full' />
                            <Skeleton className='h-4 w-24' />
                            <Skeleton className='h-8 w-20 rounded-lg' />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className='space-y-4'>
                <AdminTableToolbar
                    searchValue={searchTerm}
                    onSearchChange={handleSearch}
                    searchPlaceholder={t('users.placeholders.searchUsers')}
                    hasActiveFilters={hasActiveFilters}
                    onResetFilters={handleResetFilters}
                    resetLabel={t('common.reset')}
                    isFetching={isFetching}
                    filters={
                        <>
                            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as UserStatusFilter); setPage(1) }}>
                                <SelectTrigger className='h-8 w-36 rounded-lg text-xs'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>{t('users.filters.allStatuses')}</SelectItem>
                                    <SelectItem value='active'>{t('users.filters.active')}</SelectItem>
                                    <SelectItem value='banned'>{t('users.filters.banned')}</SelectItem>
                                    <SelectItem value='deleted'>{t('users.filters.deleted')}</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select value={sortBy} onValueChange={(v) => { setSortBy(v as SortOrder); setPage(1) }}>
                                <SelectTrigger className='h-8 w-32 rounded-lg text-xs'>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='recent'>{t('users.filters.recent')}</SelectItem>
                                    <SelectItem value='oldest'>{t('users.filters.oldest')}</SelectItem>
                                </SelectContent>
                            </Select>
                        </>
                    }
                />

                <AdminTableWrapper isFetching={isFetching}>
                {users.length === 0 ? (
                    <div className='rounded-xl border bg-card p-12 text-center shadow-xs'>
                        <p className='text-sm text-muted-foreground'>{t('users.emptyState')}</p>
                    </div>
                ) : (
                    <div className='rounded-xl border bg-card shadow-xs overflow-hidden'>
                        <Table>
                            <TableHeader>
                                <TableRow className='hover:bg-muted/40'>
                                    <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground w-16'>
                                        {t('users.columns.id')}
                                    </TableHead>
                                    <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                                        {t('users.columns.username')}
                                    </TableHead>
                                    <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                                        {t('users.columns.email')}
                                    </TableHead>
                                    <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28'>
                                        {t('users.columns.status')}
                                    </TableHead>
                                    <TableHead className='text-xs font-semibold uppercase tracking-wide text-muted-foreground'>
                                        {t('users.columns.joinDate')}
                                    </TableHead>
                                    <TableHead className='text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground w-28'>
                                        {t('users.columns.actions')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => {
                                    const status = getUserStatus(user)
                                    return (
                                        <TableRow key={user.id} className='hover:bg-muted/40'>
                                            <TableCell className='font-mono text-xs text-muted-foreground'>
                                                #{user.id}
                                            </TableCell>
                                            <TableCell className='text-sm font-medium'>
                                                {user.username}
                                            </TableCell>
                                            <TableCell className='text-sm text-muted-foreground'>
                                                {truncateText(user.email, 28)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getUserStatusColor(status)}>
                                                    {t(`userStatus.${status}` as Parameters<typeof t>[0])}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className='text-sm text-muted-foreground'>
                                                {formatAdminDate(user.created_at)}
                                            </TableCell>
                                            <TableCell className='text-right'>
                                                <div className='flex items-center justify-end gap-1'>
                                                    {status === 'deleted' ? (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    className='h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                                                                    onClick={() => openDialog(user, 'restore')}
                                                                    disabled={isFetching}
                                                                >
                                                                    <ShieldCheck className='h-4 w-4' />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{t('users.actions.restore')}</TooltipContent>
                                                        </Tooltip>
                                                    ) : status === 'banned' ? (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    className='h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                                                                    onClick={() => openDialog(user, 'unban')}
                                                                    disabled={isFetching}
                                                                >
                                                                    <ShieldCheck className='h-4 w-4' />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{t('users.actions.unban')}</TooltipContent>
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    className='h-8 w-8 text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950'
                                                                    onClick={() => openDialog(user, 'ban')}
                                                                    disabled={isFetching}
                                                                >
                                                                    <ShieldOff className='h-4 w-4' />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{t('users.actions.ban')}</TooltipContent>
                                                        </Tooltip>
                                                    )}

                                                    {status !== 'deleted' && (
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <Button
                                                                    variant='ghost'
                                                                    size='icon'
                                                                    className='h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10'
                                                                    onClick={() => openDialog(user, 'delete')}
                                                                    disabled={isFetching}
                                                                >
                                                                    <Trash2 className='h-4 w-4' />
                                                                </Button>
                                                            </TooltipTrigger>
                                                            <TooltipContent>{t('users.actions.delete')}</TooltipContent>
                                                        </Tooltip>
                                                    )}

                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant='ghost'
                                                                size='icon'
                                                                className='h-8 w-8'
                                                                disabled={isFetching}
                                                            >
                                                                <MoreHorizontal className='h-4 w-4' />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align='end' className='w-48'>
                                                            <DropdownMenuItem
                                                                onClick={() => openDialog(user, 'detail')}
                                                                className='cursor-pointer'
                                                            >
                                                                {t('users.actions.viewDetails')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
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
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                )}
                </AdminTableWrapper>

                {pagination && (
                    <AdminTablePagination
                        pagination={pagination}
                        page={page}
                        perPage={perPage}
                        onPageChange={setPage}
                        onPerPageChange={(n) => { setPerPage(n); setPage(1) }}
                    />
                )}

                {selectedUser && (
                    <>
                        <UserDetailDialog
                            open={dialogType === 'detail'}
                            user={selectedUser}
                            onOpenChange={(open) => !open && closeDialog()}
                        />
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
        </TooltipProvider>
    )
}
