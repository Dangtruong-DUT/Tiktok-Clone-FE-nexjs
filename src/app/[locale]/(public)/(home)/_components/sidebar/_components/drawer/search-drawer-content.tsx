import React, { useCallback, useRef } from "react";
import { X, Search as SearchIcon, Loader2 } from "lucide-react";
import useDebounce from "@/hooks/shared/useDebounce";
import DialogHeader from "@/components/dialog-header";
import { useDrawerSidebar } from "@/app/[locale]/(public)/(home)/_components/sidebar/_components/drawer/drawer";
import { UserType } from "@/types/schemas/User.schema";
import { Link, useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MdVerified } from "react-icons/md";
import { UserVerifyStatus } from "@/constants/enum";
import { useSearchUsersGetQuery } from "@/services/RTK/search.services";
import { useTranslations } from "next-intl";

type SearchDrawerContentProps = {
    searchValue: string;
    setSearchValue: (value: string) => void;
};

export default function SearchDrawerContent({ searchValue, setSearchValue }: SearchDrawerContentProps) {
    const { toggleDrawer } = useDrawerSidebar();
    const router = useRouter();
    const t = useTranslations("HomePage.sidebar.search");
    const debounceValue = useDebounce(searchValue, 500);
    const { data, isLoading: showLoading } = useSearchUsersGetQuery(
        { q: debounceValue as string },
        {
            skip: !debounceValue,
        }
    );

    const searchResults: UserType[] = data?.data || [];

    const inputRef = useRef<HTMLInputElement>(null);

    const handleClearSearch = useCallback(() => {
        setSearchValue("");
        inputRef.current?.focus();
    }, [setSearchValue]);

    const handleSetSearchValue = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value.trim();
            setSearchValue(value);
        },
        [setSearchValue]
    );

    const handleOnEnterOnSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && searchValue) {
            e.preventDefault();
            router.push(`/search?q=${searchValue}`);
        }
    };

    return (
        <div className="w-full">
            <DialogHeader title={t("title")} onClose={toggleDrawer} />

            <div className="mt-6 flex items-center flex-row h-[42px] rounded-[92px] px-4 py-2.5 bg-input overflow-hidden relative hover:outline-1 hover:outline-border focus-within:outline-1 focus-within:outline-border">
                <SearchIcon size={16} className="text-muted-foreground mr-3 flex-shrink-0" />

                <input
                    ref={inputRef}
                    className="bg-transparent flex-grow text-foreground font-normal text-sm leading-6 placeholder:text-muted-foreground placeholder:text-ellipsis outline-none "
                    type="text"
                    placeholder={t("placeholder")}
                    spellCheck={false}
                    value={searchValue}
                    onChange={handleSetSearchValue}
                    onKeyDown={handleOnEnterOnSearch}
                />

                {!showLoading && searchValue.length > 0 && (
                    <button
                        className="text-muted-foreground w-10 h-4 flex justify-end transition-opacity hover:text-foreground"
                        onClick={handleClearSearch}
                    >
                        <X size={16} />
                    </button>
                )}

                {showLoading && (
                    <div className="text-muted-foreground w-10 h-4 flex items-center justify-center absolute z-[2] top-1/2 right-2 -translate-y-1/2">
                        <Loader2 size={16} className="animate-spin" />
                    </div>
                )}
            </div>

            <div className="w-full max-w-[510px] min-w-[200px] mt-4">
                {debounceValue && searchResults.length > 0 && (
                    <>
                        <h4 className="h-[30px] px-3 py-1.5 text-sm leading-[1.29] font-semibold text-muted-foreground mb-2">
                            {t("accounts")}
                        </h4>
                        <ul tabIndex={-1} className="space-y-1">
                            {searchResults.map((user) => (
                                <li key={user._id}>
                                    <Link href={`/@${user.username}`} className="inline-block w-full">
                                        <Button
                                            variant={"ghost"}
                                            className="space-x-2 w-full justify-start py-[9px] min-h-[58px]"
                                        >
                                            <Avatar className="size-10">
                                                <AvatarImage src={user.avatar} />
                                                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col items-start text-left overflow-hidden ">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-semibold text-base truncate max-w-[177px] ">
                                                        {user.username}
                                                    </span>
                                                    {user.verify === UserVerifyStatus.VERIFIED && (
                                                        <MdVerified size={14} className="text-blue-500" />
                                                    )}
                                                </div>
                                                <span className="text-sm text-muted-foreground  truncate max-w-[177px] mt-1">
                                                    {user.name}
                                                </span>
                                            </div>
                                        </Button>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <Link href={`/search?q=${searchValue}`} className="inline-block w-full">
                            <span className="inline-block max-w-full text-base font-semibold truncate mt-4">
                                {t("viewAllResults", { query: searchValue })}
                            </span>
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}
