'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import { ChevronRight, Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { useGetDashboardStatsQuery } from '@/store/services/admin'

interface ReviewItemConfig {
    labelKey: string
    getValue: (stats: { pending_appeals: number }) => number
    href: string
    dotClass: string
}

const REVIEW_ITEMS: ReviewItemConfig[] = [
    {
        labelKey: 'dashboard.pendingAppeals',
        getValue: (s) => s.pending_appeals,
        href: ADMIN_ROUTES.APPEALS,
        dotClass: 'bg-blue-400'
    }
]

export function DashboardNeedsReview() {
    const t = useTranslations('AdminPage')
    const { data, isLoading } = useGetDashboardStatsQuery({ period: 'today' })
    const stats = data?.data

    return (
        <div className='flex flex-col h-full rounded-xl border border-border/50 bg-card shadow-sm'>
            <div className='px-5 pt-5 pb-4 border-b border-border'>
                <div className='flex items-center gap-2'>
                    <Flag className='h-4 w-4 text-muted-foreground' />
                    <h2 className='text-sm font-semibold text-foreground'>{t('dashboard.needsReview')}</h2>
                </div>
                <p className='mt-0.5 text-xs text-muted-foreground'>{t('dashboard.needsReviewSub')}</p>
            </div>

            <div className='flex-1 divide-y divide-border'>
                {isLoading
                    ? Array.from({ length: 1 }).map((_, i) => (
                          <div key={i} className='px-5 py-4'>
                              <Skeleton className='h-5 w-full' />
                          </div>
                      ))
                    : REVIEW_ITEMS.map((item) => {
                          const count = stats ? item.getValue(stats) : 0
                          return (
                              <Link
                                  key={item.href}
                                  href={item.href}
                                  className={cn(
                                      'flex items-center justify-between px-5 py-4 transition-colors hover:bg-muted/40 group'
                                  )}
                              >
                                  <div className='flex items-center gap-3'>
                                      <span className={cn('h-2 w-2 rounded-full shrink-0', item.dotClass)} />
                                      <span className='text-sm text-foreground'>
                                          {t(item.labelKey as Parameters<typeof t>[0])}
                                      </span>
                                  </div>
                                  <div className='flex items-center gap-2'>
                                      <span className='text-sm font-semibold text-foreground'>{count}</span>
                                      <ChevronRight className='h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors' />
                                  </div>
                              </Link>
                          )
                      })}
            </div>
        </div>
    )
}
