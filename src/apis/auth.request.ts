import httpClient from "@/apis/client";
import { API_ENDPOINT } from "@/config/endpoint.config";
import { LoginResponseType, LogoutResType, RefreshTokenRes, RegisterResponseType } from "@/types/response/auth.type";
import {
    LoginReqBodyType,
    LogoutReqBodyType,
    RefreshTokenReqBodyType,
    RegisterReqBodyType,
} from "@/utils/validations/auth.schema";

const AuthRequestApi = {
    login: (body: LoginReqBodyType) => httpClient.post<LoginResponseType>(API_ENDPOINT.API_LOGIN, body),
    register: (body: RegisterReqBodyType) => httpClient.post<RegisterResponseType>(API_ENDPOINT.API_REGISTER, body),
    logout: (data: LogoutReqBodyType & { access_token: string }) => {
        const { access_token, ...body } = data;
        return httpClient.post<LogoutResType>(API_ENDPOINT.API_LOGOUT, body, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
    },

    refreshToken: (data: RefreshTokenReqBodyType & { access_token: string }) => {
        const { access_token, ...body } = data;
        return httpClient.post<RefreshTokenRes>(API_ENDPOINT.API_REFRESH_TOKEN, body, {
            headers: {
                Authorization: `Bearer ${access_token}`,
            },
        });
    },
};

export default AuthRequestApi;
