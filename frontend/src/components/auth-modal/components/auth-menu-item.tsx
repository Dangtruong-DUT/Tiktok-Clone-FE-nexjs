import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AuthMenuItemProps {
    id: string;
    title: string;
    icon: React.ReactNode;
    href?: string;
    action?: () => void;
    for: ("login" | "signup")[];
}

export interface AuthMenuItemComponentProps {
    item: AuthMenuItemProps;
}

export function AuthMenuItem({ item }: AuthMenuItemComponentProps) {
    const buttonContent = (
        <>
            <span className="absolute left-4">{item.icon}</span>
            <span className="text-center text-base">{item.title}</span>
        </>
    );

    const buttonClassName = "w-full bg-card! cursor-pointer relative h-11";

    if (item.href) {
        return (
            <Link
                href={item.href}
                className={cn({
                    " relative before:content-['Unavailable'] before:absolute before:right-4 before:-translate-y-1/2  before:bg-red-500 before:text-white before:px-2 before:py-1 before:rounded-tr-full before:rounded-tl-full before:rounded-br-full before:rounded-bl-none before:text-xs before:font-semibold before:z-10":
                        item.href === "#!",
                })}
            >
                <Button
                    className={cn(buttonClassName, {
                        "cursor-not-allowed! select-none opacity-50": item.href === "#!",
                    })}
                    variant="outline"
                >
                    {buttonContent}
                </Button>
            </Link>
        );
    }

    return (
        <Button onClick={item.action} className={buttonClassName} variant="outline">
            {buttonContent}
        </Button>
    );
}
