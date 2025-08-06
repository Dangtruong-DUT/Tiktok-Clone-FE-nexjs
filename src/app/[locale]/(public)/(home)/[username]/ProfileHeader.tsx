import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Settings, Share, CheckCircle, Edit3 } from "lucide-react";

interface ProfileHeaderProps {
    nickname: string;
    name: string;
    bio?: string;
    avatar: string;
    following: number;
    followers: number;
    likes: number;
    tick?: boolean;
}

function ProfileHeader({ nickname, name, bio, avatar, following, followers, likes, tick }: ProfileHeaderProps) {
    return (
        <div className="w-full flex flex-row items-center gap-7 lg:gap-7 max-lg:flex-col max-lg:gap-5">
            <Avatar className="w-53 h-53 max-md:w-24 max-md:h-24">
                <AvatarImage src={avatar} alt={nickname} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold">{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="w-full flex flex-col items-start gap-4 max-lg:items-center">
                <div className="flex items-center">
                    <h1 className="font-bold text-2xl leading-5 mr-3 overflow-hidden text-ellipsis text-left break-words">
                        {name}
                    </h1>
                    {tick && <CheckCircle size={16} className="mr-3 text-blue-500" />}
                    <h2 className="font-semibold text-lg leading-6 text-ellipsis h-6 overflow-hidden max-w-96 whitespace-nowrap flex items-end">
                        {nickname}
                    </h2>
                </div>

                <div className="flex items-center">
                    <Button
                        variant="default"
                        className="h-10 min-w-27 rounded-md text-base leading-5 font-semibold transition-colors duration-200 max-md:min-w-10"
                    >
                        <span className="flex justify-center items-center mr-1 max-lg:flex max-md:mr-0">
                            <Edit3 size={19} />
                        </span>
                        <span className="max-md:hidden">Edit Profile</span>
                    </Button>

                    <Button
                        variant="secondary"
                        className="h-10 min-w-27 rounded-md text-base leading-5 font-semibold ml-3 bg-gray-100 text-gray-900 border-none px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors max-md:min-w-10"
                    >
                        <span className="flex justify-center items-center mr-1 max-lg:flex max-md:mr-0">
                            <Settings size={19} />
                        </span>
                        <span className="max-md:hidden">Settings</span>
                    </Button>

                    <Button
                        variant="secondary"
                        className="h-10 min-w-10 rounded-md text-base leading-5 font-semibold ml-3 bg-gray-100 text-gray-900 border-none px-4 py-2 cursor-pointer hover:bg-gray-200 transition-colors"
                    >
                        <Share size={19} />
                    </Button>
                </div>

                <div className="flex items-center">
                    <div className="flex gap-5">
                        <div>
                            <strong className="font-bold text-gray-900 text-lg leading-6">{following}</strong>
                            <span className="text-gray-900 font-normal text-base leading-5 inline-block ml-1.5 cursor-pointer hover:underline">
                                Following
                            </span>
                        </div>
                        <div>
                            <strong className="font-bold text-gray-900 text-lg leading-6">{followers}</strong>
                            <span className="text-gray-900 font-normal text-base leading-5 inline-block ml-1.5 cursor-pointer hover:underline">
                                Followers
                            </span>
                        </div>
                        <div>
                            <strong className="font-bold text-gray-900 text-lg leading-6">{likes}</strong>
                            <span className="text-gray-900 font-normal text-base leading-5 inline-block ml-1.5 cursor-pointer hover:underline">
                                Likes
                            </span>
                        </div>
                    </div>
                </div>

                {bio && (
                    <div className="flex items-center">
                        <p className="text-left text-gray-900 font-normal text-base leading-5 whitespace-pre-line max-w-96 max-lg:text-center">
                            {bio}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfileHeader;
