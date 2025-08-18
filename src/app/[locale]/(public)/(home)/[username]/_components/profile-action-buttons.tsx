"use client";
import { Settings, Share, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { useGetUserByUsernameQuery } from "@/services/RTK/user.services";
import { useCallback } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useFollowUser } from "@/hooks/data/useUser";

interface ProfileActionButtonsProps {
    username: string;
    userId: string;
}

export default function ProfileActionButtons({ userId, username }: ProfileActionButtonsProps) {
    const currentUser = useCurrentUserData();
    const isCurrentUser = currentUser?._id === userId;
    const { data: userProfileRes } = useGetUserByUsernameQuery(username, { skip: isCurrentUser });
    const { isFollowedState, onToggleFollow } = useFollowUser({
        userId,
        initialFollowState: userProfileRes?.data.is_followed ?? false,
    });

    const handleMessage = useCallback(() => {
        toast.info("Message feature coming soon!");
    }, []);

    if (isCurrentUser) {
        return (
            <div className="flex items-center">
                <Button
                    variant="default"
                    className="primary-button h-10! rounded-md! text-base! font-medium! cursor-pointer "
                >
                    <span className="flex justify-center items-center mr-1 max-lg:flex max-md:mr-0">
                        <Edit3 size={19} />
                    </span>
                    <span className="max-md:hidden">Edit Profile</span>
                </Button>

                <Button variant="outline" className="ml-2 h-10 font-medium rounded-md text-base cursor-pointer">
                    <span className="flex justify-center  items-center mr-1 max-lg:flex max-md:mr-0">
                        <Settings size={19} />
                    </span>
                    <span className="max-md:hidden">Settings</span>
                </Button>

                <Button variant="outline" className="ml-2  h-10 font-medium rounded-md text-base">
                    <Share size={19} />
                </Button>
            </div>
        );
    } else {
        return (
            <div className="flex items-center">
                <Button
                    variant={isFollowedState ? "outline" : "default"}
                    className={cn("cursor-pointer px-8!", {
                        "primary-button h-10! rounded-md! text-base! font-medium!": !isFollowedState,
                        "h-10 font-medium rounded-md text-base ": isFollowedState,
                    })}
                    onClick={onToggleFollow}
                >
                    {isFollowedState ? "Following" : "Follow"}
                </Button>

                <Button
                    variant="outline"
                    className="ml-2 h-10 font-medium rounded-md text-base cursor-pointer"
                    onClick={handleMessage}
                >
                    Message
                </Button>

                <Button variant="outline" className="ml-2 h-10 font-medium rounded-md text-base">
                    <Share size={19} />
                </Button>
            </div>
        );
    }
}
