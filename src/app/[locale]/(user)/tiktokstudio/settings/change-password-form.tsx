"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
                        <CardTitle>Change Password</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            <FormField
                                control={form.control}
                                name="current_password"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="grid gap-3">
                                            <Label htmlFor="oldPassword">Old Password</Label>
                                            <Input id="oldPassword" type="password" className="w-full" {...field} />
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
                                            <Label htmlFor="password">New Password</Label>
                                            <Input id="password" type="password" className="w-full" {...field} />
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
                                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                                            <Input id="confirmPassword" type="password" className="w-full" {...field} />
                                            <FormMessage />
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <div className=" items-center gap-2 md:ml-auto flex">
                                <Button variant="outline" size="sm" type="reset" className="min-w-[70px]">
                                    Cancel
                                </Button>
                                <Button
                                    size="sm"
                                    type="submit"
                                    disabled={changePasswordResult.isLoading}
                                    className="min-w-[70px]"
                                >
                                    {changePasswordResult.isLoading ? <Loader className="animate-spin" /> : "Save"}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
