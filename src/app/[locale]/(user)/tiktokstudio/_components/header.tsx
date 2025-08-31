"use client";

import { ModeToggle } from "@/components/dark-mode-toggle";
import SelectLanguage from "@/components/select-language";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLogout } from "@/hooks/data/useAuth";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { Link } from "@/i18n/navigation";
import { Loader, LogOut, User } from "lucide-react";

export default function Header() {
    const currentUser = useCurrentUserData();
    const { handleLogout, logoutResult } = useLogout();

    return (
        <header className=" flex h-17 items-center justify-between border-b bg-background px-8">
            <div className="ml-auto flex items-center gap-4">
                <SelectLanguage />
                <ModeToggle />
                <Popover>
                    <PopoverTrigger>
                        <Avatar className="cursor-pointer size-9 shrink-0">
                            <AvatarImage src={currentUser?.avatar} alt={currentUser?.username} />
                            <AvatarFallback>{currentUser?.name.charAt(0).toUpperCase() || "US"}</AvatarFallback>
                        </Avatar>
                    </PopoverTrigger>
                    <PopoverContent className="w-48 p-2!" align="end">
                        <div className="flex flex-col gap-2">
                            <Link href={`/@${currentUser?.username}`} className="block w-full">
                                <Button variant={"ghost"} className="justify-start w-full">
                                    <User />
                                    Profile
                                </Button>
                            </Link>
                            <Button variant={"ghost"} className="justify-start" onClick={handleLogout}>
                                {logoutResult.isLoading ? <Loader className="animate-spin" /> : <LogOut />}
                                Logout
                            </Button>
                        </div>
                    </PopoverContent>
                </Popover>
            </div>
        </header>
    );
}
