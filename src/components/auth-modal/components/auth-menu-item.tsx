import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

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
            <Link href={item.href}>
                <Button className={buttonClassName} variant="outline">
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
