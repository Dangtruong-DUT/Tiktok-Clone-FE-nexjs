"use client";

import { getAudienceNameFromEnum } from "@/helper/getNameFromStatus";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import { ColumnDef } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { audienceStatusValues } from "@/constants/types";
import Image from "next/image";
import { formatISOToDisplayDate } from "@/utils/formatting/formatTime";
import { Button } from "@/components/ui/button";
import { Ellipsis, PencilLine, Trash2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { formatCash } from "@/utils/formatting/formatNumber";

export const columns: ColumnDef<TikTokPostType>[] = [
    {
        accessorKey: "content",
        header: "Content (Created on)",
        cell: ({ row }) => {
            const { thumbnail_url, content, created_at, author, _id } = row.original;
            return (
                <div className="flex gap-4 items-center">
                    <Image
                        src={thumbnail_url}
                        width={60}
                        height={80}
                        alt=""
                        className="object-cover w-[60px] h-[80px] rounded-md"
                    />
                    <div className="flex flex-col gap-[7px]">
                        <Link href={`/@${author.username}/${_id}`} className="font-medium hover:underline">
                            <span className="overflow-hidden text-ellipsis text-sm">{content}</span>
                        </Link>

                        <span className="text-muted-foreground text-xs">{formatISOToDisplayDate(created_at)}</span>
                    </div>
                </div>
            );
        },
    },
    {
        accessorKey: "audience",
        header: "Privacy",
        cell: ({ row }) => {
            return (
                <Select value={row.getValue("audience")?.toString()} onValueChange={() => {}}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select Privacy" />
                    </SelectTrigger>
                    <SelectContent>
                        {audienceStatusValues.map((status) => (
                            <SelectItem key={status} value={status.toString()}>
                                {getAudienceNameFromEnum(status)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        },
    },
    {
        accessorKey: "Views",
        header: "Views",
        cell: ({ row }) => {
            const originalRow = row.original;
            const userViews = Number(originalRow.user_views);
            const guestViews = Number(originalRow.guest_views);
            return <div className="capitalize ">{formatCash.format(userViews + guestViews)}</div>;
        },
    },
    {
        accessorKey: "comments_count",
        header: "Comments",
        cell: ({ row }) => <div className="capitalize ">{formatCash.format(row.getValue("comments_count"))}</div>,
    },
    {
        header: "Actions",
        cell: () => (
            <div className="flex gap-2">
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full text-muted-foreground cursor-pointer"
                        >
                            <PencilLine />
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Edit</p>
                    </TooltipContent>
                </Tooltip>

                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-full text-muted-foreground cursor-pointer"
                        >
                            <Ellipsis />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="p-1! max-w-fit!">
                        <Button
                            variant="ghost"
                            className=" cursor-pointer text-red-500 hover:text-red-600 w-full justify-start px-6!"
                        >
                            <Trash2 />
                            <span>Delete</span>
                        </Button>
                    </PopoverContent>
                </Popover>
            </div>
        ),
    },
];
