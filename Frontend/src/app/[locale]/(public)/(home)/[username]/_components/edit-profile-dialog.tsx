"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit3, Loader, Pencil } from "lucide-react";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useUpdateMeMutation } from "@/services/RTK/user.services";
import { UpdateUserBody, UpdateUserBodyType } from "@/utils/validations/user.schema";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { handleFormError } from "@/utils/handleErrors/handleFormErrors";
import envConfig from "@/config/app.config";
import { usePathname, useRouter } from "@/i18n/navigation";
import { clearStore } from "@/store";
import { useAppDispatch } from "@/hooks/redux";
import { useTranslations } from "next-intl";
import PhotoEditorDialog from "@/components/photo-editor-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUploadImageMutation } from "@/services/RTK/upload.services";

export default function EditProfileDialog() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname();
    const router = useRouter();
    const dispatch = useAppDispatch();
    const currentUser = useCurrentUserData();
    const t = useTranslations("ProfilePage.editProfileDialog");
    const ta = useTranslations("ProfilePage.actions");
    const [updateProfile, { isLoading: isUpdatingProfile }] = useUpdateMeMutation();
    const [uploadImageMutateAsync, { isLoading: isUploadingAvatar }] = useUploadImageMutation();

    const isLoading = isUploadingAvatar || isUpdatingProfile;

    const [fileImage, setFileImage] = useState<File | null>(null);
    const avatarPreviewRef = useRef<HTMLInputElement>(null);
    const [isPhotoEditorVisible, setIsPhotoEditorVisible] = useState<boolean>(false);

    const form = useForm<UpdateUserBodyType>({
        resolver: zodResolver(UpdateUserBody),
        defaultValues: {
            username: "",
            name: "",
            bio: "",
            avatar: "",
        },
    });

    useEffect(() => {
        if (currentUser) {
            form.reset({
                username: currentUser.username,
                name: currentUser.name,
                bio: currentUser.bio,
                avatar: currentUser.avatar,
            });
        }
    }, [currentUser, form]);

    async function onSubmit(values: UpdateUserBodyType) {
        if (isLoading || !currentUser) return;
        try {
            if (fileImage) {
                const formData = new FormData();
                formData.append("file", fileImage);
                const uploadResponse = await uploadImageMutateAsync(formData).unwrap();
                values.avatar = uploadResponse.data[0].url;
            } else {
                values.avatar = currentUser?.avatar || undefined;
            }

            const oldUsername = currentUser.username;

            await updateProfile(values).unwrap();
            if (typeof pathname === "string" && typeof values?.username === "string") {
                const newURL = pathname.replace(oldUsername, values.username);
                router.replace(newURL);
            } else {
                router.refresh();
            }
            clearStore(dispatch);
            setOpen(false);
        } catch (error) {
            handleFormError<UpdateUserBodyType>({
                error,
                setFormError: form.setError,
            });
        }
    }

    const onReset = () => {
        form.reset();
    };

    const avatarSrc = useMemo(
        () => (fileImage != null ? URL.createObjectURL(fileImage) : currentUser?.avatar ?? undefined),
        [fileImage, currentUser?.avatar]
    );

    const handleChangeAvatar = (e: ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0] || null;
        setFileImage(selectedFile);

        if (selectedFile) {
            setIsPhotoEditorVisible(true);
        }
        e.target.value = "";
        form.setValue("avatar", selectedFile ? URL.createObjectURL(selectedFile) : "");
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    className="primary-button h-10! rounded-md! text-base! font-medium! cursor-pointer"
                >
                    <span className="flex justify-center items-center mr-1">
                        <Edit3 size={19} />
                    </span>
                    <span className="max-md:hidden">{ta("editProfile")}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] p-0 max-h-[90vh] overflow-y-auto">
                <DialogHeader className="px-8 py-4 border-b">
                    <DialogTitle className="text-xl font-semibold">{t("title")}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <PhotoEditorDialog
                        setVisible={setIsPhotoEditorVisible}
                        isVisible={isPhotoEditorVisible}
                        photoUrl={avatarSrc!}
                        onConfirm={setFileImage}
                    />
                    <form onSubmit={form.handleSubmit(onSubmit)} onReset={onReset} className="px-8 py-4">
                        <FormField
                            control={form.control}
                            name="avatar"
                            render={({}) => (
                                <FormItem>
                                    <div className="mb-6 flex flex-row items-center relative justify-center  ">
                                        <FormLabel className="text-base font-semibold absolute left-0 top-1/2 transform -translate-y-1/2">
                                            {t("avatar.label")}
                                        </FormLabel>
                                        <div className="relative w-fit h-fit">
                                            <Avatar className="aspect-square w-[100px] h-[100px] rounded-full object-cover">
                                                <AvatarImage src={avatarSrc} className="shrink-0 object-cover" />
                                                <AvatarFallback className="rounded-none">
                                                    {currentUser?.name.split(" ").at(-1) || ""}
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
                                                className="absolute z-2 cursor-pointer bg-accent border-white flex aspect-square w-8 rounded-full items-center justify-center border  bottom-0 right-0 -translate-y-0.5 -translate-x-0.5"
                                                type="button"
                                                onClick={() => {
                                                    avatarPreviewRef.current?.click();
                                                }}
                                            >
                                                <Pencil className="h-4 w-4 text-muted-foreground" />
                                            </button>
                                        </div>
                                    </div>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem className="mb-6">
                                    <FormLabel className="text-base font-semibold">{t("username.label")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={t("username.placeholder")}
                                            className="h-11 text-base"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {t("username.profileUrl", {
                                            url: envConfig.NEXT_PUBLIC_URL,
                                            username: field.value?.toString() ?? "",
                                        })}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">{t("username.hint")}</p>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem className="mb-6">
                                    <FormLabel className="text-base font-semibold">{t("name.label")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            placeholder={t("name.placeholder")}
                                            className="h-11 text-base"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-sm text-muted-foreground mt-1">{t("name.hint")}</p>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="bio"
                            render={({ field }) => (
                                <FormItem className="mb-6">
                                    <FormLabel className="text-base font-semibold">{t("bio.label")}</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            {...field}
                                            placeholder={t("bio.placeholder")}
                                            className="resize-none min-h-[120px] text-base"
                                            maxLength={80}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    <div className="text-sm text-muted-foreground text-right mt-1">
                                        {field.value?.length || 0}/80
                                    </div>
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-3 pt-4 border-t">
                            <Button type="reset" variant="outline" className="h-8 px-8 w-[96px] text-sm font-semibold">
                                {t("buttons.cancel")}
                            </Button>
                            <Button
                                type="submit"
                                className="h-8  w-[96px] px-8 text-sm font-semibold bg-brand hover:bg-brand/90 text-white"
                                disabled={isLoading}
                            >
                                {isLoading ? <Loader className="animate-spin" /> : t("buttons.save")}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
