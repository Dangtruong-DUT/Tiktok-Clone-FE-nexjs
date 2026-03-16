"use client";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { Link } from "@/i18n/navigation";
import { MdOutlineShortcut } from "react-icons/md";
import { useTranslations } from "next-intl";

export default function UserInfo() {
    const userData = useCurrentUserData();
    const t = useTranslations("TiktokStudio.dashboard.userInfo");
    return (
        <div className="flex items-center gap-4  border rounded-lg p-5 bg-card ">
            <Link href={`/@${userData?.username}`} className=" relative">
                <Avatar className="size-12 shrink-0">
                    <AvatarImage src={userData?.avatar} alt={userData?.username} className="shrink-0 object-cover" />
                    <AvatarFallback> {userData?.name.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition">
                    <MdOutlineShortcut size={14} />
                </div>
            </Link>
            <div className="flex flex-col ">
                <p className="flex items-center gap-1">
                    <Link href={`/@${userData?.username}`}>
                        <span className="inline-block text-base font-bold truncate max-w-[400px] hover:underline">
                            {userData?.username}
                        </span>
                    </Link>

                    <span className="bg-transparent  inline-block  h-[10px] border-l border-border" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="inline-block text-sm  max-w-[250px] truncate text-muted-foreground">
                                {userData?.bio}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-[480px]">
                            <p>{userData?.bio}</p>
                        </TooltipContent>
                    </Tooltip>
                </p>
                <p className="text-sm ">
                    <span>{t("likes", { count: userData?.likes_count ?? 0 })}</span>
                    <span> · </span>
                    <span>{t("followers", { count: userData?.followers_count ?? 0 })}</span>
                    <span> · </span>
                    <span>{t("following", { count: userData?.following_count ?? 0 })}</span>
                </p>
            </div>
        </div>
    );
}
