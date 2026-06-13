'use client'

import { Audience, AudienceValue } from '@/constants/enum'
import { useUpdatePostMutation } from '@/store/services/content/posts.service'
import { createContext, use, useState } from 'react'
import { logger } from '@/utils/logger.util'

type PostTableContextType = {
    setPostIdEdit: (value: number | undefined) => void
    postIdEdit: number | undefined
    postIdDelete: string | null
    setPostIdDelete: (value: string | null) => void
    selectedPostUuid: string | null
    setSelectedPostUuid: (value: string | null) => void
    changeAudienceStatus: ({ status, postId }: { status: AudienceValue; postId: string }) => void
    getAudienceStatus: ({ postId, fallback }: { postId: string; fallback: Audience }) => Audience
    clearAudienceStatus: (postId: string) => void
}

const PostTableContext = createContext<PostTableContextType>({
    setPostIdEdit: () => {},
    postIdEdit: undefined,
    postIdDelete: null,
    setPostIdDelete: () => {},
    selectedPostUuid: null,
    setSelectedPostUuid: () => {},
    changeAudienceStatus: () => {},
    getAudienceStatus: ({ fallback }) => fallback,
    clearAudienceStatus: () => {}
})

export function usePostTableContext() {
    return use(PostTableContext)
}

function PostTableProvider({ children }: { children: React.ReactNode }) {
    const [postIdEdit, setPostIdEdit] = useState<number | undefined>()
    const [postIdDelete, setPostIdDelete] = useState<string | null>(null)
    const [selectedPostUuid, setSelectedPostUuid] = useState<string | null>(null)
    const [audienceStatusMap, setAudienceStatusMap] = useState<Record<string, AudienceValue>>({})
    const [updatePost] = useUpdatePostMutation()

    const changeAudienceStatus = async ({ status, postId }: { status: AudienceValue; postId: string }) => {
        setAudienceStatusMap((prev) => ({ ...prev, [postId]: status }))

        try {
            await updatePost({
                post_uuid: postId,
                body: { audience: status }
            }).unwrap()
        } catch (error) {
            setAudienceStatusMap((prev) => {
                const next = { ...prev }
                delete next[postId]
                return next
            })
            logger.error('Failed to update post audience:', error)
        }
    }

    const getAudienceStatus = ({ postId, fallback }: { postId: string; fallback: Audience }) => {
        return audienceStatusMap[postId] ?? fallback
    }

    const clearAudienceStatus = (postId: string) => {
        setAudienceStatusMap((prev) => {
            if (!(postId in prev)) {
                return prev
            }

            const next = { ...prev }
            delete next[postId]
            return next
        })
    }

    return (
        <PostTableContext.Provider
            value={{
                postIdEdit,
                setPostIdEdit,
                postIdDelete,
                setPostIdDelete,
                selectedPostUuid,
                setSelectedPostUuid,
                changeAudienceStatus,
                getAudienceStatus,
                clearAudienceStatus
            }}
        >
            {children}
        </PostTableContext.Provider>
    )
}

export default PostTableProvider
