import DirectorLineChart from '@/app/[locale]/(user)/snapistudio/_components/director-line-chart'
import UserInfo from './_components/user-info'
import RecentPosts from '@/app/[locale]/(user)/snapistudio/_components/recent-posts'
import Footer from '@/app/[locale]/(user)/snapistudio/_components/footer'
import { PostStatusChart } from './_components/post-status-chart'
import { EngagementByPostChart } from './_components/engagement-by-post-chart'
import { Metadata } from 'next'
import KnowledgeForYou from './_components/knowledge-for-you'

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'View your TikTok analytics, recent posts, and performance metrics'
}

export default function DashboardPage() {
    return (
        <div>
            <div className='py-8 px-4 md:px-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500 ease-out fill-mode-forwards'>
                <UserInfo />
                <DirectorLineChart />
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <PostStatusChart />
                    <EngagementByPostChart />
                </div>
                <div className='flex gap-6 xl:flex-row flex-col'>
                    <RecentPosts classNames='flex-1' />
                    <KnowledgeForYou />
                </div>
            </div>
            <Footer />
        </div>
    )
}
