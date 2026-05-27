import DirectorLineChart from '@/app/[locale]/(user)/snapistudio/_components/director-line-chart'
import UserInfo from './_components/user-info'
import RecentPosts from '@/app/[locale]/(user)/snapistudio/_components/recent-posts'
import Footer from '@/app/[locale]/(user)/snapistudio/_components/footer'
import { Metadata } from 'next'
import KnowledgeForYou from './_components/knowledge-for-you'

export const metadata: Metadata = {
    title: 'Dashboard',
    description: 'View your TikTok analytics, recent posts, and performance metrics'
}

export default function DashboardPage() {
    return (
        <div>
            <div className='py-8 px-4 md:px-8 space-y-8'>
                <UserInfo />
                <DirectorLineChart />
                <div className='flex gap-6 xl:flex-row flex-col'>
                    <RecentPosts classNames='flex-1' />
                    <KnowledgeForYou />
                </div>
            </div>
            <Footer />
        </div>
    )
}
