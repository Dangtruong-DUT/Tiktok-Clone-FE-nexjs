'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useDeleteUserMutation } from '@/store/services/admin.service'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { AlertTriangle, Loader2 } from 'lucide-react'

interface DeleteUserDialogProps {
    open: boolean
    userId: number
    username: string
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

/**
 * DeleteUserDialog - Modal dialog to delete a user
 * Collects: reason (required)
 * Includes confirmation warning about permanent deletion
 */
export function DeleteUserDialog({ open, userId, username, onOpenChange, onSuccess }: DeleteUserDialogProps) {
    const t = useTranslations('AdminPage')
    const [deleteUser, { isLoading }] = useDeleteUserMutation()

    const [reason, setReason] = useState('')
    const [error, setError] = useState('')

    const handleCloseDialog = () => {
        setReason('')
        setError('')
        onOpenChange(false)
    }

    const validateForm = (): boolean => {
        if (!reason.trim()) {
            setError(t('users.errors.reasonRequired'))
            return false
        }

        if (reason.trim().length < 10) {
            setError(t('users.errors.reasonMinLength'))
            return false
        }

        return true
    }

    const handleDelete = async () => {
        if (!validateForm()) return

        try {
            await deleteUser({
                user_id: userId,
                reason: reason.trim()
            }).unwrap()

            toast.success(t('users.messages.deleteSuccess'))

            handleCloseDialog()
            onSuccess?.()
        } catch (error) {
            const errorMessage = (error as { data?: { message?: string } })?.data?.message
            toast.error(errorMessage || t('users.messages.deleteError'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[500px]'>
                <DialogHeader>
                    <div className='flex items-start gap-3'>
                        <AlertTriangle className='w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0' />
                        <div>
                            <DialogTitle className='text-lg'>{t('users.dialogs.deleteTitle')}</DialogTitle>
                            <DialogDescription className='mt-1'>
                                {t('users.dialogs.deleteSubtitle', { username })}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className='space-y-4 py-4'>
                    {/* Warning Box */}
                    <div className='bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3'>
                        <p className='text-sm text-yellow-800 dark:text-yellow-200'>
                            ⚠️ {t('users.dialogs.deleteWarning')}
                        </p>
                    </div>

                    {/* Reason Field */}
                    <div className='space-y-2'>
                        <Label htmlFor='reason' className='text-sm font-semibold'>
                            {t('users.labels.reason')}
                            <span className='text-red-600 ml-1'>*</span>
                        </Label>
                        <Textarea
                            id='reason'
                            placeholder={t('users.placeholders.deleteReason')}
                            value={reason}
                            onChange={(e) => {
                                setReason(e.target.value)
                                if (error) setError('')
                            }}
                            className='min-h-[100px] resize-none'
                            disabled={isLoading}
                        />
                        {error && <p className='text-sm text-red-600'>{error}</p>}
                    </div>
                </div>

                <DialogFooter className='gap-2 sm:gap-0'>
                    <Button type='button' variant='outline' onClick={handleCloseDialog} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button type='button' variant='destructive' onClick={handleDelete} disabled={isLoading}>
                        {isLoading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                        {isLoading ? t('common.loading') : t('users.actions.confirmDelete')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
