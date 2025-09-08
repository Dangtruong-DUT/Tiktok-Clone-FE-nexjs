"use client";

import VideoDetailDialog from "@/components/video-dialog";
import { useGetPostDetailQuery } from "@/services/RTK/posts.services";

interface ModalVideoDetailProps {
    isVisible: boolean;
    handleClose: () => void;
    id: string;
}
export default function ModalVideoDetail({ isVisible, handleClose, id }: ModalVideoDetailProps) {
    const { data, isLoading } = useGetPostDetailQuery(id);
    const post = data?.data;
    if (!isVisible || (post?._id && post?._id !== id)) return null;
    return <VideoDetailDialog isVisible={isVisible} handleClose={handleClose} post={post} isLoading={isLoading} />;
}
