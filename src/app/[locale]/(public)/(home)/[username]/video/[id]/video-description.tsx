"'use client';";
import ShowMore from "@/components/show-more";
import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { useFollowUser } from "@/hooks/data/useUser";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { useGetUserByUsernameQuery } from "@/services/RTK/user.services";
import { UserType } from "@/types/schemas/User.schema";
import { timeAgo } from "@/utils/formatting/formatTime";
import { useLocale } from "next-intl";

type VideoDescriptionProps = {
    author: UserType;
    createdAt: string;
    postContent: string;
    className?: string;
};

export default function VideoDescription({ author, createdAt, postContent, className }: VideoDescriptionProps) {
    const locale = useLocale();
    const currentUser = useCurrentUserData();
    const isCurrentUser = currentUser?._id === author._id;
    const { data: userProfileRes } = useGetUserByUsernameQuery(author.username, { skip: isCurrentUser });
    const { isFollowedState, onToggleFollow } = useFollowUser({
        userId: author._id,
        initialFollowState: userProfileRes?.data.is_followed ?? false,
    });
    return (
        <div className={cn("p-4", className)}>
            <div className="flex items-center pb-4">
                <Link href={`/@${author.username}`} className="flex items-center">
                    <Avatar className="w-12 h-12  mr-3">
                        <AvatarImage src={author.avatar} alt={author.name} />
                        <AvatarFallback>{author.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="mr-12">
                        <h3 className="text-lg font-semibold hover:underline">{author.name}</h3>
                        <p className="text-sm text-muted-foreground">
                            {author.bio} · {timeAgo({ locale, date: createdAt })}
                        </p>
                    </div>
                </Link>
                {!isCurrentUser && (
                    <Button
                        className={cn(" h-9!  rounded-xs! font-semibold! cursor-pointer text-base!", {
                            "primary-button": !isFollowedState,
                            "bg-accent text-white hover:bg-accent/90 ": isFollowedState,
                        })}
                        onClick={onToggleFollow}
                    >
                        {isFollowedState ? "Following" : "Follow"}
                    </Button>
                )}
            </div>
            <ShowMore text={postContent} className="text-base" maxHeight={50} />
        </div>
    );
}
