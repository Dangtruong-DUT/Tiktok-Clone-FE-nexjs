import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ActionBarProps {
    className?: string;
}

function ActionBar({ className }: ActionBarProps) {
    const [liked, setLiked] = useState(false);
    const [saved, setSaved] = useState(false);
    const [following, setFollowing] = useState(false);

    const handleLike = () => setLiked(!liked);
    const handleSave = () => setSaved(!saved);
    const handleFollow = () => setFollowing(!following);

    return (
        <section className={cn("flex items-center justify-center flex-col p-[17px] flex-shrink-0", className)}>
            <div className="relative flex flex-col items-center text-[--secondary-text-cl] text-[clamp(3.2rem,3vw+1rem,4.8rem)] mb-4">
                <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                </Avatar>

                <button
                    onClick={handleFollow}
                    className={cn(
                        "text-[clamp(1.5rem,1vw+1rem,2.4rem)] absolute bottom-0 p-0 translate-y-1/2 text-white border border-transparent w-[1em] h-[1em] box-border flex justify-center items-center rounded-full outline-1",
                        following
                            ? "bg-[--background-second-color] text-[--primary-cl] outline-transparent"
                            : "bg-[--primary-cl] outline-[--primary-cl]"
                    )}
                >
                    {following ? "✓" : "+"}
                </button>
            </div>

            <div className="relative flex flex-col items-center text-[--secondary-text-cl] text-[clamp(3.2rem,3vw+1rem,4.8rem)]">
                <button
                    onClick={handleLike}
                    className={cn(
                        "mx-0 my-2 mb-1.5 p-2 rounded-full transition-colors duration-500 ease-in-out hover:bg-[--ui-action-hover] active:bg-[--ui-action-active] max-[414.98px]:text-white max-[414.98px]:bg-transparent",
                        "text-[clamp(3.2rem,3vw+1rem,3.6rem)]",
                        liked && "text-[--primary-cl] animate-[scaleHeart_0.4s_ease-in-out]",
                        !liked && "animate-[cancel_0.6s_ease-in-out]"
                    )}
                >
                    {liked ? "❤️" : "🤍"}
                </button>
                <strong className="text-[--primary-text-cl] text-xs leading-[1.334] font-bold text-center">
                    {"likes"}
                </strong>
            </div>

            <div className="relative flex flex-col items-center text-[--secondary-text-cl] text-[clamp(3.2rem,3vw+1rem,4.8rem)]">
                <button
                    onClick={() => {}}
                    className="mx-0 my-2 mb-1.5 p-2 rounded-full transition-colors duration-500 ease-in-out hover:bg-[--ui-action-hover] active:bg-[--ui-action-active] max-[414.98px]:text-white max-[414.98px]:bg-transparent text-[clamp(3.2rem,3vw+1rem,3.6rem)]"
                >
                    💬
                </button>
                <strong className="text-[--primary-text-cl] text-xs leading-[1.334] font-bold text-center">
                    {"comments"}
                </strong>
            </div>

            <div className="relative flex flex-col items-center text-[--secondary-text-cl] text-[clamp(3.2rem,3vw+1rem,4.8rem)]">
                <button
                    onClick={handleSave}
                    className={cn(
                        "mx-0 my-2 mb-1.5 p-2 rounded-full transition-colors duration-500 ease-in-out hover:bg-[--ui-action-hover] active:bg-[--ui-action-active] max-[414.98px]:text-white max-[414.98px]:bg-transparent",
                        "text-[clamp(3.2rem,3vw+1rem,3.6rem)]",
                        saved && "text-[--yellow-color] origin-top animate-[scaleSave_0.4s_ease]",
                        !saved && "animate-[cancel_0.6s_ease-in-out]"
                    )}
                >
                    {saved ? "⭐" : "☆"}
                </button>
                <strong className="text-[--primary-text-cl] text-xs leading-[1.334] font-bold text-center">
                    {"save"}
                </strong>
            </div>

            <div className="relative flex flex-col items-center text-[--secondary-text-cl] text-[clamp(3.2rem,3vw+1rem,4.8rem)]">
                <button
                    onClick={() => {}}
                    className="mx-0 my-2 mb-1.5 p-2 rounded-full transition-colors duration-500 ease-in-out hover:bg-[--ui-action-hover] active:bg-[--ui-action-active] max-[414.98px]:text-white max-[414.98px]:bg-transparent text-[clamp(3.2rem,3vw+1rem,3.6rem)]"
                >
                    📤
                </button>
                <strong className="text-[--primary-text-cl] text-xs leading-[1.334] font-bold text-center">
                    {"share"}
                </strong>
            </div>
        </section>
    );
}

export default ActionBar;
