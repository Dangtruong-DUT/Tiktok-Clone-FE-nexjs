"use client";

import CommentsSection from "@/app/[locale]/(public)/(home)/@modal/(.)[username]/video/[id]/comments-section";
import ModalVideoDetail from "@/app/[locale]/(public)/(home)/@modal/(.)[username]/video/[id]/modal";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { usePathname, useRouter } from "@/i18n/navigation";
import { closeModal } from "@/store/features/modalSlide";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";

export default function CommentsPage() {
    const typeOpenModal = useAppSelector((state) => state.modal.typeOpenModal);
    const prevPathnameOpenDetailModal = useAppSelector((state) => state.modal.prevPathnameOpenModal);
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const { id, username } = useParams<{ id: string; username: string }>();
    const router = useRouter();
    const [isClosing, setIsClosing] = useState(false);

    const isVideoPath = /\/@[^\/]+\/video\/[^\/]+$/.test(pathname);

    const handleClose = useCallback(() => {
        setIsClosing(true);
        dispatch(closeModal());
        const pathname = prevPathnameOpenDetailModal;
        if (pathname) {
            router.push(pathname, { scroll: false });
        } else {
            router.replace("/");
        }
        setIsClosing(false);
    }, [router, dispatch, prevPathnameOpenDetailModal]);

    return (
        <>
            <CommentsSection
                isVisible={typeOpenModal === "commentsVideoDetail" && isVideoPath && !isClosing}
                id={id}
                username={username.replace("%40", "")}
                handleCloseComments={handleClose}
            />

            <ModalVideoDetail
                isVisible={typeOpenModal === "modalVideoDetail" && isVideoPath && !isClosing}
                handleClose={handleClose}
                id={id}
            />
        </>
    );
}
