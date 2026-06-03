'use client'

import PostTableProvider from '@/app/[locale]/(user)/snapistudio/content/_context/content-table.context'
import TableContent from '@/app/[locale]/(user)/snapistudio/content/_components/table-content'

export default function ContentTabs() {
    return (
        <div className='px-4 sm:px-6 pt-4'>
            <PostTableProvider>
                <TableContent />
            </PostTableProvider>
        </div>
    )
}
