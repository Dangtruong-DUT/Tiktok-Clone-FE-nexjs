'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from '@/i18n/navigation'
import useCurrentUserData from '@/hooks/data/useCurrentUserData'
import {
    useGetConversationsQuery,
    useGetMessagesQuery,
    useMarkConversationAsReadMutation,
    useSendMessageMutation
} from '@/store/services/chat.service'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useTranslations } from 'next-intl'
import { SearchParamsLoader, useSearchParamsLoader } from '@/components/searchparams-loader'

export default function MessagesPage() {
    const t = useTranslations('MessagesPage')
    const router = useRouter()
    const { searchParams, setSearchParams } = useSearchParamsLoader()
    const currentUser = useCurrentUserData()

    const initialConversationId = Number(searchParams?.get('conversation_id') || '') || null
    const [activeConversationId, setActiveConversationId] = useState<number | null>(initialConversationId)
    const [content, setContent] = useState('')

    const { data: conversationsRes, isLoading: isLoadingConversations } = useGetConversationsQuery({
        page: 1,
        per_page: 30
    })
    const [sendMessage, { isLoading: isSending }] = useSendMessageMutation()
    const [markConversationAsRead] = useMarkConversationAsReadMutation()

    const conversations = conversationsRes?.data ?? []

    const { data: messagesRes, isFetching: isFetchingMessages } = useGetMessagesQuery(
        {
            conversation_id: activeConversationId ?? 0,
            page: 1,
            per_page: 50
        },
        {
            skip: !activeConversationId
        }
    )

    const messages = useMemo(() => {
        const raw = messagesRes?.data ?? []
        return [...raw].reverse()
    }, [messagesRes?.data])

    useEffect(() => {
        if (activeConversationId || conversations.length === 0) {
            return
        }

        setActiveConversationId(conversations[0].id)
    }, [activeConversationId, conversations])

    useEffect(() => {
        if (!activeConversationId) {
            return
        }

        void markConversationAsRead({ conversation_id: activeConversationId })
    }, [activeConversationId, markConversationAsRead])

    const activeConversation = useMemo(
        () => conversations.find((conversation) => conversation.id === activeConversationId) ?? null,
        [activeConversationId, conversations]
    )

    const activeConversationTitle = useMemo(() => {
        if (!activeConversation) {
            return t('emptyTitle')
        }

        const target = activeConversation.participants.find((participant) => participant.uuid !== currentUser?.uuid)
        return target?.name || target?.username || `${t('conversation')} #${activeConversation.id}`
    }, [activeConversation, currentUser?.uuid, t])

    const handleOpenConversation = (conversationId: number) => {
        setActiveConversationId(conversationId)
        router.push(`/messages?conversation_id=${conversationId}`)
    }

    const handleSendMessage = async () => {
        if (!activeConversationId || !content.trim()) {
            return
        }

        try {
            await sendMessage({
                conversation_id: activeConversationId,
                content: content.trim(),
                type: 1
            }).unwrap()
            setContent('')
        } catch {
            toast.error(t('sendFailed'))
        }
    }

    if (!currentUser) {
        return <div className='p-6 text-sm text-muted-foreground'>{t('loginRequired')}</div>
    }

    return (
        <div className='h-screen grid grid-cols-[320px_1fr]'>
            <SearchParamsLoader onParamsReceived={setSearchParams} />
            <aside className='border-r h-full overflow-y-auto'>
                <div className='px-4 py-3 border-b font-semibold'>{t('title')}</div>
                {isLoadingConversations ? (
                    <p className='p-4 text-sm text-muted-foreground'>{t('loadingConversations')}</p>
                ) : conversations.length === 0 ? (
                    <p className='p-4 text-sm text-muted-foreground'>{t('noConversations')}</p>
                ) : (
                    <ul className='p-2 space-y-1'>
                        {conversations.map((conversation) => {
                            const target = conversation.participants.find(
                                (participant) => participant.uuid !== currentUser.uuid
                            )
                            const title = target?.name || target?.username || `${t('conversation')} #${conversation.id}`
                            const isActive = conversation.id === activeConversationId

                            return (
                                <li key={conversation.id}>
                                    <button
                                        className={`w-full text-left px-3 py-2 rounded-md transition ${
                                            isActive ? 'bg-secondary' : 'hover:bg-accent'
                                        }`}
                                        onClick={() => handleOpenConversation(conversation.id)}
                                    >
                                        <div className='text-sm font-medium truncate'>{title}</div>
                                        <div className='text-xs text-muted-foreground truncate'>
                                            {conversation.last_message?.content || t('noMessagesYet')}
                                        </div>
                                    </button>
                                </li>
                            )
                        })}
                    </ul>
                )}
            </aside>

            <section className='h-full flex flex-col'>
                <div className='px-4 py-3 border-b font-semibold'>{activeConversationTitle}</div>

                <div className='flex-1 overflow-y-auto p-4 space-y-3'>
                    {!activeConversationId ? (
                        <p className='text-sm text-muted-foreground'>{t('selectConversation')}</p>
                    ) : isFetchingMessages ? (
                        <p className='text-sm text-muted-foreground'>{t('loadingMessages')}</p>
                    ) : messages.length === 0 ? (
                        <p className='text-sm text-muted-foreground'>{t('noMessagesYet')}</p>
                    ) : (
                        messages.map((message) => {
                            const mine = message.sender?.uuid === currentUser.uuid
                            return (
                                <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                                    <div
                                        className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                                            mine ? 'bg-primary text-primary-foreground' : 'bg-secondary text-foreground'
                                        }`}
                                    >
                                        {message.content}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>

                <div className='p-3 border-t flex items-center gap-2'>
                    <Input
                        value={content}
                        onChange={(event) => setContent(event.target.value)}
                        placeholder={t('placeholder')}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                void handleSendMessage()
                            }
                        }}
                    />
                    <Button onClick={() => void handleSendMessage()} disabled={isSending || !activeConversationId}>
                        {t('send')}
                    </Button>
                </div>
            </section>
        </div>
    )
}
