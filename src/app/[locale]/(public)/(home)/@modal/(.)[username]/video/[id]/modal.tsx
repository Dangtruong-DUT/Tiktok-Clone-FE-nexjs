"use client";

import VideoDetailDialog from "@/components/video-dialog";
import { useGetPostDetailQuery } from "@/services/RTK/posts.services";

interface ModalVideoDetailProps {
    isVisible: boolean;
    handleClose: () => void;
    id: string;
}
export default function ModalVideoDetail({ isVisible, handleClose, id }: ModalVideoDetailProps) {
    const { data } = useGetPostDetailQuery(id);
    const post = data?.data;
    if (!isVisible) return null;
    return <VideoDetailDialog isVisible={isVisible} handleClose={handleClose} post={post} />;
}
