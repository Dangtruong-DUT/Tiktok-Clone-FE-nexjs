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
    logout: (body: LogoutReqBodyType) => httpClient.post<LogoutResType>(API_ENDPOINT.API_LOGOUT, body),
    refreshToken: (body: RefreshTokenReqBodyType) =>
        httpClient.post<RefreshTokenRes>(API_ENDPOINT.API_REFRESH_TOKEN, body),
};

export default AuthRequestApi;
