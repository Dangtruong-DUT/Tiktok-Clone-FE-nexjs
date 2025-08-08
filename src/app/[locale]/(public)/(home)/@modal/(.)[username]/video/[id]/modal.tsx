import { mockUser, mockVideoPost } from "@/mock/mockUserAndVideos";
import VideoDetailDialog from "@/components/video-dialog";

interface ModalVideoDetailProps {
    isVisible: boolean;
    handleClose: () => void;
    id: string;
}
export default function ModalVideoDetail({ isVisible, handleClose, id }: ModalVideoDetailProps) {
    return <VideoDetailDialog isVisible={isVisible} handleClose={handleClose} author={mockUser} post={mockVideoPost} />;
}
