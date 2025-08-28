"use client";

import { createContext, use, useState } from "react";

type PostTableContextType = {
    setPostIdEdit: (value: number | undefined) => void;
    postIdEdit: number | undefined;
    postIdDelete: string | null;
    setPostIdDelete: (value: string | null) => void;
};

const PostTableContext = createContext<PostTableContextType>({
    setPostIdEdit: () => {},
    postIdEdit: undefined,
    postIdDelete: null,
    setPostIdDelete: () => {},
});

export function usePostTableContext() {
    return use(PostTableContext);
}

function PostTableProvider({ children }: { children: React.ReactNode }) {
    const [postIdEdit, setPostIdEdit] = useState<number | undefined>();
    const [postIdDelete, setPostIdDelete] = useState<string | null>(null);
    return (
        <PostTableContext.Provider value={{ postIdEdit, setPostIdEdit, postIdDelete, setPostIdDelete }}>
            {children}
        </PostTableContext.Provider>
    );
}

export default PostTableProvider;
