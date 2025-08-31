"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useCallback } from "react";

export function useConfirmNavigation(shouldConfirm: boolean = true) {
    const router = useRouter();
    const [showModal, setShowModal] = useState(false);
    const [navigationType, setNavigationType] = useState<"push" | "replace" | "back" | null>(null);
    const nextUrlRef = useRef<string | null>(null);
    const isNavigatingRef = useRef(false);

    // Override router methods để intercept navigation
    const originalPush = useRef(router.push);
    const originalReplace = useRef(router.replace);
    const originalBack = useRef(router.back);

    const confirmNavigation = useCallback(
        (type: "push" | "replace" | "back", url?: string) => {
            if (!shouldConfirm || isNavigatingRef.current) {
                return false; // Không cần confirm hoặc đang navigate
            }

            setNavigationType(type);
            nextUrlRef.current = url || null;
            setShowModal(true);
            return true; // Đã intercept
        },
        [shouldConfirm]
    );

    // Wrapper cho router methods
    const push = useCallback(
        (url: string) => {
            if (!confirmNavigation("push", url)) {
                originalPush.current(url);
            }
        },
        [confirmNavigation]
    );

    const replace = useCallback(
        (url: string) => {
            if (!confirmNavigation("replace", url)) {
                originalReplace.current(url);
            }
        },
        [confirmNavigation]
    );

    const back = useCallback(() => {
        if (!confirmNavigation("back")) {
            originalBack.current();
        }
    }, [confirmNavigation]);

    // Override router object
    const enhancedRouter = {
        ...router,
        push,
        replace,
        back,
    };

    const stayHere = useCallback(() => {
        setShowModal(false);
        setNavigationType(null);
        nextUrlRef.current = null;
    }, []);

    const leavePage = useCallback(() => {
        isNavigatingRef.current = true;

        if (navigationType === "push" && nextUrlRef.current) {
            originalPush.current(nextUrlRef.current);
        } else if (navigationType === "replace" && nextUrlRef.current) {
            originalReplace.current(nextUrlRef.current);
        } else if (navigationType === "back") {
            originalBack.current();
        }

        setShowModal(false);
        setNavigationType(null);
        nextUrlRef.current = null;

        // Reset flag sau khi navigate
        setTimeout(() => {
            isNavigatingRef.current = false;
        }, 100);
    }, [navigationType]);

    useEffect(() => {
        // Handle browser back/forward buttons
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (shouldConfirm) {
                e.preventDefault();
                e.returnValue = "";
                return "";
            }
        };

        const handlePopState = (e: PopStateEvent) => {
            if (shouldConfirm && !isNavigatingRef.current) {
                // Push lại state hiện tại để "cancel" việc back
                window.history.pushState(null, "", window.location.href);
                confirmNavigation("back");
            }
        };

        // Add một state để track
        window.history.pushState(null, "", window.location.href);

        window.addEventListener("beforeunload", handleBeforeUnload);
        window.addEventListener("popstate", handlePopState);

        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
            window.removeEventListener("popstate", handlePopState);
        };
    }, [shouldConfirm, confirmNavigation]);

    return {
        router: enhancedRouter,
        showModal,
        stayHere,
        leavePage,
        navigationType,
    };
}
