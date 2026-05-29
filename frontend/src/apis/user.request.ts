import httpClient from '@/apis/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import { GetUserProfileResType } from '@/types/dtos/user/user-response.dto'

const userRequestApi = {
    getUserByUsername: (username: string) =>
        httpClient.get<GetUserProfileResType>(BACKEND_API_ENDPOINT.USER.BY_USERNAME(username))
}

export default userRequestApi
