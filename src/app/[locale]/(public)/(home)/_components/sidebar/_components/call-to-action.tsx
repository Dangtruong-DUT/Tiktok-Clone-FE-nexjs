import React from "react";
import { Button } from "@/components/ui/button";
type CallToActionProps ={
    isAuth: boolean;
}
export default function CallToAction({ isAuth }: CallToActionProps) {
    return (
        !isAuth ? (
            <div className="px-2 py-4">
                <Button variant="outline" size="lg" className="primary-button w-full h-10! rounded-[0.375rem]!">
                    Log in
                </Button>
            </div>
        ) : null
    );
}
