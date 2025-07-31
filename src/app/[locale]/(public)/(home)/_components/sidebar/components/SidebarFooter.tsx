import { Button } from "@/components/ui/button";
import LINKS_FOR_COMPANY from "@/constants/Links/Company";
import LINKS_FOR_PROGRAM from "@/constants/Links/Program";
import LINKS_FOR_TERM_POLICY from "@/constants/Links/Term&Policy";
import { LinkItem } from "@/constants/Links/types";
import { useState } from "react";

export interface LinkCategory {
    title: string;
    items: LinkItem[];
}

export default function SidebarFooter() {
    return (
        <footer className="px-2 pt-2 pb-[75px]">
            <div className="mt-5">
                <ListLink title={"Company"} items={LINKS_FOR_COMPANY} />
                <ListLink title={"Program"} items={LINKS_FOR_PROGRAM} />
                <ListLink title={"Terms & Policies"} items={LINKS_FOR_TERM_POLICY} />
            </div>

            <div className="mt-6 pt-4">
                <p className="text-xs text-muted-foreground leading-relaxed">© 2025 TikTok.</p>
            </div>
        </footer>
    );
}

interface ListLinkProps {
    title: string;
    items?: LinkItem[];
}

function ListLink({ title, items = [] }: ListLinkProps) {
    const [isDisplayLinks, setDisplayLinks] = useState<boolean>(false);

    const handleDisplayListLink = () => {
        setDisplayLinks((prev) => !prev);
    };

    return (
        <div className="bg-background">
            <h4
                className={`
          mt-[15px] text-[15px] leading-[1.46] cursor-pointer font-Tiktok-Display font-bold
          ${isDisplayLinks ? "text-foreground" : "text-muted-foreground"}
        `}
                onClick={handleDisplayListLink}
            >
                {title}
            </h4>

            <div className={`${isDisplayLinks ? "block" : "hidden"}`}>
                {items.map((item) => (
                    <span key={item.id}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="p-0 inline-block min-w-fit mr-0.5 mt-1.5 h-auto"
                            asChild
                        >
                            <a href={item.href}>
                                <span className="text-muted-foreground font-semibold text-xs leading-[1.3] hover:underline">
                                    {item.name}
                                </span>
                            </a>
                        </Button>
                    </span>
                ))}
            </div>
        </div>
    );
}
