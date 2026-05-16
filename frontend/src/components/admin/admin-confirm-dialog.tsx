'use client'

import { type ComponentProps } from 'react'
import { useTranslations } from 'next-intl'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'

type ButtonVariant = ComponentProps<typeof Button>['variant']

const VARIANT_CLASS: Record<NonNullable<ButtonVariant>, string> = {
    default: '',
    destructive: 'bg-destructive text-white hover:bg-destructive/90',
    outline: '',
    secondary: '',
    ghost: '',
    link: ''
}

interface AdminConfirmDialogProps {
    open: boolean
    title: string
    description: string
    confirmLabel: string
    onConfirm: () => void | Promise<void>
    isLoading?: boolean
    onOpenChange: (open: boolean) => void
    confirmVariant?: ButtonVariant
}

export function AdminConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    onConfirm,
    isLoading,
    onOpenChange,
    confirmVariant = 'default'
}: AdminConfirmDialogProps) {
    const t = useTranslations('AdminPage')

    return (
        <ConfirmDialog
            open={open}
            title={title}
            description={description}
            confirmLabel={confirmLabel}
            cancelLabel={t('common.cancel')}
            onConfirm={onConfirm}
            isLoading={isLoading}
            onOpenChange={onOpenChange}
            confirmClassName={confirmVariant ? VARIANT_CLASS[confirmVariant] : undefined}
        />
    )
}
