"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader, Upload } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { UpdateUserBody, UpdateUserBodyType } from "@/utils/validations/user.schema";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { useUpdateMeMutation } from "@/services/RTK/user.services";
import { useUploadImageMutation } from "@/services/RTK/upload.services";
import { handleFormError } from "@/utils/handleErrors/handleFormErrors";

export default function UpdateProfileForm() {
    const t = useTranslations("TiktokStudio.settings");
    const [fileImage, setFileImage] = useState<File | null>(null);
    const avatarPreviewRef = useRef<HTMLInputElement>(null);

    const [updateProfileMutateAsync, { isLoading: isUpdatingProfile }] = useUpdateMeMutation();
    const [uploadImageMutateAsync, { isLoading: isUploadingAvatar }] = useUploadImageMutation();

    const form = useForm<UpdateUserBodyType>({
        resolver: zodResolver(UpdateUserBody),
        defaultValues: {
            name: "",
            avatar: undefined,
        },
        mode: "onChange",
    });

    const user = useCurrentUserData();

    useEffect(() => {
        form.reset({
            name: user?.name || "",
            avatar: user?.avatar || undefined,
        });
    }, [user, form]);

    const isLoading = isUploadingAvatar || isUpdatingProfile;

    const handleSubmit = useCallback(
        async (data: UpdateUserBodyType) => {
            if (isLoading) return;

            try {
                if (fileImage) {
                    const formData = new FormData();
                    formData.append("file", fileImage);
                    const uploadResponse = await uploadImageMutateAsync(formData).unwrap();
                    data.avatar = uploadResponse.data[0].url;
                } else {
                    data.avatar = user?.avatar || undefined;
                }
                const updateProfileRes = await updateProfileMutateAsync(data).unwrap();
                const { avatar, name } = updateProfileRes.data;

                form.reset({
                    avatar: avatar || "",
                    name,
                });
                toast.success(updateProfileRes.message);
            } catch (error) {
                handleFormError<UpdateUserBodyType>({
                    error: error,
                    setFormError: form.setError,
                });
            }
        },
        [form, uploadImageMutateAsync, updateProfileMutateAsync, user?.avatar, isLoading, fileImage]
    );

    const avatarSrc = useMemo(
        () => (fileImage != null ? URL.createObjectURL(fileImage) : user?.avatar ?? undefined),
        [fileImage, user?.avatar]
    );
    const onReset = useCallback(() => {
        form.reset();
        setFileImage(null);
    }, [form]);
    const handleChangeAvatar = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files?.[0] || null;
            setFileImage(selectedFile);
            form.setValue("avatar", selectedFile ? URL.createObjectURL(selectedFile) : "");
        },
        [form]
    );
    return (
        <Form {...form}>
            <form
                noValidate
                className="grid auto-rows-max items-start gap-4 md:gap-8"
                onSubmit={form.handleSubmit(handleSubmit)}
                method="POST"
                onReset={onReset}
            >
                <Card x-chunk="dashboard-07-chunk-0">
                    <CardHeader>
                        <CardTitle className="font-bold">{t("updateProfile.title")}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6">
                            <FormField
                                control={form.control}
                                name="avatar"
                                render={({}) => (
                                    <FormItem>
                                        <div className="flex gap-2 items-start justify-start">
                                            <Avatar className="aspect-square w-[100px] h-[100px] rounded-md object-cover">
                                                <AvatarImage src={avatarSrc} className="shrink-0 object-cover" />
                                                <AvatarFallback className="rounded-none">
                                                    {user?.name.split(" ").at(-1) || t("updateProfile.defaultUser")}
                                                </AvatarFallback>
                                            </Avatar>

                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                ref={avatarPreviewRef}
                                                onChange={handleChangeAvatar}
                                            />
                                            <button
                                                className="flex aspect-square w-[100px] items-center justify-center rounded-md border border-dashed"
                                                type="button"
                                                onClick={() => {
                                                    avatarPreviewRef.current?.click();
                                                }}
                                            >
                                                <Upload className="h-4 w-4 text-muted-foreground" />
                                                <span className="sr-only">{t("updateProfile.upload")}</span>
                                            </button>
                                        </div>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <div className="grid gap-3">
                                            <Label htmlFor="name" className="font-semibold text-muted-foreground">
                                                {t("updateProfile.fullNameLabel")}
                                            </Label>
                                            <Input
                                                id="name"
                                                type="text"
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
                                    {t("updateProfile.cancel")}
                                </Button>
                                <Button
                                    size="sm"
                                    type="submit"
                                    disabled={isLoading}
                                    className="bg-brand hover:bg-brand/90 w-[90px] flex items-center justify-center [&_svg]:size-5! cursor-pointer"
                                >
                                    {isLoading ? <Loader className="animate-spin" /> : t("updateProfile.save")}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </form>
        </Form>
    );
}
