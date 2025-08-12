"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { useTranslations } from "next-intl";
import DateTimePicker from "@/components/date-time-picker";
import { RegisterReqBody, RegisterReqBodyType } from "@/utils/validations/auth.schema";
import { useRouter } from "@/i18n/navigation";
import { useRegisterMutation } from "@/services/RTK/auth.services";
import { Loader } from "lucide-react";
import { handleFormError } from "@/utils/handleErrors/handleFormErrors";

export default function SignUpForm() {
    const t = useTranslations("SignUpPage.email");
    const router = useRouter();

    const [registerMutate, registerResult] = useRegisterMutation();

    const form = useForm<RegisterReqBodyType>({
        resolver: zodResolver(RegisterReqBody),
        defaultValues: {
            email: "",
            password: "",
            confirm_password: "",
            name: "",
            date_of_birth: "",
        },
    });

    const onSubmit = async (data: RegisterReqBodyType) => {
        try {
            const result = await registerMutate(data).unwrap();
            router.push("/");
            toast.success(result.message);
        } catch (error) {
            handleFormError<RegisterReqBodyType>({
                error,
                setFormError: form.setError,
            });
        }
    };
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-2.25">
                <FormField
                    control={form.control}
                    name="date_of_birth"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>{t("dateOfBirthLabel")}</FormLabel>
                            <FormControl>
                                <DateTimePicker {...field} />
                            </FormControl>
                            <FormDescription>{t("dateOfBirthDescription")}</FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input placeholder={t("namePlaceholder")} {...field} className="brand-input " />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
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
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormControl>
                                <Input
                                    placeholder={t("passwordPlaceholder")}
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
                    disabled={registerResult.isLoading}
                >
                    {registerResult.isLoading ? (
                        <Loader className="animate-spin font-semibold text-brand" />
                    ) : (
                        t("submit")
                    )}
                </Button>
            </form>
        </Form>
    );
}
