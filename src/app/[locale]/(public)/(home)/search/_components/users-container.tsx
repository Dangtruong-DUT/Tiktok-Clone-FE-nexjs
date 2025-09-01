"use client";

import { UserType } from "@/types/schemas/User.schema";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MdVerified } from "react-icons/md";
import { UserVerifyStatus } from "@/constants/enum";
import LoadingIcon from "@/components/lottie-icons/loading";
import { useEffect, useRef, useState } from "react";
import { useInViewport } from "@/hooks/ui/useInViewport";
import AccountItemSkeleton from "@/app/[locale]/(public)/(home)/search/_components/account-item-skeleton";
import { useTranslations } from "next-intl";

interface UsersContainerProps {
    fetchNextPage: () => void;
    hasNextPage: boolean;
    data: UserType[];
    isFetching: boolean;
    isLoading: boolean;
}

export default function UsersContainer({
    fetchNextPage,
    hasNextPage,
    data,
    isFetching,
    isLoading,
}: UsersContainerProps) {
    const t = useTranslations("HomePage.search.userList");
    const sentinelForUserResultScrollRef = useRef<HTMLDivElement>(null);
    const isInViewport = useInViewport(sentinelForUserResultScrollRef);
    const [isShowSkeleton, setShowSkeleton] = useState(isLoading);

    useEffect(() => {
        if (hasNextPage && isInViewport) {
            fetchNextPage();
        }
    }, [hasNextPage, isInViewport, fetchNextPage]);

    useEffect(() => {
        if (!isLoading) {
            const timeout = setTimeout(() => setShowSkeleton(false), 300);
            return () => clearTimeout(timeout);
        } else {
            setShowSkeleton(true);
        }
    }, [isLoading]);

    if (isShowSkeleton) {
        return (
            <div className="flex flex-col overflow-y-auto scrollbar-hidden mt-2">
                {Array.from({ length: 3 }).map((_, index) => (
                    <AccountItemSkeleton key={index} />
                ))}
            </div>
        );
    }

    return (
        <ul className="flex flex-col overflow-y-auto scrollbar-hidden mt-2">
            {data.map((user) => (
                <li key={user._id}>
                    <Link href={`/@${user.username}`} className="inline-block w-full">
                        <Button
                            variant={"ghost"}
                            className="space-x-2 w-full justify-start py-[9px] min-h-[97px] rounded-none!"
                        >
                            <Avatar className="size-15">
                                <AvatarImage src={user.avatar} />
                                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col items-start text-left overflow-hidden ">
                                <div className="flex items-center gap-2">
                                    <span className="font-semibold text-lg truncate max-w-[177px] ">
                                        {user.username}
                                    </span>
                                    {user.verify === UserVerifyStatus.VERIFIED && (
                                        <MdVerified size={14} className="text-blue-500" />
                                    )}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground ">
                                    <span className="  truncate max-w-[177px]">{user.name}</span>
                                    <span>·</span>
                                    <span>{t("followers", { count: user.followers_count })}</span>
                                </div>
                            </div>
                        </Button>
                    </Link>
                </li>
            ))}

            {/* Sentinel để lắng nghe*/}
            <div className="h-px bg-transparent" ref={sentinelForUserResultScrollRef} />
            {isFetching && (
                <div className="px-4 py-2">
                    <LoadingIcon className="size-15 mx-auto" loop />
                </div>
            )}
        </ul>
    );
}
