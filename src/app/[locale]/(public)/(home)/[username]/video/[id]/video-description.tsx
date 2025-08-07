"'use client';";
import { ButtonFollow } from "@/app/[locale]/(public)/(home)/[username]/video/[id]/button-follow";
import ShowMore from "@/components/show-more";
import { AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { timeAgo } from "@/utils/formatting/formatTime";
import { useLocale } from "next-intl";

type VideoDescriptionProps = {
    userAvatar: string;
    userName: string;
    userBio: string;
    isFollowing: boolean;
    isOwner: boolean;
    createdAt: string;
    postContent: string;
    className?: string;
};

export default function VideoDescription({
    userAvatar,
    userName,
    userBio,
    isOwner,
    isFollowing,
    createdAt,
    postContent,
    className,
}: VideoDescriptionProps) {
    const locale = useLocale();
    return (
        <div className={cn("p-4", className)}>
            <div className="flex items-center pb-4">
                <Link href={`/@${userName}`} className="flex items-center">
                    <Avatar className="w-12 h-12  mr-3">
                        <AvatarImage src={userAvatar} alt={userName} />
                        <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>

                    <div className="mr-12">
                        <h3 className="text-lg font-semibold hover:underline">{userName}</h3>
                        <p className="text-sm text-muted-foreground">
                            {userBio} · {timeAgo({ locale, date: createdAt })}
                        </p>
                    </div>
                </Link>
                {!isOwner && <ButtonFollow isFollowing={isFollowing} />}
            </div>
            <ShowMore text={postContent} className="text-base" maxHeight={50} />
        </div>
    );
}
