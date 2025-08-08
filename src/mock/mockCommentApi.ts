import { CommentType } from "@/types/schemas/comment.schemas";

const USERS = [
    {
        id: "u1",
        name: "Alice",
        username: "alice123",
        avatar: "https://i.pravatar.cc/100?img=1",
    },
    {
        id: "u2",
        name: "Bob",
        username: "bobby",
        avatar: "https://i.pravatar.cc/100?img=2",
    },
    {
        id: "u3",
        name: "Charlie",
        username: "charlieboy",
        avatar: "https://i.pravatar.cc/100?img=3",
    },
];

const PAGE_SIZE = 3;

function randomUser() {
    return USERS[Math.floor(Math.random() * USERS.length)];
}

function randomContent() {
    const contents = [
        "This is awesome!",
        "Where is this??",
        "Hahaha that was funny 😂",
        "Can't stop watching",
        "My neck hurts now",
        "Tara G",
        "Wanna go here!",
        "PUNT AHAN NATIN!!",
    ];
    return contents[Math.floor(Math.random() * contents.length)];
}

function formatDate(date: Date): string {
    return date.toISOString();
}

function generateComments(postId: string, parentId: string | null, count: number): CommentType[] {
    const now = new Date();
    const comments: CommentType[] = [];
    for (let i = 0; i < count; i++) {
        const user = randomUser();
        const id = `${parentId ? parentId + "-r" : "c"}${i} ${Math.random().toString(36).substring(2, 9)}`;
        comments.push({
            id,
            postId,
            parentId,
            user,
            content: randomContent(),
            reply_count: parentId === null ? 6 : 0,
            createdAt: formatDate(new Date(now.getTime() - i * 100000)),
            updatedAt: formatDate(new Date(now.getTime() - i * 100000)),
        });
    }
    return comments;
}

const commentMap = new Map<string, CommentType[]>();

export async function fetchCommentsByPostId(postId: string, page: number) {
    if (!commentMap.has(postId)) {
        commentMap.set(postId, generateComments(postId, null, 12));
    }

    const all = commentMap.get(postId)!;
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return new Promise<{ comments: CommentType[]; totalPages: number }>((resolve) => {
        setTimeout(() => {
            resolve({
                comments: all.slice(start, end),
                totalPages: Math.ceil(all.length / PAGE_SIZE),
            });
        }, 300);
    });
}

export async function fetchRepliesByCommentId(commentId: string, page: number) {
    if (!commentMap.has(commentId)) {
        commentMap.set(commentId, generateComments("post1", commentId, 10));
    }

    const all = commentMap.get(commentId)!;
    const start = (page - 1) * PAGE_SIZE;
    const end = start + PAGE_SIZE;

    return new Promise<{ replies: CommentType[]; hasMore: boolean }>((resolve) => {
        setTimeout(() => {
            resolve({
                replies: all.slice(start, end),
                hasMore: end < all.length,
            });
        }, 300);
    });
}
