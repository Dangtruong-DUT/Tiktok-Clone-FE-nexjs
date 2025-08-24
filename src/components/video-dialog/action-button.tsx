import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatCash } from "@/utils/formatting/formatNumber";

interface ActionButtonProps {
    icon: React.ReactNode;
    count: number | null;
    isAuth?: boolean;
    requiredAuth?: boolean;
    label: string;
    onClick?: () => void;
    className?: string;
}
export default function ActionButton({
    icon,
    count,
    label,
    onClick,
    className,
    isAuth = false,
    requiredAuth = false,
}: ActionButtonProps) {
    const content = (
        <div className="flex items-center gap-1">
            <Button
                variant="ghost"
                onClick={isAuth || !requiredAuth ? onClick : undefined}
                className={cn(
                    "text-5xl size-8 rounded-full flex items-center justify-center cursor-pointer ",
                    "transition-all duration-200",
                    " [&>svg]:size-5! ",
                    className
                )}
                size="icon"
            >
                {icon}
            </Button>
            <span className="text-sm font-semibold">{count ? formatCash.format(count) : label}</span>
        </div>
    );

    return isAuth || !requiredAuth ? content : <AuthModal>{content}</AuthModal>;
}
