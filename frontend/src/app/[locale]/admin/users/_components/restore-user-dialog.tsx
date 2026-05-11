'use client'

import { useTranslations } from 'next-intl'
import { useRestoreUserMutation } from '@/store/services/admin/index'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
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
            await restoreUser({
                user_uuid: userUuid
            }).unwrap()

            toast.success(t('users.messages.restoreSuccess'))

            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            const errorMessage = (error as { data?: { message?: string } })?.data?.message
            toast.error(errorMessage || t('users.messages.restoreError'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[400px]'>
                <DialogHeader>
                    <div>
                        <DialogTitle className='text-lg'>{t('users.actions.restore')}</DialogTitle>
                        <DialogDescription>{t('users.dialogs.restoreSubtitle', { username })}</DialogDescription>
                    </div>
                </DialogHeader>

                <DialogFooter className='gap-2 pt-4'>
                    <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button type='button' onClick={handleRestore} disabled={isLoading}>
                        {isLoading ? t('common.loading') : t('users.actions.confirmRestore')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
