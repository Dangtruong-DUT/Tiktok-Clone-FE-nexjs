"use client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { usePathname, useRouter } from "@/i18n/navigation";
import { closeModal } from "@/store/features/modalSlide";
import { useCallback } from "react";

export default function DialogWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const openModalType = useAppSelector((state) => state.modal.typeOpenModal);
    const prevPathOpenModal = useAppSelector((state) => state.modal.prevPathnameOpenModal);
    const dispatch = useAppDispatch();
    const open = openModalType == "modalLogin" && (pathname.includes("/login") || pathname.includes("/signup"));

    const router = useRouter();
    const handleClose = useCallback(
        (open: boolean) => {
            if (!open) {
                if (prevPathOpenModal) {
                    router.replace(prevPathOpenModal, { scroll: false });
                } else {
                    router.replace("/");
                }
                dispatch(closeModal());
            }
        },
        [router, prevPathOpenModal, dispatch]
    );

    if (!open) return null;
    return (
        <Dialog open={true} onOpenChange={handleClose}>
            <DialogContent className="p-0! pt-4">
                <DialogTitle className="hidden" />
                {children}
            </DialogContent>
        </Dialog>
    );
}
