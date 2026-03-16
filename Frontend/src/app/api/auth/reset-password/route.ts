import AuthRequestApi from "@/apis/auth.request";
import { HTTP_STATUS } from "@/constants/http";
import { HttpError } from "@/types/errors";
import { ResetPasswordReqBodyType } from "@/utils/validations/auth.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = (await request.json()) as ResetPasswordReqBodyType;
    try {
        const response = await AuthRequestApi.resetPassword(body);
        return NextResponse.json(response);
    } catch (error) {
        if (error instanceof HttpError) {
            return NextResponse.json(error.data, { status: error.status });
        } else {
            console.error("Reset password error:", error);
            return NextResponse.json(
                { message: "An unexpected error occurred while resetting password." },
                { status: HTTP_STATUS.INTERNAL_SERVER_STATUS }
            );
        }
    }
}
