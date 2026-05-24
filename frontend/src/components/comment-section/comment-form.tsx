'use client'

import { AuthModal } from '@/components/auth-modal'
import EmojiPicker from '@/components/emoji-picker'
import { FormControl, FormField, FormItem, Form } from '@/components/ui/form'
import { Audience, PosterType } from '@/constants/enum'
import { useAppSelector } from '@/store/hooks'
import { cn } from '@/lib/utils'
import { useCreateCommentMutation } from '@/store/services/posts.service'
import { handleFormError } from '@/utils/errors/handle-form-errors.util'
import { CreateCommentsReqBody, CreateCommentsReqBodyType } from '@/types/dtos/post/post-request.dto'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { extractHashtags } from '@/utils/social-token.util'
import MentionHashtagTextField from '@/components/mention-hashtag-text-field'
import { logger } from '@/utils/logger.util'

interface CommentFormProps {
    className?: string
    inputClassName?: string
    postUuid: string
    parentId: number
    placeholder?: string
    popoverEmojiClassName?: string
    onClose?: () => void
}

function CommentForm({
    className = '',
    postUuid,
    parentId,
    placeholder = 'Add a comment...',
    inputClassName = '',
    popoverEmojiClassName,
    onClose
}: CommentFormProps) {
    const [createCommentMutate, createCommentResult] = useCreateCommentMutation()

    const form = useForm<CreateCommentsReqBodyType>({
        resolver: zodResolver(CreateCommentsReqBody),
        defaultValues: {
            content: '',
            audience: Audience.PUBLIC,
            type: PosterType.COMMENT,
            parent_id: parentId,
            hashtags: [],
            medias: [],
            mentions: []
        }
    })

    const onSubmit = useCallback(
        async (data: CreateCommentsReqBodyType) => {
            if (createCommentResult.isLoading) return
            try {
                await createCommentMutate({
                    ...data,
                    hashtags: extractHashtags(data.content),
                    mentions: undefined,
                    post_uuid: postUuid
                }).unwrap()
                form.reset()
                onClose?.()
            } catch (error) {
                handleFormError<CreateCommentsReqBodyType>({
                    error,
                    setFormError: form.setError
                })
                logger.error(error)
            }
        },
        [createCommentMutate, createCommentResult.isLoading, form, onClose, postUuid]
    )

    const handleEmojiSelect = (emoji: string) => {
        form.setValue('content', form.getValues('content') + emoji)
    }

    return (
        <Form {...form}>
            <form method='POST' onSubmit={form.handleSubmit(onSubmit)} className={cn('flex gap-4', className)}>
                <div className='flex-1 rounded-lg flex items-center justify-between gap-0.5 px-4 border bg-input'>
                    <FormField
                        control={form.control}
                        name='content'
                        render={({ field }) => (
                            <FormItem className='flex-1'>
                                <FormControl>
                                    <MentionHashtagTextField
                                        as='input'
                                        autoComplete='off'
                                        spellCheck={false}
                                        suggestionPlacement='top'
                                        placeholder={placeholder}
                                        value={field.value ?? ''}
                                        onChange={field.onChange}
                                        className={cn(
                                            'w-full bg-transparent border-none outline-none py-2 ',
                                            inputClassName
                                        )}
                                        wrapperClassName='w-full'
                                    />
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <EmojiPicker
                        onEmojiSelect={handleEmojiSelect}
                        className='[&>svg]:size-5.5! cursor-pointer'
                        popoverClassName={popoverEmojiClassName}
                    />
                </div>
                <button
                    type='submit'
                    className='text-right disabled:text-muted-foreground text-brand font-semibold cursor-pointer'
                    disabled={createCommentResult.isLoading || !form.formState.isValid}
                >
                    Post
                </button>
            </form>
        </Form>
    )
}

export default function CommentFormWrapper(props: CommentFormProps) {
    const role = useAppSelector((state) => state.auth.role)
    if (role == null) {
        return (
            <AuthModal>
                <div className='relative'>
                    <CommentForm {...props} />
                    <button className='absolute inset-0 bg-transparent' />
                </div>
            </AuthModal>
        )
    }

    return <CommentForm {...props} />
}
