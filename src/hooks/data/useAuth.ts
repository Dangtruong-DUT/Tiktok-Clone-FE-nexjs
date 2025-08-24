"use client";

import { useAppDispatch } from "@/hooks/redux";
import { useRouter } from "@/i18n/navigation";
import { useLoginMutation, useLogoutMutation, useRegisterMutation } from "@/services/RTK/auth.services";
import { clearStore } from "@/store";
import { LogoutResType } from "@/types/response/auth.type";
import { handleFormError } from "@/utils/handleErrors/handleFormErrors";
import { LoginReqBody, LoginReqBodyType, RegisterReqBody, RegisterReqBodyType } from "@/utils/validations/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

export function useLoginWithEmail() {
    const router = useRouter();
    const dispatch = useAppDispatch();

    const [loginMutate, loginResult] = useLoginMutation();

    const form = useForm<LoginReqBodyType>({
        resolver: zodResolver(LoginReqBody),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = useCallback(
        async (data: LoginReqBodyType) => {
            try {
                const result = await loginMutate(data).unwrap();
                router.push("/");
                toast.success(result.message);
                clearStore(dispatch);
            } catch (error) {
                handleFormError<LoginReqBodyType>({
                    error,
                    setFormError: form.setError,
                });
            }
        },
        [loginMutate, router, form.setError, dispatch]
    );
    return {
        form,
        onSubmit,
        loginResult,
    };
}

export function useRegisterWithEmail() {
    const router = useRouter();
    const dispatch = useAppDispatch();

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

    const onSubmit = useCallback(
        async (data: RegisterReqBodyType) => {
            try {
                const result = await registerMutate(data).unwrap();
                router.push("/");
                toast.success(result.message);
                clearStore(dispatch);
            } catch (error) {
                handleFormError<RegisterReqBodyType>({
                    error,
                    setFormError: form.setError,
                });
            }
        },
        [registerMutate, router, form.setError, dispatch]
    );

    return {
        form,
        onSubmit,
        registerResult,
    };
}

interface UseLogoutProps {
    onLogout?: () => void;
    onSuccess?: (data: LogoutResType) => void;
    onError?: (error: unknown) => void;
}
export function useLogout(props?: UseLogoutProps) {
    const [logoutMutate, logoutResult] = useLogoutMutation();
    const router = useRouter();
    const dispatch = useAppDispatch();

    const handleLogout = useCallback(async () => {
        props?.onLogout?.();
        try {
            const res = await logoutMutate().unwrap();
            router.replace("/");
            router.refresh();
            props?.onSuccess?.(res);
            clearStore(dispatch);
        } catch (error) {
            console.error("Logout error:", error);
            props?.onError?.(error);
        }
    }, [logoutMutate, router, props, dispatch]);

    return {
        handleLogout,
        logoutResult,
    };
}
