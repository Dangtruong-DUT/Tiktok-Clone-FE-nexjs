"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useTranslations } from "next-intl";
import { resetPasswordBody, ResetPasswordBodyType } from "@/utils/validations/auth.schema";

export default function ResetPasswordForm() {
    const t = useTranslations("resetPasswordPage");

    const form = useForm<ResetPasswordBodyType>({
        resolver: zodResolver(resetPasswordBody),
        defaultValues: {
            confirm_password: "",
            password: "",
        },
    });

    const onSubmit = async (data: ResetPasswordBodyType) => {
        toast.error("This feature is not implemented yet.");
        console.log("Form submitted with data:", data);
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-2.25">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder={t("newPasswordPlaceholder")} {...field} className="brand-input " />
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
                                    className="brand-input "
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="primary-button w-full" disabled={false}>
                    {t("submit")}
                </Button>
            </form>
        </Form>
    );
}
