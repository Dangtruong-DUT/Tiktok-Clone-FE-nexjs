"use client";

import CommentsSection from "@/app/[locale]/(public)/(home)/@modal/(.)[username]/video/[id]/comments-section";
import ModalVideoDetail from "@/app/[locale]/(public)/(home)/@modal/(.)[username]/video/[id]/modal";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { usePathname, useRouter } from "@/i18n/navigation";
import { closeModal } from "@/store/features/modalSlide";
import { useParams } from "next/navigation";
import { useCallback } from "react";

export default function CommentsPage() {
    const typeOpenModal = useAppSelector((state) => state.modal.typeOpenModal);
    const prevPathnameOpenDetailModal = useAppSelector((state) => state.modal.prevPathnameOpenModal);
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    const isVideoPath = /\/@[^\/]+\/video\/[^\/]+$/.test(pathname);

    const handleClose = useCallback(() => {
        dispatch(closeModal());
        const pathname = prevPathnameOpenDetailModal;
        if (pathname) {
            router.push(pathname, { scroll: false });
        } else {
            router.replace("/");
        }
    }, [router, dispatch, prevPathnameOpenDetailModal]);

    return (
        <>
            {typeOpenModal === "commentsVideoDetail" && isVideoPath && (
                <CommentsSection
                    isVisible={typeOpenModal === "commentsVideoDetail"}
                    className="flex-1 h-screen flex flex-col py-3 pl-3 w-96 bg-sidebar border-l transition-transform duration-300"
                    id={id}
                    handleCloseComments={handleClose}
                />
            )}
            {typeOpenModal === "modalVideoDetail" && isVideoPath && (
                <ModalVideoDetail isVisible={typeOpenModal === "modalVideoDetail"} handleClose={handleClose} id={id} />
            )}
        </>
    );
}
