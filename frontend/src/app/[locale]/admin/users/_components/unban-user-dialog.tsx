'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useUnbanUserMutation } from '@/store/services/admin.service'
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
import { CheckCircle, Loader2 } from 'lucide-react'

interface UnbanUserDialogProps {
    open: boolean
    userId: number
    username: string
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

/**
 * UnbanUserDialog - Modal dialog to unban a user
 * Confirms unban action (simple confirmation only)
 */
export function UnbanUserDialog({ open, userId, username, onOpenChange, onSuccess }: UnbanUserDialogProps) {
    const t = useTranslations('AdminPage')
    const [unbanUser, { isLoading }] = useUnbanUserMutation()

    const handleUnban = async () => {
        try {
            await unbanUser({
                user_id: userId
            }).unwrap()

            toast.success(t('users.messages.unbanSuccess'))

            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            const errorMessage = (error as { data?: { message?: string } })?.data?.message
            toast.error(errorMessage || t('users.messages.unbanError'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[400px]'>
                <DialogHeader>
                    <div className='flex items-start gap-3'>
                        <CheckCircle className='w-5 h-5 text-green-600 mt-0.5 flex-shrink-0' />
                        <div>
                            <DialogTitle className='text-lg'>{t('users.actions.unban')}</DialogTitle>
                            <DialogDescription>{t('users.dialogs.unbanSubtitle', { username })}</DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <DialogFooter className='gap-2 sm:gap-0 pt-4'>
                    <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button type='button' onClick={handleUnban} disabled={isLoading}>
                        {isLoading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                        {isLoading ? t('common.loading') : t('users.actions.confirmUnban')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
