import { HOME_MENU_ITEMS } from "@/app/[locale]/(public)/(home)/_components/sidebar/constants/menu-items-config";
import useSidebar from "@/app/[locale]/(public)/(home)/_components/sidebar/context/sidebar.context";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function NavItems() {
    const { isOpenDrawer } = useSidebar();
    const pathname = usePathname();
    return (
        <nav className="flex flex-col gap-[0.25rem] ">
            {HOME_MENU_ITEMS.map((item, index) => {
                const isActive =
                    (pathname.includes(item.to) && pathname !== "/en" && pathname !== "/vi") || item.to == "/";
                const IconComponent = isActive && item.ActiveIcon ? item.ActiveIcon : item.Icon;

                return (
                    <Link
                        key={index}
                        className={cn(
                            "flex items-center h-12 px-2 gap-3 rounded-lg transition-all duration-200 hover:bg-accent"
                        )}
                        href={item.to}
                    >
                        <IconComponent
                            size={24}
                            className={cn(
                                "transition-colors duration-200",
                                isActive ? "text-brand" : "text-muted-foreground"
                            )}
                        />
                        {!isOpenDrawer && (
                            <span className={cn("text-base font-medium transition-colors duration-200")}>
                                {item.title}
                            </span>
                        )}
                    </Link>
                );
            })}
        </nav>
    );
}
