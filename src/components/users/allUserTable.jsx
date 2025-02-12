import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Oval } from "react-loader-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import {
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import UserEditCard from "./UserEditCard";
import { SELLER_URL_LOCAL } from "@/lib/utils";
import { io } from "socket.io-client";

const UserManagementTable = () => {
    const [expandedRowId, setExpandedRowId] = useState(null);
    const handleRowClick = (rowId) => {
        setExpandedRowId(expandedRowId === rowId ? null : rowId);
    };
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    // const [data, setData] = useState([]);
    const [error, setError] = useState(null);

    // Filters
    const [search, setSearch] = useState("");
    const [genderFilter, setGenderFilter] = useState("");
    const [coinRange, setCoinRange] = useState({ min: 0, max: 1000000 });
    const [dateFilter, setDateFilter] = useState({ from: "", to: "" });

    useEffect(() => {
        const socket = io(`${SELLER_URL_LOCAL}`); // Replace with your server URL

        console.time("Socket API Response Time"); // Start measuring time

        socket.on("connect", () => {
            console.log("Connected to socket server");
            // Request to get all drivers
            socket.emit("getAllUsers");
        });

        // Handle incoming driver data (batch-based)
        socket.on("userData", (user) => {
            setUsers((prevUsers) => [...prevUsers, ...user]); // Add new data to state dynamically
            setLoading(false);
        });

        // Handle the end of the data stream
        socket.on("userDataEnd", () => {
            console.timeEnd("Socket API Response Time"); // End measuring time
            setLoading(false); // Stop loading when all data is received
        });

        // Handle errors
        socket.on("userDataError", (error) => {
            console.error("Error:", error.message);
            setError(error.message); // Set error message
            setLoading(false); // Stop loading in case of error
        });

        // Clean up the socket connection when the component unmounts
        return () => {
            socket.off("userData");
            socket.off("userDataEnd");
            socket.off("userDataError");
            socket.disconnect();
        };

    }, []);

    // Filtered Data
    const filteredData = useMemo(() => {
        return users.filter((user) => {
            const matchesSearch =
                user.firstName?.toLowerCase().includes(search.toLowerCase()) ||
                user.phone?.includes(search);

            const matchesGender = genderFilter ? genderFilter === "all" ? true : user.gender === genderFilter : true;

            const matchesCoins =
                user.coins >= (coinRange.min || 0) &&
                user.coins <= (coinRange.max || "Infinity");

            const userCreatedAt = new Date(user.createdAt);
            const matchesDate =
                (!dateFilter.from || userCreatedAt >= new Date(dateFilter.from)) &&
                (!dateFilter.to || userCreatedAt <= new Date(dateFilter.to));

            return matchesSearch && matchesGender && matchesCoins && matchesDate;
        });
    }, [users, search, genderFilter, coinRange, dateFilter]);

    // Define columns for react-table
    const columns = useMemo(
        () => [
            {
                accessorKey: "firstName",
                header: "Name",
                cell: ({ row }) => `${row.original?.firstName} ${row.original?.lastName || ''}`,
            },
            {
                accessorKey: "email",
                header: "Email",
                cell: ({ row }) => `${row.original?.email}` || 'NA'
            },
            {
                accessorKey: "phone",
                header: "Phone",
            },
            {
                accessorKey: "gender",
                header: "Gender",
                cell: ({ row }) => `${row.original?.gender}` || 'NA'
            },
            {
                accessorKey: "coins",
                header: "Coins",
            },
            {
                accessorKey: "dob",
                header: "Date of Birth",
                cell: ({ getValue }) => getValue() ? new Date(getValue()).toLocaleDateString() : 'N/A',
            },
            {
                accessorKey: "rideCreated",
                header: "Total Rides",
                cell: ({ getValue }) => getValue()?.length || 0,
            },
            {
                accessorKey: "referralCode",
                header: "Referral Code",
            },
            {
                accessorKey: "actions",
                header: "Actions",
                cell: ({ row }) => (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => window.open(`/users/${row.original._id}`, "_blank", "noopener,noreferrer")}>View Profile</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                ),
            },
        ],
        []
    );

    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Oval
                    height={40}
                    width={40}
                    color="#4fa94d"
                    visible={true}
                    ariaLabel="oval-loading"
                    secondaryColor="#4fa94d"
                />
            </div>
        );
    }

    return (
        <Card>
            <CardContent className="p-8 ">

                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <Input
                        placeholder="Search by name or phone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Select onValueChange={setGenderFilter}>
                        <SelectTrigger className="w-44">
                            <SelectValue placeholder="All Genders" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Genders</SelectItem>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex items-center gap-2">
                        <span>Coins:</span>
                        <Input
                            type="number"
                            placeholder="Min"
                            value={coinRange.min}
                            onChange={(e) =>
                                setCoinRange((prev) => ({
                                    ...prev,
                                    min: Number(e.target.value),
                                }))
                            }
                            className="w-20"
                        />
                        <Input
                            type="number"
                            placeholder="Max"
                            value={coinRange.max}
                            onChange={(e) =>
                                setCoinRange((prev) => ({
                                    ...prev,
                                    max: Number(e.target.value),
                                }))
                            }
                            className="w-20"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <span>Date:</span>
                        <Input
                            type="date"
                            onChange={(e) =>
                                setDateFilter((prev) => ({
                                    ...prev,
                                    from: e.target.value,
                                }))
                            }
                        />
                        <Input
                            type="date"
                            onChange={(e) =>
                                setDateFilter((prev) => ({
                                    ...prev,
                                    to: e.target.value,
                                }))
                            }
                        />
                    </div>
                </div>

                {/* Table */}
                <Table className='border-2 border-gray-100'>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => ([
                            <TableRow
                                key={`${row.id}-main`}
                                data-state={row.getIsSelected() && "selected"}
                                className="cursor-pointer hover:bg-gray-100"
                                onClick={() => handleRowClick(row.id)}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>,
                            expandedRowId === row.id && (
                                <TableRow key={`${row.id}-detail`}>
                                    <TableCell colSpan={columns.length} className="p-0">
                                        <div className="p-4 bg-gray-50">
                                            <UserEditCard userData={row.original} />
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )
                        ].flat()
                        ))}
                    </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex justify-between mt-4">
                    <Button
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <span>
                        Page {table.getState().pagination.pageIndex + 1} of{" "}
                        {table.getPageCount()}
                    </span>
                    <Button
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default UserManagementTable;