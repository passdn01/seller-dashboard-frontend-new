import React, { useState, useEffect } from 'react';
import SideNavbar from '../SideNavbar';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
    getSortedRowModel,
} from "@tanstack/react-table";
import axios from 'axios';
import Header from '../drivers/allDrivers/Header';
import { ArrowUpDown } from 'lucide-react';
import { Button } from "../ui/button";
function TSPMessagesTable() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [expandedRowId, setExpandedRowId] = useState(null);
    const [sorting, setSorting] = useState([]);

    const columns = [
        {
            id: "sno",
            header: "S.No.",
            cell: ({ row }) => <div>{(page - 1) * 10 + row.index + 1}</div>,
            enableHiding: false,
            enableSorting: false,
        },
        {
            id: "name",
            header: ({ column }) => (
                <div className="flex items-center gap-2">

                    Name


                </div>
            ),
            cell: ({ row }) => {
                const name = row.original.firstName + " " + row.original.lastName;
                return <div>{name}</div>;
            }
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => <div>{row.original.phone}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => <div>{row.getValue("email")}</div>,
            enableSorting: false,
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Sent On
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt"));
                const options = { day: 'numeric', month: 'long', year: 'numeric' };
                const formattedDate = date.toLocaleDateString('en-US', options);
                return <div>{formattedDate}</div>;
            },
            sortingFn: (rowA, rowB) => {
                const dateA = new Date(rowA.getValue("createdAt"));
                const dateB = new Date(rowB.getValue("createdAt"));
                return dateA.getTime() - dateB.getTime();
            }
        },
    ];

    useEffect(() => {
        fetchMessages();
    }, []);

    const tableData = React.useMemo(
        () => (loading ? Array(10).fill({}) : data),
        [loading, data]
    );

    const tableColumns = React.useMemo(
        () =>
            loading
                ? columns.map((column) => ({
                    ...column,
                    cell: () => (
                        <div className="h-8 bg-gray-100 rounded"></div>
                    )
                }))
                : columns,
        [loading]
    );

    const table = useReactTable({
        data: tableData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        manualPagination: false,
        pageCount: Math.ceil(tableData.length / 10),
        state: {
            pagination: {
                pageIndex: page - 1,
                pageSize: 10,
            },
            sorting,
        },
        onSortingChange: setSorting,
        onPaginationChange: (updater) => {
            if (typeof updater === 'function') {
                const newState = updater({ pageIndex: page - 1, pageSize: 10 });
                setPage(newState.pageIndex + 1);
            }
        },
        getPaginationRowModel: getPaginationRowModel(),
    });

    const fetchMessages = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/tsp/getMessages`);
            if (response?.data?.success) {
                setData(response.data.data);
                setTotal(response.data.data.length);
            }
        } catch (err) {
            setError("Error fetching data");
            console.error("Error fetching:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (rowId) => {
        setExpandedRowId(expandedRowId === rowId ? null : rowId);
    };

    return (
        <div>
            <SideNavbar />
            <div className="pl-[250px]">
                <Header title="TSP MESSAGES"></Header>
                <div className="border-gray-200 border-2 rounded m-8">
                    <Table >
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row) => ([
                                    <TableRow
                                        key={row.id}
                                        data-state={!loading && row.getIsSelected() && "selected"}
                                        className={loading ? '' : "cursor-pointer hover:bg-gray-100"}
                                        onClick={() => handleRowClick(row.id)}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id} className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>,
                                    !loading && (expandedRowId === row.id && (
                                        <TableRow key={`${row.id}-detail`}>
                                            <TableCell colSpan={columns.length} className="p-0">
                                                <div className="p-4 bg-gray-50">
                                                    <h2 className='text-xl font-semibold'>MESSAGE</h2>
                                                    <p>{row.original.message}</p>

                                                </div>

                                            </TableCell>
                                        </TableRow>
                                    ))
                                ]).flat())
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination Controls */}
                <div className="flex items-center justify-between mt-4 px-8">
                    <div className="flex-1 text-sm text-gray-700">
                        Showing <span className="font-medium">{((page - 1) * 10) + 1}</span> to{" "}
                        <span className="font-medium">
                            {Math.min(page * 10, total)}
                        </span> of{" "}
                        <span className="font-medium">{total}</span> results
                    </div>
                    <div className="flex gap-2">
                        <button
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => setPage(1)}
                            disabled={page === 1}
                        >
                            First
                        </button>
                        <button
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span className="p-2">
                            Page {page} of {Math.max(1, Math.ceil(total / 10))}
                        </span>
                        <button
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => setPage(page + 1)}
                            disabled={page >= Math.ceil(total / 10)}
                        >
                            Next
                        </button>
                        <button
                            className="p-2 border rounded hover:bg-gray-100 disabled:opacity-50"
                            onClick={() => setPage(Math.ceil(total / 10))}
                            disabled={page >= Math.ceil(total / 10)}
                        >
                            Last
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default TSPMessagesTable;