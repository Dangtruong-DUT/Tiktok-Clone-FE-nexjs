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
        <div className="flex flex-col items-center gap-2">
            <Button
                variant="secondary"
                onClick={isAuth || !requiredAuth ? onClick : undefined}
                className={cn(
                    "text-5xl size-[1em] rounded-full flex items-center justify-center cursor-pointer",
                    "transition-all duration-200",
                    className
                )}
                size="icon"
            >
                {icon}
            </Button>
            <span className="text-xs font-bold text-center">{count ? formatCash.format(count) : label}</span>
        </div>
    );

    return isAuth || !requiredAuth ? content : <AuthModal>{content}</AuthModal>;
}
