"use client";

import { Audience } from "@/constants/enum";
import { useUpdatePostMutation } from "@/services/RTK/posts.services";
import { createContext, use, useState } from "react";

type PostTableContextType = {
    setPostIdEdit: (value: number | undefined) => void;
    postIdEdit: number | undefined;
    postIdDelete: string | null;
    setPostIdDelete: (value: string | null) => void;
    changeAudienceStatus: ({ status, postId }: { status: Audience; postId: string }) => void;
};

const PostTableContext = createContext<PostTableContextType>({
    setPostIdEdit: () => {},
    postIdEdit: undefined,
    postIdDelete: null,
    setPostIdDelete: () => {},
    changeAudienceStatus: () => {},
});

export function usePostTableContext() {
    return use(PostTableContext);
}

function PostTableProvider({ children }: { children: React.ReactNode }) {
    const [postIdEdit, setPostIdEdit] = useState<number | undefined>();
    const [postIdDelete, setPostIdDelete] = useState<string | null>(null);
    const [updatePost] = useUpdatePostMutation();

    const changeAudienceStatus = async ({ status, postId }: { status: Audience; postId: string }) => {
        try {
            await updatePost({ post_id: postId, body: { audience: status } });
        } catch (error) {
            console.error("Failed to update post audience:", error);
        }
    };

    return (
        <PostTableContext.Provider
            value={{ postIdEdit, setPostIdEdit, postIdDelete, setPostIdDelete, changeAudienceStatus }}
        >
            {children}
        </PostTableContext.Provider>
    );
}

export default PostTableProvider;
