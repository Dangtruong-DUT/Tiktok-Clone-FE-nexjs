import { GoBack } from "@/app/[locale]/(public)/(auth)/button-go-back";
import ForgotPasswordForm from "@/app/[locale]/(public)/(auth)/forgot-password/forgot-password-form";
import { getTranslations } from "next-intl/server";

export default async function ForgotPasswordPage() {
    const t = await getTranslations("forgotPasswordPage");
    return (
        <div className="w-full max-w-sm mx-auto px-4 ">
            <h1 className="text-3xl my-4 font-bold text-center mt-16">{t("title")}</h1>
            <ForgotPasswordForm />
            <GoBack />
        </div>
    );
}
