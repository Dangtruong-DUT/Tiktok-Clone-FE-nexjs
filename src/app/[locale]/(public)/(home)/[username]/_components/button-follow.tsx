import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ButtonFollowProps {
    isFollowed: boolean;
    onToggleFollow: () => void;
    className?: string;
    isAuth: boolean;
}

export default function ButtonFollow({ isFollowed, onToggleFollow, className, isAuth }: ButtonFollowProps) {
    const content = (
        <Button
            variant={isFollowed ? "outline" : "default"}
            className={cn("cursor-pointer px-8!", {
                "primary-button h-10! rounded-md! text-base! font-medium!": !isFollowed,
                "h-10 font-medium rounded-md text-base ": isFollowed,
                className,
            })}
            onClick={onToggleFollow}
        >
            {isFollowed ? "Following" : "Follow"}
        </Button>
    );

    return isAuth ? (
        content
    ) : (
        <AuthModal>
            <div className="relative">
                <button className="absolute inset-0 cursor-pointer" />
                {content}
            </div>
        </AuthModal>
    );
}
