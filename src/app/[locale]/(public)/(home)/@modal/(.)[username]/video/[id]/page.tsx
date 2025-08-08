"use client";

import CommentsSection from "@/app/[locale]/(public)/(home)/@modal/(.)[username]/video/[id]/comments-section";
import ModalVideoDetail from "@/app/[locale]/(public)/(home)/@modal/(.)[username]/video/[id]/modal";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useAppContext } from "@/provider/app-provider";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export default function CommentsPage() {
    const { openModalVideoDetailType, setOpenModalVideoDetailType } = useAppContext();
    const [isVisible, setIsVisible] = useState<boolean>(openModalVideoDetailType !== null);
    const pathname = usePathname();
    const { id } = useParams<{ id: string }>();

    const router = useRouter();

    const handleClosePage = useCallback(() => {
        setOpenModalVideoDetailType(null);
    }, [setOpenModalVideoDetailType]);

    useEffect(() => {
        const isVideoPath = /@[^\/]+\/video\/[^\/]+$/.test(pathname);
        if (openModalVideoDetailType === null) {
            if (isVideoPath && isVisible) {
                setTimeout(() => {
                    router.back();
                }, 300);
            }
        }
        if (!isVideoPath && isVisible) {
            setOpenModalVideoDetailType(null);
        }
    }, [openModalVideoDetailType, pathname, setIsVisible, setOpenModalVideoDetailType, router, isVisible]);

    return (
        <>
            {openModalVideoDetailType === "comments" && (
                <CommentsSection
                    isVisible={isVisible}
                    className="flex-1 h-screen flex flex-col py-3 pl-3 w-96 bg-sidebar border-l transition-transform duration-300"
                    id={id}
                    handleCloseComments={handleClosePage}
                />
            )}
            {openModalVideoDetailType === "modalVideoDetail" && (
                <ModalVideoDetail isVisible={isVisible} handleClose={handleClosePage} id={id} />
            )}
        </>
    );
}
