import { GoBack } from "@/app/[locale]/(public)/(auth)/login/email/button-go-back";
import { LoginForm } from "@/app/[locale]/(public)/(auth)/login/email/form-login";
import { getTranslations } from "next-intl/server";

export default async function EmailLoginPage() {
    const t = await getTranslations("LoginPage");

    return (
        <div className="w-full">
            <h1 className="text-3xl my-4 font-bold text-center mt-16">{t("email.title")}</h1>
            <LoginForm />
            <GoBack />
        </div>
    );
}
