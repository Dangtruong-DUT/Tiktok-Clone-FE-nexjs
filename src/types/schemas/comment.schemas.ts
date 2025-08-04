export interface Comment {
    id: string;
    postId: string;
    parentId: string | null;
    user: {
        id: string;
        name: string;
        avatar: string;
        username: string;
    };
    content: string;
    createdAt: Date;
    updatedAt: Date;
}
