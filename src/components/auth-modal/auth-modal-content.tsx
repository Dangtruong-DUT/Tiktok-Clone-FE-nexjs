"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AuthNav } from "./components/auth-nav";
import { LegalNotice } from "./components/legal-notice";
import { AuthMenuItem } from "./components/auth-menu-item";
import { EmailFormView } from "./components/email-form-view";
import { useAuthMenuItems } from "./hooks/use-auth-menu-items";

type AuthMode = "login" | "signup" | "login-email" | "signup-email";

export function AuthModalContent() {
    const [mode, setMode] = useState<AuthMode>("login");
    const tLogin = useTranslations("LoginPage");
    const tSignUp = useTranslations("SignUpPage");

    const menuItems = useAuthMenuItems(mode, setMode);
    const isEmailMode = mode === "login-email" || mode === "signup-email";
    const isLoginMode = mode === "login" || mode === "login-email";

    const handleModeChange = (newMode: "login" | "signup") => {
        setMode(newMode);
    };

    const handleBackToMenu = () => {
        setMode(mode === "login-email" ? "login" : "signup");
    };

    // Email form view
    if (isEmailMode) {
        return (
            <div className="flex flex-col h-[90vh]">
                <main className="flex-1 overflow-auto p-6  ">
                    <EmailFormView mode={mode} onBack={handleBackToMenu} />
                </main>
                <LegalNotice />
                <AuthNav isLoginMode={isLoginMode} onModeChange={handleModeChange} />
            </div>
        );
    }

    // Main menu view
    return (
        <div className="flex flex-col h-[90vh]">
            <main className="flex-1 overflow-auto p-6">
                <h1 className="text-2xl font-bold text-center mb-4 mt-16">
                    {isLoginMode ? tLogin("title") : tSignUp("title")}
                </h1>
                <div className="grid gap-2 px-4">
                    {menuItems.map((item) => (
                        <AuthMenuItem key={item.id} item={item} />
                    ))}
                </div>
            </main>
            <LegalNotice />
            <AuthNav isLoginMode={isLoginMode} onModeChange={handleModeChange} />
        </div>
    );
}
