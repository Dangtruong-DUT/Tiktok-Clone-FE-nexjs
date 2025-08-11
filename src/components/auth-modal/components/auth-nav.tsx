import { useTranslations } from "next-intl";

export interface AuthNavProps {
    isLoginMode: boolean;
    onModeChange: (mode: "login" | "signup") => void;
}

export function AuthNav({ isLoginMode, onModeChange }: AuthNavProps) {
    const tAuth = useTranslations("AuthLayout");

    return (
        <aside className="h-16 bg-card flex gap-1 items-center justify-center border-t" aria-label="Auth navigation">
            <p className="text-center text-sm font-semibold tracking-wide" aria-live="polite">
                {!isLoginMode ? tAuth("haveAccount") : tAuth("noAccount")}
            </p>
            <button
                onClick={() => onModeChange(isLoginMode ? "signup" : "login")}
                className="text-sm font-semibold text-brand hover:underline"
            >
                {!isLoginMode ? tAuth("login") : tAuth("signUp")}
            </button>
        </aside>
    );
}
