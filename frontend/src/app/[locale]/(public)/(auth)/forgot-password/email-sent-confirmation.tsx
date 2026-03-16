"use client";
import { Button } from "@/components/ui/button";
import { Mail, Home } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface EmailSentConfirmationProps {
    sentEmail: string;
    onSendAnotherEmail: () => void;
}

export default function EmailSentConfirmation({ sentEmail, onSendAnotherEmail }: EmailSentConfirmationProps) {
    const t = useTranslations("forgotPasswordPage");

    return (
        <div className="text-center space-y-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-600" />
            </div>
            <div className="space-y-2">
                <h2 className="text-xl font-semibold text-gray-900">{t("emailSent.title")}</h2>
                <p className="text-gray-600 text-sm">
                    {t("emailSent.description")} <span className="font-medium text-gray-900">{sentEmail}</span>
                </p>
                <p className="text-gray-500 text-xs">{t("emailSent.checkSpam")}</p>
            </div>
            <div className="space-y-3">
                <Button
                    onClick={onSendAnotherEmail}
                    variant="outline"
                    className="w-full border-neutral-300! bg-white text-black hover:bg-neutral-100 hover:text-black"
                >
                    {t("emailSent.sendAnotherEmail")}
                </Button>
                {/* Back to Home Button */}
                <Link href="/">
                    <Button
                        variant="outline"
                        className="w-full border-neutral-300! bg-white text-black hover:bg-neutral-100 hover:text-black border! "
                    >
                        <Home className="w-4 h-4 mr-2" />
                        {t("backToHome")}
                    </Button>
                </Link>
            </div>
        </div>
    );
}
