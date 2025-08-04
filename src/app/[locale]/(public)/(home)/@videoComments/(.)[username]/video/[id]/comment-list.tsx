"use client";

import { useParams } from "next/navigation";

export default function CommentList() {
    const { id } = useParams();

    return <div className="size-full">Comments Main Section for Post ID: {id}</div>;
}
