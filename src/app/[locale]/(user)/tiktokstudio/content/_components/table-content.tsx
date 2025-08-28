"use client";

import {
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

import { useEffect, useState } from "react";

import { SearchParamsLoader, useSearchParamsLoader } from "@/components/searchparams-loader";
import { useGetPostOfUserPagingQuery } from "@/services/RTK/posts.services";
import useCurrentUserData from "@/hooks/data/useCurrentUserData";
import { columns } from "@/app/[locale]/(user)/tiktokstudio/content/_components/columns";
import { DataTable } from "@/components/ui/data-table";
import AutoPagination from "@/components/auto-pagination";
import { Input } from "@/components/ui/input";
import AlertDialogDeleteDish from "@/app/[locale]/(user)/tiktokstudio/content/_components/alert-confirm-delete-post";
import { usePostTableContext } from "@/app/[locale]/(user)/tiktokstudio/content/_context/content-table.context";

export default function TableContent() {
    const currentUser = useCurrentUserData();
    const { searchParams, setSearchParams } = useSearchParamsLoader();

    // page param mặc định 1, nhưng TanStack dùng pageIndex (0-based)
    const page = searchParams?.get("page") ? Number(searchParams.get("page")) : 1;

    const { setPostIdDelete, postIdDelete } = usePostTableContext();

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});
    const [pagination, setPagination] = useState({
        pageIndex: page - 1,
        pageSize: 10,
    });

    const { data: queryData } = useGetPostOfUserPagingQuery(
        {
            page: pagination.pageIndex + 1,
            userId: currentUser?._id || "",
        },
        { skip: !currentUser?._id }
    );

    const data = queryData?.data.posts || [];

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        autoResetPageIndex: false,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
        manualPagination: true,
        pageCount: queryData?.meta?.total_pages ?? -1,
    });

    useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            pageIndex: page - 1,
        }));
    }, [page]);

    return (
        <div className="w-full">
            <SearchParamsLoader onParamsReceived={setSearchParams} />
            <AlertDialogDeleteDish postIdDelete={postIdDelete} setPostIdDelete={setPostIdDelete} />
            <div className="flex items-center py-4">
                <Input
                    placeholder="Search for post description"
                    value={(table.getColumn("content")?.getFilterValue() as string) ?? ""}
                    onChange={(event) => table.getColumn("content")?.setFilterValue(event.target.value)}
                    className="max-w-sm ml-auto"
                />
            </div>

            <DataTable columns={columns} table={table} />

            <div className="flex items-center justify-end space-x-2 py-4">
                <div>
                    <AutoPagination
                        page={table.getState().pagination.pageIndex + 1}
                        pageSize={queryData?.meta?.total_pages || 1}
                        pathname="/tiktokstudio/content"
                    />
                </div>
            </div>
        </div>
    );
}
