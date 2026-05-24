import { cn } from '@/lib/utils'
import { VideoDialogTab, VideoDialogTabType } from '@/constants/ui/video-dialog'

export type TabNavigationProps = {
    activeTab: VideoDialogTabType
    setActiveTab: (tab: VideoDialogTabType) => void
    className?: string
    commentCount?: number
}

export default function TabNavigation({ activeTab, setActiveTab, className, commentCount }: TabNavigationProps) {
    return (
        <div className={cn('flex border-b', className)}>
            <button
                onClick={() => setActiveTab(VideoDialogTab.COMMENTS)}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === VideoDialogTab.COMMENTS
                        ? 'border-foreground text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
                Comments ({commentCount ?? 0})
            </button>
            <button
                onClick={() => setActiveTab(VideoDialogTab.CREATOR)}
                className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === VideoDialogTab.CREATOR
                        ? 'border-foreground text-foreground'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
            >
                Creator videos
            </button>
        </div>
    )
}
