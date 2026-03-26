import httpClient from '@/apis/client'
import { GetPostDetailRes } from '@/types/dtos/post/post-response.dto'

const PostRequestApi = {
    getPostDetailById: (postId: string) => httpClient.get<GetPostDetailRes>(`/posts/${postId}`)
}

export default PostRequestApi
