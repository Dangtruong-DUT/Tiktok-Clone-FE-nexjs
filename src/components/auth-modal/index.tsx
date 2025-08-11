"use client";

import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AuthModalContent } from "./auth-modal-content";

export interface AuthModalProps {
    children: React.ReactNode;
}

export function AuthModal({ children }: AuthModalProps) {
    return (
        <Dialog>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="p-0! pt-4" showCloseButton={false}>
                <DialogTitle className="hidden" />
                <AuthModalContent />
            </DialogContent>
        </Dialog>
    );
}
