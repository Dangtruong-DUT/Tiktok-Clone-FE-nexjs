"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

type ButtonFollowProps = {
    isFollowing: boolean;
};

export function ButtonFollow({ isFollowing }: ButtonFollowProps) {
    const [isFollow, setIsFollow] = useState(isFollowing);

    const handleFollowToggle = () => {
        setIsFollow((prev) => !prev);
    };
    return (
        <Button
            className={cn(" h-9!  rounded-xs! font-semibold! cursor-pointer text-base!", {
                "primary-button": !isFollow,
                "bg-accent text-white hover:bg-accent/90 ": isFollow,
            })}
            onClick={handleFollowToggle}
        >
            {isFollow ? "Following" : "Follow"}
        </Button>
    );
}
