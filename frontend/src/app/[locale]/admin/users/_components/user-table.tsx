'use client'

import { useTranslations } from 'next-intl'
import { useGetAdminUsersQuery } from '@/store/services/admin'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Trash2, ShieldOff, ShieldCheck, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AdminTableToolbar } from '@/components/admin'
import { TablePanel } from '@/components/table-panel'
import { TablePagination } from '@/components/table-pagination'
import { TableSkeleton } from '@/components/table-skeleton'
import { TooltipIconButton } from '@/components/ui/tooltip-icon-button'
import { EmptyState } from '@/components/empty-state'
import { BanUserDialog } from './ban-user-dialog'
import { UnbanUserDialog } from './unban-user-dialog'
import { DeleteUserDialog } from './delete-user-dialog'
import { RestoreUserDialog } from './restore-user-dialog'
import { ResetUserPasswordDialog } from './reset-user-password-dialog'
import { SendUserMailDialog } from './send-user-mail-dialog'
import { UserDetailDialog } from './user-detail-dialog'
import { formatAdminDate, getUserStatus, getUserStatusColor, truncateText } from '@/helpers/admin-helpers'
import { useAdminTableState } from '@/hooks/use-admin-table-state'
import { useDialog } from '@/hooks/use-dialog'
import { TABLE_HEAD_CLASS } from '@/constants/admin/ui'
import type { SortOrder } from '@/constants/ui/table'
import type { AdminUser } from '@/types/dtos/admin/admin-response.dto'

interface UserTableProps {
    onUserDeleted?: () => void
}

type UserStatusFilter = 'all' | 'banned' | 'active' | 'deleted'
type DialogType = 'detail' | 'ban' | 'unban' | 'delete' | 'restore' | 'reset-password' | 'send-mail'

export function UserTable({ onUserDeleted }: UserTableProps) {
    const t = useTranslations('AdminPage')

    const {
        page,
        perPage,
        searchTerm,
        statusFilter,
        sortBy,
        draftStatus,
        draftSort,
        hasActiveFilters,
        setPage,
        setDraftStatus,
        setDraftSort,
        handleSearch,
        handleReset,
        handlePerPageChange
    } = useAdminTableState('all')

    const { selectedItem: selectedUser, dialogType, openDialog, closeDialog } = useDialog<AdminUser, DialogType>()

    const { data, isLoading, isFetching, refetch } = useGetAdminUsersQuery({
        page,
        per_page: perPage,
        q: searchTerm || undefined,
        status: statusFilter as UserStatusFilter,
        order_by: [sortBy === 'recent' ? '-created_at' : 'created_at']
    })

    const users = data?.data ?? []
    const pagination = data?.meta

    const handleActionSuccess = () => {
        closeDialog()
        refetch()
        onUserDeleted?.()
    }

    if (isLoading) {
        return (
            <TableSkeleton
                columnWidths={['w-8 shrink-0', 'w-28', 'flex-1', 'w-16 rounded-full', 'w-24', 'w-20 ml-auto']}
            />
        )
    }

    return (
        <>
            <TablePanel
                isFetching={isFetching}
                toolbar={
                    <AdminTableToolbar
                        searchValue={searchTerm}
                        onSearchChange={handleSearch}
                        searchPlaceholder={t('users.placeholders.searchUsers')}
                        hasActiveFilters={hasActiveFilters}
                        onResetFilters={handleReset}
                        resetLabel={t('common.reset')}
                        isFetching={isFetching}
                        filters={
                            <>
                                <Select
                                    value={draftStatus}
                                    onValueChange={(v) => setDraftStatus(v as UserStatusFilter)}
                                >
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
                        <TablePagination
                            pagination={pagination}
                            page={page}
                            perPage={perPage}
                            onPageChange={setPage}
                            onPerPageChange={handlePerPageChange}
                            perPageLabel={t('common.perPage')}
                            showingResultsFormatter={(from, to, total) =>
                                t('common.showingResults', { from, to, total })
                            }
                        />
                    ) : undefined
                }
            >
                {users.length === 0 ? (
                    <EmptyState message={t('users.emptyState')} />
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className='hover:bg-muted/40'>
                                <TableHead className={`${TABLE_HEAD_CLASS} w-16`}>{t('users.columns.id')}</TableHead>
                                <TableHead className={TABLE_HEAD_CLASS}>{t('users.columns.username')}</TableHead>
                                <TableHead className={TABLE_HEAD_CLASS}>{t('users.columns.email')}</TableHead>
                                <TableHead className={`${TABLE_HEAD_CLASS} w-28`}>
                                    {t('users.columns.status')}
                                </TableHead>
                                <TableHead className={TABLE_HEAD_CLASS}>{t('users.columns.joinDate')}</TableHead>
                                <TableHead className={`text-right ${TABLE_HEAD_CLASS} w-28`}>
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
                                                    <TooltipIconButton
                                                        icon={ShieldCheck}
                                                        tooltip={t('users.actions.restore')}
                                                        onClick={() => openDialog(user, 'restore')}
                                                        disabled={isFetching}
                                                        className='text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                                                    />
                                                ) : status === 'banned' ? (
                                                    <TooltipIconButton
                                                        icon={ShieldCheck}
                                                        tooltip={t('users.actions.unban')}
                                                        onClick={() => openDialog(user, 'unban')}
                                                        disabled={isFetching}
                                                        className='text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950'
                                                    />
                                                ) : (
                                                    <TooltipIconButton
                                                        icon={ShieldOff}
                                                        tooltip={t('users.actions.ban')}
                                                        onClick={() => openDialog(user, 'ban')}
                                                        disabled={isFetching}
                                                        className='text-orange-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950'
                                                    />
                                                )}

                                                {status !== 'deleted' && (
                                                    <TooltipIconButton
                                                        icon={Trash2}
                                                        tooltip={t('users.actions.delete')}
                                                        onClick={() => openDialog(user, 'delete')}
                                                        disabled={isFetching}
                                                        className='text-destructive hover:text-destructive hover:bg-destructive/10'
                                                    />
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
            </TablePanel>

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
        </>
    )
}
