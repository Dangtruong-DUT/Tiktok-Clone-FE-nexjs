import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import React from "react";
type CallToActionProps = {
    isAuth: boolean;
};
export default function CallToAction({ isAuth }: CallToActionProps) {
    return !isAuth ? (
        <div className="px-2 py-4">
            <Link href="/login">
                <Button
                    variant="outline"
                    size="lg"
                    className="primary-button w-full h-10! rounded-[0.375rem]! cursor-pointer"
                >
                    Log in
                </Button>
            </Link>
        </div>
    ) : null;
}
