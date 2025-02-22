import React from 'react'
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";

import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../ui/select";
import { Oval } from 'react-loader-spinner';
import RideDetail from './RideDetail';
import { SELLER_URL_LOCAL } from '@/lib/utils';
import { io } from 'socket.io-client';


import { Label } from '../ui/label';


import { ButtonSkeleton } from 'carbon-components-react';




function AllRidesNew() {



    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [applyButton, setApplyButton] = useState(false);

    const [expandedRowId, setExpandedRowId] = useState(null);
    const handleRowClick = (rowId) => {
        setExpandedRowId(expandedRowId === rowId ? null : rowId);
    };

    const statusOptions = ["ALL", "COMPLETED", "CANCELLED", "Driver Not Available", "PENDING"]

    const sortByOptions = ["created at: desc", "created at: asc", "updatedAt: desc", "updatedAt: asc"]

    const [sortby, setSortby] = useState("created at: desc")
    const [goToPage, setGoToPage] = useState("");


    const columns = [
        {
            id: "sno",
            header: "S.No.",
            cell: ({ row }) => <div>{(page - 1) * 10 + row.index + 1}</div>,
            enableHiding: false,
            enableSorting: false,
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <div className="flex items-center gap-2">
                    {/* <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    > */}
                    Created At
                    {/* <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button> */}
                </div>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt")); // Convert to Date object
                const options = { day: 'numeric', month: 'long', year: 'numeric' }; // Options for formatting
                const formattedDate = date.toLocaleDateString('en-US', options); // Format the date

                return <div>{formattedDate}</div>; // Render the formatted date
            },
        },
        {
            accessorKey: "userInfo",
            header: "User Name",
            cell: ({ row }) => <div>{row.getValue("userInfo")?.name} </div>
        },
        {
            accessorKey: "fare",
            header: "Fare",
            cell: ({ row }) => <div>{row.getValue("fare")}</div>,
        },
        {
            accessorKey: "distance",
            header: "Distance",
            cell: ({ row }) => <div>{row.getValue("distance")}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <div>{row.getValue("status")}</div>,
        },
        {
            accessorKey: "updatedAt",
            header: ({ column }) => (
                <div className="flex items-center gap-2">
                    {/* <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    > */}
                    Updated
                    {/* <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button> */}
                </div>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("updatedAt")); // Convert to Date object
                const options = { day: 'numeric', month: 'long', year: 'numeric' }; // Options for formatting
                const formattedDate = date.toLocaleDateString('en-US', options); // Format the date

                return <div>{formattedDate}</div>; // Render the formatted date
            },
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const ride = row.original;

                const navigate = useNavigate();

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            {/* <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(.phone)}
                            >
                                Copy Driver Phone
                            </DropdownMenuItem> */}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => window.open(`/rides/allRides/${ride._id}`, "_blank", "noopener,noreferrer")}>
                                View Ride Details
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];


    const fetchRides = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/getAllRidesNew`, {
                params: { startDate, endDate, status: statusFilter, page, limit: 10, sortby },
            });

            console.log(response.data.rides, "response")
            setData(response.data.rides);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("in use effect")
        fetchRides();
    }, [page, applyButton]);

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
                        <div className='h-8 bg-gray-100 rounded'></div>
                    )
                }))
                : columns,
        [loading]
    );

    const table = useReactTable({
        data: tableData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });



    const handleReset = () => {
        setStartDate("")
        setEndDate("")
        setStatusFilter("ALL")
        setSortby("created at: desc")
        fetchRides()
    }
    return (
        <div className='p-6 text-sm'>
            <div className="flex gap-x-8 px-4 pb-4 items-center ">
                <div>
                    <Label>Start Date</Label>
                    <Input className='w-[132px] p-2' type="date" onChange={(e) => { setStartDate(e.target.value) }} value={startDate}></Input></div>
                <div>
                    <Label>End Date</Label>
                    <Input className='w-[132px] p-2' type="date" onChange={(e) => { setEndDate(e.target.value) }} value={endDate}></Input></div>
                <div>
                    <Label>Select Ride Status</Label><Select onValueChange={setStatusFilter} value={statusFilter}>
                        <SelectTrigger className="w-[180px] mr-2">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>

                            {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>

                            ))}

                        </SelectContent>
                    </Select></div>
                <div>
                    <Label>Sort by</Label><Select onValueChange={setSortby} value={sortby}>
                        <SelectTrigger className="w-[180px] mr-2">
                            <SelectValue placeholder="created at: desc" />
                        </SelectTrigger>
                        <SelectContent>

                            {sortByOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>

                            ))}

                        </SelectContent>
                    </Select></div>

                <div className='mt-4 flex gap-x-4'>
                    <Button onClick={() => setApplyButton(!applyButton)} disabled={loading ? true : false}>Apply filters</Button>
                    <Button onClick={() => handleReset()} disabled={loading ? true : false}>Reset filters</Button>
                </div>
            </div>
            <div className='border-gray-200 border-2 rounded'>
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
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>,
                                !loading && (expandedRowId === row.id && (
                                    <TableRow key={`${row.id}-detail`}>
                                        <TableCell colSpan={columns.length} className="p-0">
                                            <div className="p-4 bg-gray-50">
                                                <RideDetail transactionId={row.original.transaction_id} distance={row.original.distance} userInfo={row.original.userInfo}></RideDetail>
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

            <div className="flex space-x-2 py-4 gap-2 justify-between items-center">
                <div className='flex gap-x-4 items-center'>
                    {/* Previous Button */}
                    <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>

                    <span>Page {page} of {totalPages}</span>

                    {/* Next Button */}
                    <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>


                {/* Go to Page Input */}
                <div className='flex gap-x-4'>
                    <div className='flex items-center gap-x-2'>
                        <label htmlFor="page">Page</label>
                        <input
                            type="number"
                            min="1"
                            max={totalPages}
                            value={goToPage}
                            onChange={(e) => {
                                setGoToPage(e.target.value)
                            }}
                            className="w-full border rounded text-center p-2"
                            placeholder="Page No"
                        /></div>

                    {/* Go Button */}
                    <Button

                        onClick={() => {
                            const newPage = Math.max(1, Math.min(totalPages, Number(goToPage)));
                            setPage(newPage);
                            setGoToPage("")
                        }}
                        disabled={!goToPage || goToPage < 1 || goToPage > totalPages}
                    >
                        Go To Page
                    </Button>
                </div>


            </div>

        </div>
    )
}

export default AllRidesNew