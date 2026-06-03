'use client'

import { useState } from 'react'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import { useListPromptTemplatesQuery, useUpdatePromptTemplateMutation } from '@/store/services/admin/admin-ai-copilot.service'
import { Button } from '@/components/ui/button'
import { Loader2, Save, ChevronDown, ChevronUp } from 'lucide-react'
import { toast } from 'sonner'

interface PromptTemplate {
    id: number
    intent: string
    display_name: string
    system_prompt: string
    user_template: string
    is_active: boolean
    version: number
}

export default function PromptTemplatesPage() {
    const { data, isLoading } = useListPromptTemplatesQuery()
    const [updateTemplate, { isLoading: isSaving }] = useUpdatePromptTemplateMutation()
    const [expanded, setExpanded] = useState<string | null>(null)
    const [edits, setEdits] = useState<Record<string, Partial<PromptTemplate>>>({})

    const templates = (data as { data?: PromptTemplate[] })?.data ?? []

    const handleSave = async (intent: string) => {
        const edit = edits[intent]
        if (!edit) return

        try {
            await updateTemplate({ intent, data: edit }).unwrap()
            toast.success('Template saved')
            setEdits((prev) => {
                const next = { ...prev }
                delete next[intent]
                return next
            })
        } catch {
            toast.error('Failed to save template')
        }
    }

    const update = (intent: string, field: keyof PromptTemplate, value: string | boolean) => {
        setEdits((prev) => ({
            ...prev,
            [intent]: { ...(prev[intent] ?? {}), [field]: value },
        }))
    }

    return (
        <AdminLayout
            title='Prompt Templates'
            description='Edit system prompts and user templates for the AI Copilot'
            breadcrumbs={[
                { label: 'Admin', href: ADMIN_ROUTES.DASHBOARD },
                { label: 'AI Studio', href: '/admin/ai-studio' },
                { label: 'Prompt Templates', href: '#' },
            ]}
        >
            <AdminContainer>
                {isLoading && (
                    <div className='flex items-center justify-center py-12'>
                        <Loader2 className='size-6 animate-spin text-muted-foreground' />
                    </div>
                )}

                <div className='space-y-3'>
                    {templates.map((tpl) => {
                        const isOpen   = expanded === tpl.intent
                        const hasEdits = !!edits[tpl.intent]
                        const current  = { ...tpl, ...edits[tpl.intent] }

                        return (
                            <div key={tpl.intent} className='rounded-xl border bg-card overflow-hidden'>
                                <button
                                    className='w-full flex items-center justify-between px-4 py-3 hover:bg-muted/50 transition-colors'
                                    onClick={() => setExpanded(isOpen ? null : tpl.intent)}
                                >
                                    <div className='flex items-center gap-3'>
                                        <span className='font-mono text-xs bg-muted px-2 py-0.5 rounded'>
                                            {tpl.intent}
                                        </span>
                                        <span className='text-sm font-medium'>{current.display_name}</span>
                                        {hasEdits && (
                                            <span className='text-[10px] text-orange-500 font-medium'>Unsaved</span>
                                        )}
                                    </div>
                                    <div className='flex items-center gap-2'>
                                        <span className='text-[10px] text-muted-foreground'>v{tpl.version}</span>
                                        {isOpen ? <ChevronUp className='size-4' /> : <ChevronDown className='size-4' />}
                                    </div>
                                </button>

                                {isOpen && (
                                    <div className='border-t px-4 py-4 space-y-4'>
                                        <div>
                                            <label className='text-xs font-medium text-muted-foreground mb-1 block'>
                                                System Prompt
                                            </label>
                                            <textarea
                                                value={current.system_prompt}
                                                onChange={(e) => update(tpl.intent, 'system_prompt', e.target.value)}
                                                rows={8}
                                                className='w-full rounded-md border bg-background px-3 py-2 text-sm font-mono resize-y'
                                            />
                                        </div>
                                        <div>
                                            <label className='text-xs font-medium text-muted-foreground mb-1 block'>
                                                User Template
                                            </label>
                                            <textarea
                                                value={current.user_template}
                                                onChange={(e) => update(tpl.intent, 'user_template', e.target.value)}
                                                rows={3}
                                                className='w-full rounded-md border bg-background px-3 py-2 text-sm font-mono resize-y'
                                            />
                                        </div>
                                        <div className='flex items-center justify-between'>
                                            <label className='flex items-center gap-2 text-sm cursor-pointer'>
                                                <input
                                                    type='checkbox'
                                                    checked={current.is_active}
                                                    onChange={(e) => update(tpl.intent, 'is_active', e.target.checked)}
                                                    className='size-4'
                                                />
                                                Active
                                            </label>
                                            {hasEdits && (
                                                <Button
                                                    size='sm'
                                                    onClick={() => handleSave(tpl.intent)}
                                                    disabled={isSaving}
                                                >
                                                    {isSaving ? (
                                                        <Loader2 className='size-3 mr-1.5 animate-spin' />
                                                    ) : (
                                                        <Save className='size-3 mr-1.5' />
                                                    )}
                                                    Save
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </AdminContainer>
        </AdminLayout>
    )
}
