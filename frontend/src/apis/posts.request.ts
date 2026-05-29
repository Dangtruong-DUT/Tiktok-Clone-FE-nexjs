import httpClient from '@/apis/client'
import { BACKEND_API_ENDPOINT } from '@/constants/api/endpoints'
import { GetPostDetailRes } from '@/types/dtos/post/post-response.dto'

const PostRequestApi = {
    getPostDetailById: (postId: string) =>
        httpClient.get<GetPostDetailRes>(BACKEND_API_ENDPOINT.POST.DETAIL(postId))
}

export default PostRequestApi
