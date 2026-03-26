import httpClient from '@/apis/client'
import { GetUserProfileResType } from '@/types/dtos/user/user-response.dto'

const userRequestApi = {
    getUserByUsername: (username: string) => httpClient.get<GetUserProfileResType>(`/users/${username}`)
}

export default userRequestApi
