import React, { useCallback, useRef, useState } from "react";
import { X, Search as SearchIcon, Loader2 } from "lucide-react";
import useDebounce from "@/hooks/shared/useDebounce";
import useSidebar from "@/app/[locale]/(public)/(home)/_components/sidebar/context/sidebar.context";
import DialogHeader from "@/components/dialog-header";

export default function SearchDrawerContent() {
    const { searchValue, setSearchValue, toggleDrawer } = useSidebar();
    const [searchResults, setSearchResults] = useState([]);
    const [showLoading, setShowLoading] = useState(false);
    const debounceValue = useDebounce(searchValue, 500);

    const inputRef = useRef<HTMLInputElement>(null);

    const handleClearSearch = useCallback(() => {
        setSearchValue("");
        setSearchResults([]);
        inputRef.current?.focus();
    }, [setSearchValue, setSearchResults]);

    const handleCloseDrawer = useCallback(() => {
        toggleDrawer(false);
    }, [toggleDrawer]);

    return (
        <div className="w-full">
            <DialogHeader title="Search" onClose={handleCloseDrawer} />

            <div className="mt-6 flex items-center flex-row h-[42px] rounded-[92px] px-4 py-2.5 bg-input overflow-hidden relative hover:outline-1 hover:outline-border focus-within:outline-1 focus-within:outline-border">
                <SearchIcon size={16} className="text-muted-foreground mr-3 flex-shrink-0" />

                <input
                    ref={inputRef}
                    className="bg-transparent flex-grow text-foreground caret-primary font-normal text-sm leading-6 placeholder:text-muted-foreground placeholder:text-ellipsis outline-none"
                    type="text"
                    placeholder="Search"
                    spellCheck={false}
                    value={searchValue}
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
                        <Loader2 size={20} className="animate-spin" />
                    </div>
                )}
            </div>

            <div className="w-full max-w-[510px] min-w-[200px] mt-4">
                {searchResults.length > 0 && (
                    <>
                        <h4 className="h-[30px] px-3 py-1.5 text-sm leading-[1.29] font-semibold text-muted-foreground">
                            Account
                        </h4>
                        <ul tabIndex={-1} className="space-y-1">
                            {/* {searchResults.map((result, index) => (
                                <li key={index}>
                                    <AccountItem
                                        avatar_url={result.avatar}
                                        username={result.nickname}
                                        name={result.full_name}
                                        verified={result.verified}
                                    />
                                </li>
                            ))} */}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
}
