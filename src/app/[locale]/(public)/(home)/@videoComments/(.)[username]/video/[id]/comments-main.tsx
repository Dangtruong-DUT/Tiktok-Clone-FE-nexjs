interface CommentsMainProps {
    postId: string;
}

export default function CommentsMain({ postId }: CommentsMainProps) {
    return <div className="size-full">Comments Main Section for Post ID: {postId}</div>;
}
