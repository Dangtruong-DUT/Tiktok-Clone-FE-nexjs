'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import {
    useListPromptTemplatesQuery,
    useUpdatePromptTemplateMutation,
    useLockPromptTemplateMutation,
    useUnlockPromptTemplateMutation
} from '@/store/services/admin/admin-ai-copilot.service'
import type { AiPromptTemplateDto } from '@/types/dtos/admin/ai/admin-ai-copilot.response.dto'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
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
import { Lock, Unlock, Save, ChevronDown, ChevronUp, Info } from 'lucide-react'
import LoadingIcon from '@/components/lottie-icons/loading'
import { toast } from 'sonner'


const CATEGORY_BADGE_CLASS: Record<string, string> = {
    platform: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    context: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400',
    routing: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
    data: 'bg-sky-100 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400',
    generative: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400',
    analysis: 'bg-pink-100 text-pink-700 dark:bg-pink-950/40 dark:text-pink-400',
    fallback: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
}

const CATEGORY_ORDER: Record<string, number> = {
    platform: 0,
    context: 1,
    routing: 2,
    data: 3,
    generative: 4,
    analysis: 5,
    fallback: 6
}

export default function PromptTemplatesPage() {
    const t = useTranslations('AdminPage.aiStudio.promptTemplates')
    const tAdmin = useTranslations('AdminPage')

    const { data, isLoading } = useListPromptTemplatesQuery()
    const [updateTemplate, { isLoading: isSaving }] = useUpdatePromptTemplateMutation()
    const [lockTemplate, { isLoading: isLocking }] = useLockPromptTemplateMutation()
    const [unlockTemplate, { isLoading: isUnlocking }] = useUnlockPromptTemplateMutation()

    const [expanded, setExpanded] = useState<string | null>(null)
    const [edits, setEdits] = useState<Record<string, Partial<AiPromptTemplateDto>>>({})
    const [unlockTarget, setUnlockTarget] = useState<AiPromptTemplateDto | null>(null)

    const templates = data?.data ?? []

    const grouped = templates.reduce<Record<string, AiPromptTemplateDto[]>>((acc, tpl) => {
        const cat = tpl.category ?? 'generative'
        if (!acc[cat]) acc[cat] = []
        acc[cat].push(tpl)
        return acc
    }, {})

    const sortedCategories = Object.keys(grouped).sort((a, b) => (CATEGORY_ORDER[a] ?? 99) - (CATEGORY_ORDER[b] ?? 99))

    const getCategoryLabel = (cat: string): string => {
        const key = `categories.${cat}` as Parameters<typeof t>[0]
        try {
            return t(key)
        } catch {
            return cat
        }
    }

    const handleSave = async (intent: string) => {
        const edit = edits[intent]
        if (!edit) return
        try {
            await updateTemplate({ intent, data: edit }).unwrap()
            toast.success(t('toast.saved'))
            setEdits((prev) => {
                const next = { ...prev }
                delete next[intent]
                return next
            })
        } catch {
            toast.error(t('toast.saveFailed'))
        }
    }

    const handleLock = async (tpl: AiPromptTemplateDto) => {
        await lockTemplate(tpl.intent).unwrap()
        toast.success(t('toast.locked'))
    }

    const handleUnlockConfirm = async () => {
        if (!unlockTarget) return
        try {
            await unlockTemplate(unlockTarget.intent).unwrap()
            toast.success(t('toast.unlocked'))
        } catch {
            toast.error(t('toast.saveFailed'))
        } finally {
            setUnlockTarget(null)
        }
    }

    const update = (intent: string, field: keyof AiPromptTemplateDto, value: string | boolean) => {
        setEdits((prev) => ({
            ...prev,
            [intent]: { ...(prev[intent] ?? {}), [field]: value }
        }))
    }

    const isBusy = isSaving || isLocking || isUnlocking

    return (
        <AdminLayout
            title={t('title')}
            description={t('description')}
            breadcrumbs={[
                { label: tAdmin('breadcrumbs.admin'), href: ADMIN_ROUTES.DASHBOARD },
                { label: tAdmin('aiStudio.breadcrumb'), href: '/admin/ai-studio' },
                { label: t('breadcrumb'), href: '#' }
            ]}
        >
            <AdminContainer>
                {isLoading && (
                    <div className='flex items-center justify-center py-12'>
                        <LoadingIcon className='size-8' loop />
                    </div>
                )}

                <div className='space-y-8'>
                    {sortedCategories.map((category) => {
                        const badgeClass = CATEGORY_BADGE_CLASS[category] ?? 'bg-zinc-100 text-zinc-600'
                        const isContext = category === 'context' || category === 'platform'

                        return (
                            <section key={category}>
                                <div className='mb-3 flex items-start gap-3'>
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <span
                                                className={`inline-flex items-center rounded-xl px-2 py-0.5 text-[11px] font-semibold ${badgeClass}`}
                                            >
                                                {category}
                                            </span>
                                            <span className='text-sm font-medium text-foreground'>
                                                {getCategoryLabel(category)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {isContext && (
                                    <div className='mb-3 flex items-start gap-2.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/20'>
                                        <Info className='mt-px size-4 shrink-0 text-emerald-600 dark:text-emerald-400' />
                                        <p className='text-xs text-emerald-700 dark:text-emerald-300'>
                                            {t('contextNotice')}
                                        </p>
                                    </div>
                                )}

                                <div className='space-y-2'>
                                    {grouped[category].map((tpl) => {
                                        const isOpen = expanded === tpl.intent
                                        const hasEdits = !!edits[tpl.intent]
                                        const current = { ...tpl, ...edits[tpl.intent] }
                                        const locked = current.is_locked

                                        return (
                                            <Collapsible
                                                key={tpl.intent}
                                                open={isOpen}
                                                onOpenChange={(open) => setExpanded(open ? tpl.intent : null)}
                                            >
                                                <div className='overflow-hidden rounded-xl border bg-card'>
                                                    <CollapsibleTrigger className='flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-muted/50'>
                                                        <div className='flex items-center gap-3'>
                                                            <span className='rounded bg-muted px-2 py-0.5 font-mono text-xs'>
                                                                {tpl.intent}
                                                            </span>
                                                            <span className='text-sm font-medium'>
                                                                {current.display_name}
                                                            </span>
                                                            {locked && (
                                                                <Badge
                                                                    variant='secondary'
                                                                    className='gap-1 py-0 text-[10px]'
                                                                >
                                                                    <Lock className='size-2.5' />
                                                                    {t('lock')}
                                                                </Badge>
                                                            )}
                                                            {hasEdits && !locked && (
                                                                <span className='text-[10px] font-medium text-orange-500'>
                                                                    {t('unsaved')}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className='flex items-center gap-2'>
                                                            <span className='text-[10px] text-muted-foreground'>
                                                                v{tpl.version}
                                                            </span>
                                                            {isOpen ? (
                                                                <ChevronUp className='size-4' />
                                                            ) : (
                                                                <ChevronDown className='size-4' />
                                                            )}
                                                        </div>
                                                    </CollapsibleTrigger>

                                                    <CollapsibleContent>
                                                        <div className='space-y-4 border-t px-4 py-4'>
                                                            <div className='space-y-1.5'>
                                                                <label className='block text-xs font-medium text-muted-foreground'>
                                                                    {t('fields.systemPrompt')}
                                                                </label>
                                                                <Textarea
                                                                    value={current.system_prompt}
                                                                    onChange={(e) =>
                                                                        update(
                                                                            tpl.intent,
                                                                            'system_prompt',
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    rows={10}
                                                                    disabled={locked}
                                                                    className='font-mono text-sm resize-y'
                                                                />
                                                            </div>
                                                            <div className='space-y-1.5'>
                                                                <label className='block text-xs font-medium text-muted-foreground'>
                                                                    {t('fields.userTemplate')}
                                                                </label>
                                                                <Textarea
                                                                    value={current.user_template}
                                                                    onChange={(e) =>
                                                                        update(
                                                                            tpl.intent,
                                                                            'user_template',
                                                                            e.target.value
                                                                        )
                                                                    }
                                                                    rows={3}
                                                                    disabled={locked}
                                                                    className='font-mono text-sm resize-y'
                                                                />
                                                            </div>
                                                            <div className='flex items-center justify-between'>
                                                                <div className='flex items-center gap-4'>
                                                                    <div className='flex items-center gap-2'>
                                                                        <Switch
                                                                            checked={current.is_active}
                                                                            onCheckedChange={(checked) =>
                                                                                update(tpl.intent, 'is_active', checked)
                                                                            }
                                                                            disabled={locked}
                                                                            size='sm'
                                                                            aria-label={t('active')}
                                                                        />
                                                                        <span className='text-xs text-muted-foreground'>
                                                                            {t('active')}
                                                                        </span>
                                                                    </div>
                                                                    <Button
                                                                        type='button'
                                                                        variant='ghost'
                                                                        size='sm'
                                                                        disabled={isBusy}
                                                                        className='gap-1.5 text-xs h-7'
                                                                        onClick={() =>
                                                                            locked
                                                                                ? setUnlockTarget(tpl)
                                                                                : handleLock(tpl)
                                                                        }
                                                                    >
                                                                        {locked ? (
                                                                            <>
                                                                                <Unlock className='size-3.5' />
                                                                                {t('unlock')}
                                                                            </>
                                                                        ) : (
                                                                            <>
                                                                                <Lock className='size-3.5' />
                                                                                {t('lock')}
                                                                            </>
                                                                        )}
                                                                    </Button>
                                                                </div>
                                                                {hasEdits && !locked && (
                                                                    <Button
                                                                        size='sm'
                                                                        onClick={() => handleSave(tpl.intent)}
                                                                        disabled={isSaving}
                                                                        className='gap-1.5'
                                                                    >
                                                                        {isSaving ? (
                                                                            <LoadingIcon className='size-3.5' loop />
                                                                        ) : (
                                                                            <Save className='size-3' />
                                                                        )}
                                                                        {isSaving ? t('saving') : t('save')}
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </CollapsibleContent>
                                                </div>
                                            </Collapsible>
                                        )
                                    })}
                                </div>
                            </section>
                        )
                    })}
                </div>
            </AdminContainer>

            {/* Unlock confirmation dialog */}
            <AlertDialog open={!!unlockTarget} onOpenChange={(open) => !open && setUnlockTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('confirmUnlockTitle')}</AlertDialogTitle>
                        <AlertDialogDescription>{t('confirmUnlockDescription')}</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction onClick={handleUnlockConfirm}>{t('unlock')}</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    )
}
