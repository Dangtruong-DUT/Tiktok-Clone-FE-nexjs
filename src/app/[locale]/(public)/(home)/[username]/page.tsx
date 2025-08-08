import ProfileUser from "@/app/[locale]/(public)/(home)/[username]/_components/profile-user";
import VideoContainer from "@/app/[locale]/(public)/(home)/[username]/_components/video-container";
import { mockUser } from "@/mock/mockUserAndVideos";
export default async function Profile({ params }: { params: Promise<{ username: string }> }) {
    const { username } = await params;

    return (
        <div className="w-full  px-6 py-8">
            <ProfileUser userData={mockUser} className="mb-5" />
            <VideoContainer />
        </div>
    );
}
