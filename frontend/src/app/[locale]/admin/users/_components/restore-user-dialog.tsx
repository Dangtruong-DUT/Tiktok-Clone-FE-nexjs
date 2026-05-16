'use client'

import { useTranslations } from 'next-intl'
import { useRestoreUserMutation } from '@/store/services/admin'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { extractApiError } from '@/utils/extract-api-error'
import { toast } from 'sonner'

interface RestoreUserDialogProps {
    open: boolean
    userUuid: string
    username: string
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function RestoreUserDialog({ open, userUuid, username, onOpenChange, onSuccess }: RestoreUserDialogProps) {
    const t = useTranslations('AdminPage')
    const [restoreUser, { isLoading }] = useRestoreUserMutation()

    const handleRestore = async () => {
        try {
            await restoreUser({ user_uuid: userUuid }).unwrap()
            toast.success(t('users.messages.restoreSuccess'))
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            toast.error(extractApiError(error) ?? t('users.messages.restoreError'))
        }
    }

    return (
        <ConfirmDialog
            open={open}
            title={t('users.actions.restore')}
            description={t('users.dialogs.restoreSubtitle', { username })}
            confirmLabel={t('users.actions.confirmRestore')}
            cancelLabel={t('common.cancel')}
            onConfirm={handleRestore}
            isLoading={isLoading}
            onOpenChange={onOpenChange}
        />
    )
}
