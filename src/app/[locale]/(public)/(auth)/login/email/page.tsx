import { LoginForm } from "@/app/[locale]/(public)/(auth)/login/email/form-login";
import { ChevronLeft } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function EmailLoginPage() {
    const t = await getTranslations("LoginPage");

    return (
        <div className="w-full">
            <h1 className="text-3xl my-4 font-bold text-center mt-16">{t("email.title")}</h1>
            <LoginForm />
            <button className="mt-4  h-11 w-full flex items-center justify-center gap-2 rounded-xs cursor-pointer text-sm">
                <ChevronLeft />
                {t("goBack")}
            </button>
        </div>
    );
}
