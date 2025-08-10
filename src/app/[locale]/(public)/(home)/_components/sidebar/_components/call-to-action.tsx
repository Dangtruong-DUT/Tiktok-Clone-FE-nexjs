import { Button } from "@/components/ui/button";
import { useAppDispatch } from "@/hooks/redux";
import { Link, usePathname } from "@/i18n/navigation";
import { setOpenModal } from "@/store/features/modalSlide";
import React, { useCallback } from "react";
type CallToActionProps = {
    isAuth: boolean;
};
export default function CallToAction({ isAuth }: CallToActionProps) {
    const dispatch = useAppDispatch();
    const pathname = usePathname();
    const handleOpenLoginModal = useCallback(() => {
        dispatch(setOpenModal({ prevPathname: pathname, type: "modalLogin" }));
    }, [dispatch, pathname]);
    return !isAuth ? (
        <div className="px-2 py-4">
            <Link href="/login" onClick={handleOpenLoginModal}>
                <Button
                    variant="outline"
                    size="lg"
                    className="primary-button w-full h-10! rounded-[0.375rem]! cursor-pointer"
                    onClick={handleOpenLoginModal}
                >
                    Log in
                </Button>
            </Link>
        </div>
    ) : null;
}
