'use client'

import { useState } from 'react'
import { AdminLayout, AdminContainer } from '@/components/admin'
import { ADMIN_ROUTES } from '@/constants/routes/routes'
import { useUpdateFeatureFlagsMutation } from '@/store/services/admin/admin-ai-copilot.service'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const FLAG_DEFINITIONS = [
    { key: 'streaming',        label: 'Streaming Responses', description: 'Enable SSE token streaming for real-time AI responses' },
    { key: 'frame_analysis',   label: 'Frame Analysis',      description: 'Allow users to capture and send video frames to the AI' },
    { key: 'timeline_context', label: 'Timeline Context',    description: 'Allow users to select a video segment as context' },
    { key: 'viral_analysis',   label: 'Viral Analysis',      description: 'Enable viral potential analysis intent' },
]

export default function FeatureFlagsPage() {
    const [updateFlags, { isLoading }] = useUpdateFeatureFlagsMutation()
    const [flags, setFlags] = useState<Record<string, boolean>>({
        streaming:        true,
        frame_analysis:   true,
        timeline_context: true,
        viral_analysis:   true,
    })

    const toggle = (key: string) => {
        setFlags((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    const save = async () => {
        try {
            await updateFlags({ flags }).unwrap()
            toast.success('Feature flags updated')
        } catch {
            toast.error('Failed to update feature flags')
        }
    }

    return (
        <AdminLayout
            title='AI Copilot Feature Flags'
            description='Enable or disable AI Copilot features without redeploying'
            breadcrumbs={[
                { label: 'Admin', href: ADMIN_ROUTES.DASHBOARD },
                { label: 'AI Studio', href: '/admin/ai-studio' },
                { label: 'Feature Flags', href: '#' },
            ]}
        >
            <AdminContainer>
                <div className='space-y-3 max-w-lg'>
                    {FLAG_DEFINITIONS.map((flag) => (
                        <div
                            key={flag.key}
                            className='flex items-start justify-between rounded-xl border bg-card px-4 py-3'
                        >
                            <div className='space-y-0.5'>
                                <p className='text-sm font-medium'>{flag.label}</p>
                                <p className='text-xs text-muted-foreground'>{flag.description}</p>
                            </div>
                            <Switch
                                checked={flags[flag.key] ?? true}
                                onCheckedChange={() => toggle(flag.key)}
                            />
                        </div>
                    ))}

                    <Button onClick={save} disabled={isLoading} className='w-full mt-4'>
                        {isLoading && <Loader2 className='size-4 mr-2 animate-spin' />}
                        Save Changes
                    </Button>
                </div>
            </AdminContainer>
        </AdminLayout>
    )
}
