"use client";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export default function DialogWrapper({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const prevPath = useRef<string | null>(null);

    useEffect(() => {
        if (pathname.includes("/login") || pathname.includes("/signup")) {
            setOpen(true);
        } else {
            setOpen(false);
            prevPath.current = pathname;
        }
    }, [pathname]);

    const router = useRouter();
    const handleClose = useCallback(
        (open: boolean) => {
            if (!open) {
                if (prevPath.current) {
                    router.replace(prevPath.current);
                } else {
                    router.replace("/");
                }
            }
        },
        [router]
    );

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="p-0! pt-4">
                <DialogTitle className="hidden" />
                {children}
            </DialogContent>
        </Dialog>
    );
}
