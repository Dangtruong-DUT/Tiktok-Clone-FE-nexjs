"use client";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

export default function ResetPasswordSuccess() {
    const t = useTranslations("resetPasswordPage");
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        // Trigger animation after component mounts
        const timer = setTimeout(() => setIsAnimated(true), 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="w-full max-w-md mx-auto px-6 py-8">
            <div className="text-center space-y-8">
                {/* Success Content */}
                <div
                    className={`space-y-4 transform transition-all duration-700 delay-300 ease-out ${
                        isAnimated ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}
                >
                    <p className="text-gray-600 text-base leading-relaxed max-w-sm mx-auto">
                        {t("success.description")}
                    </p>

                    {/* Success Details */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 mx-4">
                        <div className="flex items-center justify-center space-x-2 text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm font-medium">{t("success.passwordUpdated")}</span>
                        </div>
                    </div>
                </div>

                {/* Action Button */}
                <div
                    className={`transform transition-all duration-700 delay-500 ease-out ${
                        isAnimated ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                    }`}
                >
                    <Link href="/login">
                        <Button className="w-full primary-button ">
                            <span className="flex items-center justify-center space-x-2">
                                <span>{t("success.goToLogin")}</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                            </span>
                        </Button>
                    </Link>
                </div>

                {/* Additional Info */}
                <div
                    className={`text-xs text-gray-500 space-y-1 transform transition-all duration-700 delay-700 ease-out ${
                        isAnimated ? "opacity-100" : "opacity-0"
                    }`}
                >
                    <p>{t("success.signInMessage")}</p>
                    <p className="text-gray-400">{t("success.redirectMessage")}</p>
                </div>
            </div>
        </div>
    );
}
