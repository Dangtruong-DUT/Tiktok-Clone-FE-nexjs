'use client'

import { useTranslations } from 'next-intl'
import { useUnbanUserMutation } from '@/store/services/admin'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { toast } from 'sonner'
import { extractApiErrorMessage } from '@/utils/errors/extract-api-error.util'

interface UnbanUserDialogProps {
    open: boolean
    userUuid: string
    username: string
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

export function UnbanUserDialog({ open, userUuid, username, onOpenChange, onSuccess }: UnbanUserDialogProps) {
    const t = useTranslations('AdminPage')
    const [unbanUser, { isLoading }] = useUnbanUserMutation()

    const handleUnban = async () => {
        try {
            await unbanUser({ user_uuid: userUuid }).unwrap()
            toast.success(t('users.messages.unbanSuccess'))
            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            toast.error(extractApiErrorMessage(error) ?? t('users.messages.unbanError'))
        }
    }

    return (
        <ConfirmDialog
            open={open}
            title={t('users.actions.unban')}
            description={t('users.dialogs.unbanSubtitle', { username })}
            confirmLabel={t('users.actions.confirmUnban')}
            cancelLabel={t('common.cancel')}
            onConfirm={handleUnban}
            isLoading={isLoading}
            onOpenChange={onOpenChange}
        />
    )
}
