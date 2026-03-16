import { Button } from "@/components/ui/button";
import AccountItem from "@/components/account-Item";

export interface SuggestedAccountsProps {
    title: string;
    className?: string;
}

export default function SuggestedAccounts({ title }: SuggestedAccountsProps) {
    // Mock data for accounts
    const mockAccounts = [
        {
            id: "1",
            avatar: "https://ttl.edu.vn/public/upload/2024/12/gai-xinh-cam-hoa-02.webp",
            username: "John Doe",
            nameAccount: "John Doe",
            verified: true,
            isLive: true,
        },
        {
            id: "2",
            avatar: "https://ttl.edu.vn/public/upload/2024/12/gai-xinh-cam-hoa-02.webp",
            username: "Jane Smith",
            nameAccount: "Jane Smith",
            verified: true,
            isLive: false,
        },
    ];

    return (
        <div
            className="
            relative w-full py-4
            before:content-[''] before:block before:absolute before:top-0 before:left-2 before:right-2 before:border-t-[0.5px] before:border-border before:pointer-events-none
            "
        >
            {/* Title */}
            <p
                className="
        px-2 mb-2 font-semibold text-sm text-muted-foreground
        md:block hidden
        "
            >
                {title}
            </p>

            {/* Accounts List */}
            <ul>
                {mockAccounts.map((account) => (
                    <li key={account.id}>
                        <AccountItem
                            className="
                transition-colors duration-200 ease-in-out p-2 rounded-[4px] hover:bg-accent
                md:block
                max-md:w-[55px] max-md:pl-[13px]
                max-md:[&_h4]:hidden max-md:[&_p]:hidden"
                            avatar_url={account.avatar}
                            username={account.username}
                            name={account.nameAccount}
                            verified={account.verified}
                        />
                    </li>
                ))}
            </ul>

            {/* See More Button */}
            <Button
                variant="ghost"
                size="sm"
                className="mt-2 ml-2 text-primary font-semibold text-sm h-auto p-0hover:underline hover:bg-transparent md:block hidden
        "
            >
                See more
            </Button>
        </div>
    );
}
