"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useCallback } from "react";
import { toast } from "sonner";
import { handleFormError } from "@/utils/handleErrors/handleFormErrors";
import { ChangePasswordBody, ChangePasswordBodyType } from "@/utils/validations/user.schema";
import { useChangePasswordMutation } from "@/services/RTK/user.services";
import { Loader } from "lucide-react";

export default function ChangePasswordForm() {
    const t = useTranslations("TiktokStudio.settings");
    const [changePasswordMutate, changePasswordResult] = useChangePasswordMutation();

    const form = useForm<ChangePasswordBodyType>({
        resolver: zodResolver(ChangePasswordBody),
        defaultValues: {
            current_password: "",
            password: "",
            confirm_password: "",
        },
    });

    const handleSubmit = useCallback(
        async (data: ChangePasswordBodyType) => {
            if (changePasswordResult.isLoading) return;
            try {
                const res = await changePasswordMutate(data).unwrap();
                toast.success(res.message);
                form.reset();
            } catch (error) {
                handleFormError<ChangePasswordBodyType>({
                    error: error,
                    setFormError: form.setError,
                });
            }
        },
        [form, changePasswordMutate, changePasswordResult]
    );
    const onReset = () => {
        form.reset();
    };

    return (
        <Form {...form}>
            <form
                noValidate
                className="grid auto-rows-max items-start gap-4 md:gap-8"
                onSubmit={form.handleSubmit(handleSubmit)}
                onReset={onReset}
                method="POST"
            >
                <Card className="overflow-hidden" x-chunk="dashboard-07-chunk-4">
                    <CardHeader>
                        <CardTitle className="font-bold">{t("changePassword.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            <FormField
                                control={form.control}
                                name="current_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="grid gap-3">
                                            <Label
                                                htmlFor="oldPassword"
                                                className="font-semibold text-muted-foreground"
                                            >
                                                {t("changePassword.oldPassword")}
                                            </Label>
                                            <PasswordInput
                                                id="oldPassword"
                                                className="brand-input bg-muted! border-none!"
                                                {...field}
                                            />
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="grid gap-3">
                                            <Label htmlFor="password" className="font-semibold text-muted-foreground">
                                                {t("changePassword.newPassword")}
                                            </Label>
                                            <PasswordInput
                                                id="password"
                                                className="brand-input bg-muted! border-none!"
                                                {...field}
                                            />
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="confirm_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="grid gap-3">
                                            <Label
                                                htmlFor="confirmPassword"
                                                className="font-semibold text-muted-foreground"
                                            >
                                                {t("changePassword.confirmPassword")}
                                            </Label>
                                            <PasswordInput
                                                id="confirmPassword"
                                                className="brand-input bg-muted! border-none!"
                                                {...field}
                                            />
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <div className=" items-center gap-2 md:ml-auto flex">
                                <Button variant="outline" size="sm" type="reset" className="min-w-[90px]">
                                    {t("changePassword.cancel")}
                                </Button>
                                <Button
                                    size="sm"
                                    type="submit"
                                    disabled={changePasswordResult.isLoading}
                                    className="bg-brand hover:bg-brand/90 w-[90px] flex items-center justify-center [&_svg]:size-5! cursor-pointer text-white"
                                >
                                    {changePasswordResult.isLoading ? (
                                        <Loader className="animate-spin" />
                                    ) : (
                                        t("changePassword.save")
                                    )}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
