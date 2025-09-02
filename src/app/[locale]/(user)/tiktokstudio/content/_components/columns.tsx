"use client";

import { getAudienceNameFromEnum } from "@/helper/getNameFromStatus";
import { useTranslations } from "next-intl";
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
import { usePostTableContext } from "@/app/[locale]/(user)/tiktokstudio/content/_context/content-table.context";
import { BsFillImageFill } from "react-icons/bs";
import { useMemo, useState } from "react";
import { TikTokPostType } from "@/types/schemas/TikTokPost.schemas";
import VideoDetailDialog from "@/components/video-dialog";

export function useColumns(): ColumnDef<TikTokPostType>[] {
    const t = useTranslations("TiktokStudio.content.table");

    return useMemo(
        () => [
            {
                accessorKey: "content",
                header: t("columns.content"),
                cell: function Content({ row }) {
                    const [isModalDetailOpen, setIsModalDetailOpen] = useState<boolean>(false);
                    const { thumbnail_url, content, created_at } = row.original;
                    return (
                        <div className="flex gap-4 items-center">
                            {thumbnail_url && (
                                <Image
                                    src={thumbnail_url}
                                    width={60}
                                    height={80}
                                    alt=""
                                    className="object-cover w-[60px] h-[80px] rounded-md"
                                />
                            )}
                            {!thumbnail_url && (
                                <div className="w-[60px] h-[80px] flex items-center justify-center bg-card rounded-md border">
                                    <BsFillImageFill />
                                </div>
                            )}
                            <div className="flex flex-col gap-[7px]">
                                <span
                                    className="truncate font-medium text-sm inline-block max-w-[100px] hover:underline cursor-pointer"
                                    onClick={() => setIsModalDetailOpen(true)}
                                >
                                    {content}
                                </span>

                                <span className="text-muted-foreground text-xs">
                                    {formatISOToDisplayDate(created_at)}
                                </span>
                            </div>
                            <VideoDetailDialog
                                isVisible={isModalDetailOpen}
                                handleClose={() => setIsModalDetailOpen(false)}
                                post={row.original}
                            />
                        </div>
                    );
                },
            },
            {
                accessorKey: "audience",
                header: t("columns.privacy"),
                cell: function PrivacySelect({ row }) {
                    const originalRow = row.original;
                    const { changeAudienceStatus } = usePostTableContext();

                    const onChangeStatus = (status: string) => {
                        changeAudienceStatus({ status: Number(status), postId: originalRow._id });
                    };

                    return (
                        <Select value={row.getValue("audience")?.toString()} onValueChange={onChangeStatus}>
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
                header: t("columns.views"),
                cell: ({ row }) => {
                    const originalRow = row.original;
                    const userViews = Number(originalRow.user_views);
                    const guestViews = Number(originalRow.guest_views);
                    return <div className="capitalize ">{formatCash.format(userViews + guestViews)}</div>;
                },
            },
            {
                accessorKey: "comments_count",
                header: t("columns.comments"),
                cell: ({ row }) => (
                    <div className="capitalize ">{formatCash.format(row.getValue("comments_count"))}</div>
                ),
            },
            {
                header: t("columns.actions"),
                cell: function Actions({ row }) {
                    const post = row.original;
                    const { setPostIdDelete } = usePostTableContext();

                    return (
                        <div className="flex gap-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href={`/tiktokstudio/upload/post/${post._id}?from=${encodeURIComponent(
                                            "/tiktokstudio/content"
                                        )}`}
                                    >
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            className="rounded-full text-muted-foreground cursor-pointer"
                                        >
                                            <PencilLine />
                                        </Button>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent>
                                    <p>{t("actions.edit")}</p>
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
                                        onClick={() => setPostIdDelete(post._id)}
                                    >
                                        <Trash2 />
                                        <span>{t("actions.delete")}</span>
                                    </Button>
                                </PopoverContent>
                            </Popover>
                        </div>
                    );
                },
            },
        ],
        [t]
    );
}
