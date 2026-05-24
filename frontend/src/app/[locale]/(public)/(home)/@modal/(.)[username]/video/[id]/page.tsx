'use client'

import CommentsSection from '@/app/[locale]/(public)/(home)/@modal/(.)[username]/video/[id]/_components/comments-section'
import ModalVideoDetail from '@/app/[locale]/(public)/(home)/@modal/(.)[username]/video/[id]/_components/modal'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { usePathname, useRouter } from '@/i18n/navigation'
import { closeModal } from '@/store/features/modalSlide'
import { useParams } from 'next/navigation'
import { ModalVideoDetailType } from '@/constants/ui/video-dialog'
import { useCallback, useEffect, useRef } from 'react'
import { VIDEO_PATH_REGEX } from '@/constants/regex'
import { APP_ROUTES } from '@/constants/routes/routes'

export default function CommentsPage() {
    const typeOpenModal = useAppSelector((state) => state.modal.typeOpenModal)
    const prevPathnameOpenDetailModal = useAppSelector((state) => state.modal.prevPathnameOpenModal)
    const dispatch = useAppDispatch()
    const pathname = usePathname()
    const { id, username } = useParams<{ id: string; username: string }>() ?? { id: '', username: '' }
    const router = useRouter()
    const prevPathnameRef = useRef<string | null>(null)

    const isVideoPath = VIDEO_PATH_REGEX.test(pathname)

    useEffect(() => {
        if (prevPathnameOpenDetailModal && !VIDEO_PATH_REGEX.test(prevPathnameOpenDetailModal)) {
            prevPathnameRef.current = prevPathnameOpenDetailModal
        }
    }, [prevPathnameOpenDetailModal])

    const handleClose = useCallback(() => {
        if (prevPathnameRef.current) {
            router.push(prevPathnameRef.current, { scroll: false })
            prevPathnameRef.current = null
        } else {
            router.replace(APP_ROUTES.HOME)
        }
    }, [router, prevPathnameRef])

    useEffect(() => {
        if (typeOpenModal == null && prevPathnameRef.current != null) {
            handleClose()
        }
    }, [typeOpenModal, handleClose])

    const onClose = useCallback(() => {
        dispatch(closeModal())
    }, [dispatch])

    return (
        <>
            <CommentsSection
                isVisible={typeOpenModal === ModalVideoDetailType.COMMENTS && isVideoPath}
                id={id}
                username={username.replace('%40', '')}
                handleCloseComments={onClose}
            />

            <ModalVideoDetail
                isVisible={typeOpenModal === ModalVideoDetailType.MODAL && isVideoPath}
                handleClose={onClose}
                id={id}
            />
        </>
    )
}
