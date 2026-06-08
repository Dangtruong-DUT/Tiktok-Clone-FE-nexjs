import { AiCopilotProvider } from '@/components/ai-copilot/AiCopilotContext'
import { AiCopilot } from '@/components/ai-copilot/AiCopilot'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <AiCopilotProvider>
            {children}
            <AiCopilot role='admin' />
        </AiCopilotProvider>
    )
}
