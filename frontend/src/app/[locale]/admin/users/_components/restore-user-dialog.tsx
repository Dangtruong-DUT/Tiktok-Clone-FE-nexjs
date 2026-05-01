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
import { RotateCcw, Loader2 } from 'lucide-react'

interface RestoreUserDialogProps {
    open: boolean
    userUuid: string
    username: string
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

/**
 * RestoreUserDialog - Modal dialog to restore a deleted user
 * Confirms restore action (simple confirmation only)
 */
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
                    <div className='flex items-start gap-3'>
                        <RotateCcw className='w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0' />
                        <div>
                            <DialogTitle className='text-lg'>{t('users.actions.restore')}</DialogTitle>
                            <DialogDescription>{t('users.dialogs.restoreSubtitle', { username })}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <DialogFooter className='gap-2 sm:gap-0 pt-4'>
                    <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button type='button' onClick={handleRestore} disabled={isLoading}>
                        {isLoading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                        {isLoading ? t('common.loading') : t('users.actions.confirmRestore')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
