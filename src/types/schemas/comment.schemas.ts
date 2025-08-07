export interface CommentType {
    id: string;
    postId: string;
    parentId: string | null;
    user: {
        id: string;
        name: string;
        avatar: string;
        username: string;
    };
    reply_count: number;
    content: string;
    createdAt: string;
    updatedAt: string;
}
