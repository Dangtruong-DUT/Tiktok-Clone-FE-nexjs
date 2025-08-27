"use client";

import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<TikTokPostType>[] = [
    {
        accessorKey: "content",
        header: "Content (Created on)",
    },
    {
        accessorKey: "Privacy",
        header: "Privacy",
    },
    {
        accessorKey: "Views",
        header: "Views",
    },
    {
        accessorKey: "Comments",
        header: "Comments",
        cell: ({ row }) => <div className="capitalize">{row.getValue("comments")}</div>,
    },
    {
        accessorKey: "Actions",
        header: "Actions",
    },
];
