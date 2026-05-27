'use client'

import { ColumnDef, flexRender, Table as TanstackTable } from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

interface DataTableProps<TData, TValue> {
    table: TanstackTable<TData>
    columns: ColumnDef<TData, TValue>[]
    emptyText?: string
}

export function DataTable<TData, TValue>({ table, columns, emptyText = 'No results.' }: DataTableProps<TData, TValue>) {
    return (
        <div className='border bg-background overflow-hidden'>
            <Table dividers>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id} className='hover:bg-transparent'>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(header.column.columnDef.header, header.getContext())}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={row.getIsSelected() && 'selected'}
                                className='hover:bg-muted/40 transition-colors'
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className='h-24 text-center text-sm text-muted-foreground'
                            >
                                {emptyText}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}
