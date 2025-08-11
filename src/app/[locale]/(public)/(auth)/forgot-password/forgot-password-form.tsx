"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useTranslations } from "next-intl";
import { forgotPasswordReqBody, ForgotPasswordReqBodyType } from "@/utils/validations/auth.schema";
import { useForgotPasswordMutation } from "@/services/RTK/user.services";
import { Loader, Home } from "lucide-react";
import { handleFormError } from "@/utils/handleErrors/handleFormErrors";
import { useState } from "react";
import { Link } from "@/i18n/navigation";
import EmailSentConfirmation from "./email-sent-confirmation";

export default function ForgotPasswordForm() {
    const t = useTranslations("forgotPasswordPage");
    const [emailSent, setEmailSent] = useState(false);
    const [sentEmail, setSentEmail] = useState("");

    const [forgotPasswordMutate, forgotPasswordResult] = useForgotPasswordMutation();

    const form = useForm<ForgotPasswordReqBodyType>({
        resolver: zodResolver(forgotPasswordReqBody),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordReqBodyType) => {
        try {
            const result = await forgotPasswordMutate(data).unwrap();
            toast.success(result.message);
            setSentEmail(data.email);
            setEmailSent(true);
            form.reset();
        } catch (error) {
            handleFormError<ForgotPasswordReqBodyType>({
                error,
                setFormError: form.setError,
            });
        }
    };

    // Email confirmation screen
    if (emailSent) {
        return <EmailSentConfirmation sentEmail={sentEmail} onSendAnotherEmail={() => setEmailSent(false)} />;
    }
    // Original forgot password form
    return (
        <div className="space-y-4">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-2.25">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder={t("emailPlaceholder")} {...field} className="brand-input " />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        className="primary-button w-full flex items-center justify-center [&_svg]:size-5!"
                        disabled={forgotPasswordResult.isLoading}
                    >
                        {forgotPasswordResult.isLoading ? (
                            <Loader className="animate-spin font-semibold text-brand" />
                        ) : (
                            t("submit")
                        )}
                    </Button>
                </form>
            </Form>

           
        </div>
    );
}
