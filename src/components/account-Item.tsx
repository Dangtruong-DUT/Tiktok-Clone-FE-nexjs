import { BadgeCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

export interface AccountItemProps {
    className?: string;
    key?: string | number;
    avatar_url: string;
    username: string;
    name: string;
    verified?: boolean;
}

export default function AccountItem({
    className = "",
    avatar_url,
    username,
    name,
    verified = false,
}: AccountItemProps) {
    return (
        <div
            className={cn("transition-colors duration-200 ease-in-out p-2 rounded hover:bg-accent group", {
                className,
            })}
        >
            <div className="flex items-center space-x-3">
                <div className="relative">
                    <Avatar className="shrink-0">
                        <AvatarImage src={avatar_url} className="shrink-0 object-cover" />
                        <AvatarFallback>{name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                        <h4 className="text-sm font-semibold text-foreground truncate">{username}</h4>
                        {verified && <BadgeCheck className="w-3 h-3 text-blue-500" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{name}</p>
                </div>
            </div>
        </div>
    );
}
