"use client";

import CommentsSection from "@/app/[locale]/(public)/(home)/@modal/(.)[username]/video/[id]/comments-section";
import ModalVideoDetail from "@/app/[locale]/(public)/(home)/@modal/(.)[username]/video/[id]/modal";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { usePathname, useRouter } from "@/i18n/navigation";
import { closeModal } from "@/store/features/modalSlide";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";

const isVideoPathRegex = /\/@[^\/]+\/video\/[^\/]+$/;

export default function CommentsPage() {
    const typeOpenModal = useAppSelector((state) => state.modal.typeOpenModal);
    const prevPathnameOpenDetailModal = useAppSelector((state) => state.modal.prevPathnameOpenModal);
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const { id, username } = useParams<{ id: string; username: string }>();
    const router = useRouter();
    const prevPathnameRef = useRef<string | null>(null);

    const isVideoPath = isVideoPathRegex.test(pathname);

    useEffect(() => {
        if (prevPathnameOpenDetailModal && !isVideoPathRegex.test(prevPathnameOpenDetailModal)) {
            prevPathnameRef.current = prevPathnameOpenDetailModal;
        }
    }, [prevPathnameOpenDetailModal]);

    const handleClose = useCallback(() => {
        if (prevPathnameRef.current) {
            router.push(prevPathnameRef.current, { scroll: false });
            prevPathnameRef.current = null;
        } else {
            router.replace("/");
        }
    }, [router, prevPathnameRef]);

    useEffect(() => {
        if (typeOpenModal == null && prevPathnameRef.current != null) {
            handleClose();
        }
    }, [typeOpenModal, handleClose]);

    const onClose = useCallback(() => {
        dispatch(closeModal());
    }, [dispatch]);

    return (
        <>
            <CommentsSection
                isVisible={typeOpenModal === "commentsVideoDetail" && isVideoPath}
                id={id}
                username={username.replace("%40", "")}
                handleCloseComments={onClose}
            />

            <ModalVideoDetail
                isVisible={typeOpenModal === "modalVideoDetail" && isVideoPath}
                handleClose={onClose}
                id={id}
            />
        </>
    );
}
