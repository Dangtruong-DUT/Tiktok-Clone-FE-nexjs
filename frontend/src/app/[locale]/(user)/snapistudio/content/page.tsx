import ContentTabs from '@/app/[locale]/(user)/snapistudio/content/_components/content-tabs'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Content Manager',
    description: 'Manage and analyze all your TikTok videos in one place'
}

export default function ContentPage() {
    return <ContentTabs />
}
