import httpClient from "@/apis/client";
import { GetPostDetailRes } from "@/types/response/post.type";

const PostRequestApi = {
    getPostDetailById: (postId: string) => httpClient.get<GetPostDetailRes>(`/posts/${postId}`),
};

export default PostRequestApi;
