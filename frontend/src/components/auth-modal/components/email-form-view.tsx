import { useTranslations } from "next-intl";
import { ModalLoginForm } from "../modal-login-form";
import { ModalSignUpForm } from "../modal-signup-form";
import { ChevronLeft } from "lucide-react";

type AuthMode = "login" | "signup" | "login-email" | "signup-email";

export interface EmailFormViewProps {
    mode: AuthMode;
    onBack: () => void;
}

export function EmailFormView({ mode, onBack }: EmailFormViewProps) {
    const tLogin = useTranslations("LoginPage");
    const tSignUp = useTranslations("SignUpPage");

    if (mode === "login-email") {
        return (
            <div>
                <button onClick={onBack} className="mb-4 text-sm text-muted-foreground cursor-pointer ">
                    <ChevronLeft className="size-8" />
                </button>
                <h1 className="text-2xl font-bold text-center mb-4">{tLogin("title")}</h1>
                <div className="px-4">
                    <ModalLoginForm />
                </div>
            </div>
        );
    }

    if (mode === "signup-email") {
        return (
            <div>
                <button onClick={onBack} className="mb-4 text-sm text-muted-foreground  cursor-pointer">
                    <ChevronLeft className="size-8" />
                </button>
                <h1 className="text-2xl font-bold text-center mb-4">{tSignUp("title")}</h1>

                <div className="px-4">
                    <ModalSignUpForm />
                </div>
            </div>
        );
    }

    return null;
}
