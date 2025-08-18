"use client";

import useDebounceCallback from "@/hooks/shared/useCallback";
import {
    useBookmarkPostMutation,
    useLikePostMutation,
    useUnBookmarkPostMutation,
    useUnlikePostMutation,
} from "@/services/RTK/posts.services";
import { useCallback, useEffect, useState } from "react";

interface UseLikePostProps {
    postId: string;
    initialLikeState: boolean;
}
export function useLikePost({ postId, initialLikeState }: UseLikePostProps) {
    const [likePost, { isLoading: isLikeLoading }] = useLikePostMutation();
    const [unlikePost, { isLoading: isUnlikeLoading }] = useUnlikePostMutation();
    const [isLikedState, setIsLikedState] = useState(initialLikeState);
    const isProcessing = isLikeLoading || isUnlikeLoading;

    useEffect(() => {
        setIsLikedState(initialLikeState);
    }, [initialLikeState]);

    const handleLikeAction = useDebounceCallback(async (isLikedState) => {
        if (isProcessing) return;

        try {
            if (!isLikedState) {
                await unlikePost(postId).unwrap();
            } else {
                await likePost(postId).unwrap();
            }
        } catch (error) {
            setIsLikedState((prev) => !prev);
            console.error(error);
        }
    }, 300);

    const toggleLikeState = useCallback(() => {
        setIsLikedState((prev) => {
            handleLikeAction(!prev);
            return !prev;
        });
    }, [handleLikeAction]);

    return {
        isLikedState,
        toggleLikeState,
    };
}

interface UseBookmarkPostProps {
    postId: string;
    initialBookmarkState: boolean;
}
export function useBookmarkPost({ postId, initialBookmarkState }: UseBookmarkPostProps) {
    const [bookmarkPost, { isLoading: isBookmarkLoading }] = useBookmarkPostMutation();
    const [unBookmarkPost, { isLoading: isUnBookmarkLoading }] = useUnBookmarkPostMutation();
    const [isBookmarkedState, setIsBookmarkedState] = useState(initialBookmarkState);
    const isProcessing = isBookmarkLoading || isUnBookmarkLoading;

    useEffect(() => {
        setIsBookmarkedState(initialBookmarkState);
    }, [initialBookmarkState]);

    const handleBookmarkAction = useDebounceCallback(async (isBookmarkedState) => {
        if (isProcessing) return;

        try {
            if (!isBookmarkedState) {
                await unBookmarkPost(postId).unwrap();
            } else {
                await bookmarkPost(postId).unwrap();
            }
        } catch (error) {
            setIsBookmarkedState((prev) => !prev);
            console.error(error);
        }
    }, 300);

    const toggleBookmarkState = useCallback(() => {
        setIsBookmarkedState((prev) => {
            handleBookmarkAction(!prev);
            return !prev;
        });
    }, [handleBookmarkAction]);

    return {
        isBookmarkedState,
        toggleBookmarkState,
    };
}
