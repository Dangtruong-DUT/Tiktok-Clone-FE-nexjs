'use client'

import VideoDetailDialog from '@/components/video-dialog'
import { useGetPostDetailQuery } from '@/store/services/content/posts.service'

interface ModalVideoDetailProps {
    isVisible: boolean
    handleClose: () => void
    id: string
}
export default function ModalVideoDetail({ isVisible, handleClose, id }: ModalVideoDetailProps) {
    const { data, isLoading } = useGetPostDetailQuery(id)
    const post = data?.data
    if (!isVisible) return null
    return (
        <VideoDetailDialog isVisible={isVisible} handleClose={handleClose} post={post} key={id} isLoading={isLoading} />
    )
}
