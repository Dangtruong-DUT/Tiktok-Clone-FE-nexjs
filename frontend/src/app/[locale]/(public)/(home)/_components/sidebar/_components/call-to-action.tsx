import { Button } from "@/components/ui/button";
import { AuthModal } from "@/components/auth-modal";
import { useTranslations } from "next-intl";
import React from "react";

type CallToActionProps = {
    isAuth: boolean;
};

export default function CallToAction({ isAuth }: CallToActionProps) {
    const t = useTranslations("HomePage.sidebar.auth");

    return !isAuth ? (
        <div className="px-2 py-4">
            <AuthModal>
                <Button
                    variant="outline"
                    size="lg"
                    className="primary-button w-full h-10! rounded-[0.375rem]! cursor-pointer font-medium!"
                >
                    {t("login")}
                </Button>
            </AuthModal>
        </div>
    ) : null;
}
