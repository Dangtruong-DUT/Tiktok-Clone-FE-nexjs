import AuthRequestApi from "@/apis/auth.request";
import { HTTP_STATUS } from "@/constants/http";
import { HttpError } from "@/types/errors";
import { ForgotPasswordReqBodyType } from "@/utils/validations/auth.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = (await request.json()) as ForgotPasswordReqBodyType;
    try {
        const response = await AuthRequestApi.forgotPassword(body);
        return NextResponse.json(response);
    } catch (error) {
        if (error instanceof HttpError) {
            return NextResponse.json(error.data, { status: error.status });
        } else {
            console.error("Forgot password error:", error);
            return NextResponse.json(
                { message: "An unexpected error occurred while processing forgot password request." },
                { status: HTTP_STATUS.INTERNAL_SERVER_STATUS }
            );
        }
    }
}
