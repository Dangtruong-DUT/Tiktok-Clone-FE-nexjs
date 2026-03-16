"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

export function useConfirmNavigation({ shouldConfirm = true }: { shouldConfirm: boolean }) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [navigationType, setNavigationType] = useState<"push" | "replace" | "back" | null>(null);
    const nextUrlRef = useRef<string | null>(null);
    const isNavigatingRef = useRef(false);
    const hasSetupHistoryRef = useRef(false);

    const confirmNavigation = useCallback(
        (type: "push" | "replace" | "back", url?: string) => {
            if (!shouldConfirm || isNavigatingRef.current) return false;
            setNavigationType(type);
            nextUrlRef.current = url || null;
            setShowModal(true);
            return true;
        },
        [shouldConfirm]
    );

    const stayHere = useCallback(() => {
        setShowModal(false);
        setNavigationType(null);
        nextUrlRef.current = null;
    }, []);

    const leavePage = useCallback(() => {
        setShowModal(false);
        isNavigatingRef.current = true;
        if (navigationType === "push" && nextUrlRef.current) {
            router.push(nextUrlRef.current);
        } else if (navigationType === "replace" && nextUrlRef.current) {
            router.replace(nextUrlRef.current);
        } else if (navigationType === "back") {
            window.history.go(-2);
        }
        setNavigationType(null);
        nextUrlRef.current = null;
        isNavigatingRef.current = false;
    }, [navigationType, router]);

    useEffect(() => {
        if (!shouldConfirm) return;

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (shouldConfirm && !isNavigatingRef.current) {
                e.preventDefault();
                e.returnValue = "";
            }
        };
        const handlePopState = (e: PopStateEvent) => {
            if (!isNavigatingRef.current) {
                e.preventDefault();
                history.pushState(null, "", window.location.href);
                confirmNavigation("back");
            }
        };

        const handleClick = (e: MouseEvent) => {
            if (isNavigatingRef.current) return;

            const target = e.target as HTMLElement;
            const anchor = target.closest("a");

            if (anchor && anchor.href && !anchor.href.startsWith("mailto:") && !anchor.href.startsWith("tel:")) {
                const isInternalLink = anchor.href.startsWith(window.location.origin) || anchor.href.startsWith("/");

                if (isInternalLink) {
                    e.preventDefault();
                    e.stopPropagation();

                    let relativeUrl = anchor.href;
                    if (anchor.href.startsWith(window.location.origin)) {
                        relativeUrl = anchor.href.replace(window.location.origin, "");
                    }

                    if (relativeUrl === window.location.pathname + window.location.search) {
                        return;
                    }

                    if (!confirmNavigation("push", relativeUrl)) {
                        setShowModal(false);
                        isNavigatingRef.current = true;
                        router.push(relativeUrl);
                        isNavigatingRef.current = false;
                    }
                }
            }
        };

        if (!hasSetupHistoryRef.current) {
            history.pushState(null, "", window.location.href);
            hasSetupHistoryRef.current = true;
        }

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("popstate", handlePopState);
        document.addEventListener("click", handleClick, true);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
            document.removeEventListener("click", handleClick, true);
        };
    }, [shouldConfirm, confirmNavigation, router, setShowModal]);

    return {
        showModal,
        stayHere,
        leavePage,
        navigationType,
    };
}
