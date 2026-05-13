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
import { AdminTableToolbar, AdminTablePagination, AdminTablePanel } from '@/components/admin'
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

    // Applied state — used in API query
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all')
    const [sortBy, setSortBy] = useState<SortOrder>('recent')

    // Draft state — controlled by UI, applied only on Search click
    const [draftStatus, setDraftStatus] = useState<UserStatusFilter>('all')
    const [draftSort, setDraftSort] = useState<SortOrder>('recent')

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
        setStatusFilter(draftStatus)
        setSortBy(draftSort)
        setPage(1)
    }

    const handleResetFilters = () => {
        setDraftStatus('all')
        setDraftSort('recent')
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
            <div className='rounded-xl border bg-card shadow-xs overflow-hidden'>
                <div className='border-b border-border/50 px-4 py-2.5'>
                    <Skeleton className='h-8 w-full rounded-md' />
                </div>
                <div className='divide-y divide-border/40'>
                    <div className='bg-muted/30 px-4 py-2.5'>
                        <Skeleton className='h-3.5 w-1/2' />
                    </div>
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className='flex items-center gap-4 px-4 py-3.5'>
                            <Skeleton className='h-3.5 w-8 shrink-0' />
                            <Skeleton className='h-3.5 w-28' />
                            <Skeleton className='h-3.5 flex-1' />
                            <Skeleton className='h-5 w-16 rounded-full' />
                            <Skeleton className='h-3.5 w-24' />
                            <Skeleton className='h-7 w-20 rounded-md ml-auto' />
                        </div>
                    ))}
                </div>
                <div className='border-t border-border/50 px-4 py-2.5'>
                    <Skeleton className='h-7 w-48' />
                </div>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <AdminTablePanel
                isFetching={isFetching}
                toolbar={
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
                                <Select value={draftStatus} onValueChange={(v) => setDraftStatus(v as UserStatusFilter)}>
                                    <SelectTrigger className='h-7 w-36 rounded text-xs'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='all'>{t('users.filters.allStatuses')}</SelectItem>
                                        <SelectItem value='active'>{t('users.filters.active')}</SelectItem>
                                        <SelectItem value='banned'>{t('users.filters.banned')}</SelectItem>
                                        <SelectItem value='deleted'>{t('users.filters.deleted')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={draftSort} onValueChange={(v) => setDraftSort(v as SortOrder)}>
                                    <SelectTrigger className='h-7 w-32 rounded text-xs'>
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
                }
                pagination={
                    pagination ? (
                        <AdminTablePagination
                            pagination={pagination}
                            page={page}
                            perPage={perPage}
                            onPageChange={setPage}
                            onPerPageChange={(n) => {
                                setPerPage(n)
                                setPage(1)
                            }}
                        />
                    ) : undefined
                }
            >
                {users.length === 0 ? (
                    <div className='py-16 text-center'>
                        <p className='text-sm text-muted-foreground'>{t('users.emptyState')}</p>
                    </div>
                ) : (
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
                                        <TableCell className='text-sm font-medium'>{user.username}</TableCell>
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
                )}
            </AdminTablePanel>

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
        </TooltipProvider>
    )
}
