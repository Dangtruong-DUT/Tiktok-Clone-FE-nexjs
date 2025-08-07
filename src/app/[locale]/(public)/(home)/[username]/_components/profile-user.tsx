import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { UserVerifyStatus } from "@/constants/enum";
import { cn } from "@/lib/utils";
import { UserType } from "@/types/schemas/User.schema";
import { Settings, Share, CheckCircle, Edit3 } from "lucide-react";

interface ProfileUserProps {
    userData: UserType;
    className?: string;
}

function ProfileUser({ userData, className }: ProfileUserProps) {
    const { username, name, bio, avatar, isOwner, is_followed, verify, followers_count, following_count, likes_count } =
        userData;
    return (
        <div className={cn("w-full flex flex-row items-center gap-7 lg:gap-7 max-lg:flex-col max-lg:gap-5", className)}>
            <Avatar className="w-53 h-53 max-md:w-24 max-md:h-24">
                <AvatarImage src={avatar} alt={username} className="object-cover" />
                <AvatarFallback className="text-2xl font-bold">{name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="w-full flex flex-col items-start gap-4 max-lg:items-center">
                <div className="flex items-center">
                    <h1 className="font-bold text-2xl leading-5 mr-3 overflow-hidden text-ellipsis text-left break-words">
                        {name}
                    </h1>
                    {verify === UserVerifyStatus.VERIFIED && <CheckCircle size={16} className="mr-3 text-blue-500" />}
                    <h2 className="font-semibold text-lg leading-6 text-ellipsis h-6 overflow-hidden max-w-96 whitespace-nowrap flex items-end">
                        {username}
                    </h2>
                </div>

                <div className="flex items-center">
                    <Button variant="default" className="primary-button h-10! rounded-md! text-base! font-medium! ">
                        <span className="flex justify-center items-center mr-1 max-lg:flex max-md:mr-0">
                            <Edit3 size={19} />
                        </span>
                        <span className="max-md:hidden">Edit Profile</span>
                    </Button>

                    <Button variant="outline" className="ml-2 h-10 font-medium rounded-md text-base">
                        <span className="flex justify-center  items-center mr-1 max-lg:flex max-md:mr-0">
                            <Settings size={19} />
                        </span>
                        <span className="max-md:hidden">Settings</span>
                    </Button>

                    <Button variant="outline" className="ml-2  h-10 font-medium rounded-md text-base">
                        <Share size={19} />
                    </Button>
                </div>

                <div className="flex items-center">
                    <div className="flex gap-5">
                        <div className="cursor-pointer">
                            <strong className="font-bold text-lg leading-6">{following_count}</strong>
                            <span className="text-muted-foreground font-normal text-base leading-5 inline-block ml-1.5 cursor-pointer hover:underline">
                                Following
                            </span>
                        </div>
                        <div className="cursor-pointer">
                            <strong className="font-bold  text-lg leading-6">{followers_count}</strong>
                            <span className="text-muted-foreground font-normal text-base leading-5 inline-block ml-1.5 cursor-pointer hover:underline">
                                Followers
                            </span>
                        </div>
                        <div className=" cursor-pointer">
                            <strong className="font-bold  text-lg leading-6">{likes_count}</strong>
                            <span className="text-muted-foreground font-normal text-base leading-5 inline-block ml-1.5 cursor-pointer hover:underline">
                                Likes
                            </span>
                        </div>
                    </div>
                </div>

                {bio && (
                    <div className="flex items-center">
                        <p className="text-left text-muted-foreground font-normal text-base leading-5 whitespace-pre-line max-w-96 max-lg:text-center">
                            {bio}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ProfileUser;
