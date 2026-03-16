import httpClient from "@/apis/client";
import { GetUserProfileResType } from "@/types/response/user.type";

const userRequestApi = {
    getUserByUsername: (username: string) => httpClient.get<GetUserProfileResType>(`/users/${username}`),
};

export default userRequestApi;
