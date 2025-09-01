"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useTranslations } from "next-intl";
import { resetPasswordReqBody, ResetPasswordReqBodyType } from "@/utils/validations/auth.schema";
import { useResetPasswordMutation } from "@/services/RTK/user.services";
import { Loader } from "lucide-react";
import { handleFormError } from "@/utils/handleErrors/handleFormErrors";
import { useState } from "react";
import ResetPasswordSuccess from "./reset-password-success";

interface ResetPasswordFormProps {
    token: string;
}

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
    const t = useTranslations("resetPasswordPage");
    const [resetSuccess, setResetSuccess] = useState(false);

    const [resetPasswordMutate, resetPasswordResult] = useResetPasswordMutation();

    const form = useForm<ResetPasswordReqBodyType>({
        resolver: zodResolver(resetPasswordReqBody),
        defaultValues: {
            forgot_password_token: token,
            confirm_password: "",
            password: "",
        },
    });

    const onSubmit = async (data: ResetPasswordReqBodyType) => {
        try {
            const result = await resetPasswordMutate(data).unwrap();
            toast.success(result.message);
            setResetSuccess(true);
            form.reset();
        } catch (error) {
            handleFormError<ResetPasswordReqBodyType>({
                error,
                setFormError: form.setError,
            });
        }
    };

    if (resetSuccess) {
        return <ResetPasswordSuccess />;
    }
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-2.25">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder={t("newPasswordPlaceholder")}
                                    {...field}
                                    className="brand-input"
                                    type="password"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="confirm_password"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder={t("confirmPasswordPlaceholder")}
                                    {...field}
                                    className="brand-input"
                                    type="password"
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    className="primary-button w-full flex items-center justify-center [&_svg]:size-5!"
                    disabled={resetPasswordResult.isLoading}
                >
                    {resetPasswordResult.isLoading ? (
                        <Loader className="animate-spin font-semibold text-brand" />
                    ) : (
                        t("submit")
                    )}
                </Button>
            </form>
        </Form>
    );
}
