'use client'

import { Loader2 } from 'lucide-react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface ConfirmDialogProps {
    open: boolean
    title: string
    description?: string
    confirmLabel: string
    cancelLabel?: string
    onConfirm: () => void | Promise<void>
    isLoading?: boolean
    onOpenChange: (open: boolean) => void
    confirmClassName?: string
}

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel = 'Cancel',
    onConfirm,
    isLoading,
    onOpenChange,
    confirmClassName
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isLoading}>{cancelLabel}</AlertDialogCancel>
                    <AlertDialogAction onClick={onConfirm} disabled={isLoading} className={cn(confirmClassName)}>
                        {isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : confirmLabel}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
