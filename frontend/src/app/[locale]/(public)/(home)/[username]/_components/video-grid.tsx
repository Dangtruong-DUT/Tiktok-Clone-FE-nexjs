'use client'

import { useVideosContext } from '@/app/[locale]/(public)/(home)/[username]/_context/videos.context'
import CardVideoItem from '@/components/card-video-item'
import { useAppDispatch } from '@/store/hooks'
import { useInViewport } from '@/hooks/ui/useInViewport'
import { Link, usePathname } from '@/i18n/navigation'
import { setOpenModal } from '@/store/features/modalSlide'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import LoadingIcon from '@/components/lottie-icons/loading'
import { CiGrid41 } from 'react-icons/ci'
import { Skeleton } from '@/components/ui/skeleton'
import { useTranslations } from 'next-intl'

function VideoGrid() {
    const [showSkeleton, setShowSkeleton] = useState<boolean>(true)
    const { postList, hasNextPage, fetchNextPage, isFetching, isLoading, activeTabId, isPrivate } = useVideosContext()
    const dispatch = useAppDispatch()
    const pathname = usePathname()
    const pathnameRef = useRef(pathname)

    const t = useTranslations('ProfilePage.noContent')

    const emptyStateKey = useMemo(() => {
        if (activeTabId === 'favorites') return 'favorites'
        if (activeTabId === 'liked') return 'liked'
        return 'videos'
    }, [activeTabId])

    const handleVideoClick = useCallback(() => {
        dispatch(setOpenModal({ prevPathname: pathnameRef.current, type: 'modalVideoDetail' }))
    }, [dispatch, pathnameRef])

    const sentinelScrollRef = useRef<HTMLDivElement>(null)
    const isInView = useInViewport(sentinelScrollRef)

    useEffect(() => {
        if (isInView && hasNextPage) {
            fetchNextPage()
        }
    }, [isInView, fetchNextPage, hasNextPage])

    useEffect(() => {
        if (!isLoading) {
            const timeout = setTimeout(() => setShowSkeleton(false), 200)
            return () => clearTimeout(timeout)
        } else {
            setShowSkeleton(true)
        }
    }, [isLoading])

    return (
        <div className='mt-6 w-full'>
            {postList.length > 0 && (
                <div className='grid gap-6 gap-x-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))] w-full  md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]'>
                    {postList.map((video) => {
                        const videoLink = `/@${video.author.username}/video/${video.uuid}`
                        return (
                            <Link key={video.uuid} href={videoLink} className='w-full' onClick={handleVideoClick}>
                                <CardVideoItem post={video} isDescriptionVisible={false} />
                            </Link>
                        )
                    })}
                    <div className='h-px bg-transparent col-span-full' ref={sentinelScrollRef} />
                    {isFetching && (
                        <div className='pt-4 col-span-full '>
                            <LoadingIcon className='size-15 mx-auto' loop />
                        </div>
                    )}
                </div>
            )}
            {postList.length === 0 && !showSkeleton && (
                <div className='mx-auto flex flex-col justify-center items-center min-h-[490px]'>
                    <div className='flex justify-center items-center size-[92px] rounded-full bg-muted'>
                        <CiGrid41 size={44} />
                    </div>
                    <p className='text-2xl font-bold mt-6'>
                        {isPrivate ? t('private.title') : t(`${emptyStateKey}.title`)}
                    </p>
                    <p className='text-base mt-2 text-muted-foreground'>
                        {isPrivate ? t('private.description') : t(`${emptyStateKey}.description`)}
                    </p>
                </div>
            )}
            {postList.length === 0 && showSkeleton && (
                <div className='grid gap-6 gap-x-4 grid-cols-[repeat(auto-fill,minmax(240px,1fr))] w-full  md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))]'>
                    {Array.from({ length: 12 }, (_, index) => (
                        <Skeleton
                            key={index}
                            className=' inline-block w-full pt-[133.333%] overflow-hidden rounded-md'
                        />
                    ))}
                </div>
            )}
        </div>
    )
}

export default VideoGrid
