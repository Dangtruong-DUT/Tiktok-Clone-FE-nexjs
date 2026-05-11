'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Flag, UserX, Trash2, MessageSquareWarning } from 'lucide-react'
import { useRouter } from '@/i18n/navigation'

export function DashboardQuickActions() {
    const t = useTranslations('AdminPage')
    const router = useRouter()

    const actions = [
        {
            label: t('dashboard.quickActions.reviewAppeals'),
            icon: Flag,
            href: '/admin/appeals',
            variant: 'outline' as const
        },
        {
            label: t('dashboard.quickActions.manageUsers'),
            icon: UserX,
            href: '/admin/users',
            variant: 'outline' as const
        },
        {
            label: t('dashboard.quickActions.moderatePosts'),
            icon: Trash2,
            href: '/admin/posts',
            variant: 'outline' as const
        },
        {
            label: t('dashboard.quickActions.moderateComments'),
            icon: MessageSquareWarning,
            href: '/admin/comments',
            variant: 'outline' as const
        }
    ]

    return (
        <Card>
            <CardHeader className='pb-3'>
                <CardTitle className='text-base font-semibold'>{t('dashboard.quickActions.title')}</CardTitle>
            </CardHeader>
            <CardContent>
                <div className='grid grid-cols-2 gap-3 sm:grid-cols-4'>
                    {actions.map((action) => {
                        const Icon = action.icon
                        return (
                            <Button
                                key={action.href}
                                variant={action.variant}
                                className='h-auto flex-col gap-2 py-4'
                                onClick={() => router.push(action.href)}
                            >
                                <Icon className='h-5 w-5' />
                                <span className='text-xs'>{action.label}</span>
                            </Button>
                        )
                    })}
                </div>
            </CardContent>
        </Card>
    )
}
