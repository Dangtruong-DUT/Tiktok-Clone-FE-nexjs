"use client";
import AppLoader from "@/components/app-loader";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLogout } from "@/hooks/data/useAuth";

interface DialogConfirmLogoutProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
}

export default function DialogConfirmLogout({ isOpen, onOpenChange }: DialogConfirmLogoutProps) {
    const { handleLogout, logoutResult } = useLogout({
        onLogout: () => {
            onOpenChange(false);
        },
    });

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange} modal>
                <DialogContent className="max-w-sm! p-7 z-[9999]">
                    <DialogHeader>
                        <DialogTitle className="font-bold text-2xl text-center">
                            Are you sure you want to log out?
                        </DialogTitle>
                        <div className="mt-2 flex flex-col sm:flex-row gap-2 justify-between ">
                            <Button
                                variant="outline"
                                className="h-12 sm:w-40 w-full text-base font-semibold text-brand border border-brand! hover:bg-brand/10! hover:text-brand! cursor-pointer sm:order-last "
                                onClick={handleLogout}
                            >
                                Log out
                            </Button>
                            <Button
                                variant="outline"
                                className="h-12 sm:w-40 w-full text-base font-semibold  hover:border hover:border-border cursor-pointer "
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </DialogHeader>
                </DialogContent>
            </Dialog>
            {logoutResult.isLoading && <AppLoader />}
        </>
    );
}
