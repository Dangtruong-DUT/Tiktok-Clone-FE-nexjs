'use client'

import { useTranslations } from 'next-intl'
import { useUnhidePostMutation } from '@/store/services/admin.service'
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

interface UnhidePostDialogProps {
    open: boolean
    postUuid: string
    authorUsername: string
    onOpenChange: (open: boolean) => void
    onSuccess?: () => void
}

/**
 * UnhidePostDialog - Modal dialog to unhide a post
 * Simple confirmation only
 */
export function UnhidePostDialog({ open, postUuid, authorUsername, onOpenChange, onSuccess }: UnhidePostDialogProps) {
    const t = useTranslations('AdminPage')
    const [unhidePost, { isLoading }] = useUnhidePostMutation()

    const handleUnhide = async () => {
        try {
            await unhidePost({
                post_uuid: postUuid
            }).unwrap()

            toast.success(t('posts.messages.unhideSuccess'))

            onOpenChange(false)
            onSuccess?.()
        } catch (error) {
            const errorMessage = (error as { data?: { message?: string } })?.data?.message
            toast.error(errorMessage || t('posts.messages.unhideError'))
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className='sm:max-w-[400px]'>
                <DialogHeader>
                    <div className='flex items-start gap-3'>
                        <CheckCircle className='w-5 h-5 text-green-600 mt-0.5 flex-shrink-0' />
                        <div>
                            <DialogTitle className='text-lg'>{t('posts.actions.unhide')}</DialogTitle>
                            <DialogDescription>
                                {t('posts.dialogs.unhideSubtitle', { username: authorUsername })}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <DialogFooter className='gap-2 sm:gap-0 pt-4'>
                    <Button type='button' variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
                        {t('common.cancel')}
                    </Button>
                    <Button type='button' onClick={handleUnhide} disabled={isLoading}>
                        {isLoading && <Loader2 className='w-4 h-4 mr-2 animate-spin' />}
                        {isLoading ? t('common.loading') : t('posts.actions.confirmUnhide')}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
