import { AiCopilotProvider } from '@/components/ai-copilot/AiCopilotContext'
import { StudioShell } from './_components/studio-shell'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: {
        template: '%s | TikTok Studio',
        default: 'TikTok Studio'
    },
    description: 'Manage your TikTok content, analyze performance, and grow your audience',
    robots: {
        index: false,
        follow: false
    }
}

export default function StudioLayout({ children }: { children: React.ReactNode }) {
    return (
        <AiCopilotProvider>
            <StudioShell>{children}</StudioShell>
        </AiCopilotProvider>
    )
}
