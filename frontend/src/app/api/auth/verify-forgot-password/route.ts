import AuthRequestApi from "@/apis/auth.request";
import { HTTP_STATUS } from "@/constants/http";
import { HttpError } from "@/types/errors";
import { verifyForgotPasswordReqBodyType } from "@/utils/validations/auth.schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const body = (await request.json()) as verifyForgotPasswordReqBodyType;
    try {
        const response = await AuthRequestApi.verifyForgotPassword(body);
        return NextResponse.json(response);
    } catch (error) {
        if (error instanceof HttpError) {
            return NextResponse.json(error.data, { status: error.status });
        } else {
            console.error("Verify forgot password error:", error);
            return NextResponse.json(
                { message: "An unexpected error occurred while verifying reset token." },
                { status: HTTP_STATUS.INTERNAL_SERVER_STATUS }
            );
        }
    }
}
