import React, { useState, useEffect } from "react";
import axios from "axios";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Oval } from "react-loader-spinner";
import { Card, CardContent } from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import UserEditCard from "./UserEditCard";

const AllUserTableNew = () => {

    const columns = [
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
    ]

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const [expandedRowId, setExpandedRowId] = useState(null);
    const handleRowClick = (rowId) => {
        setExpandedRowId(expandedRowId === rowId ? null : rowId);
    };

    // Filters
    const [search, setSearch] = useState("");
    const [genderFilter, setGenderFilter] = useState("All");
    const [coinRange, setCoinRange] = useState({ min: 0, max: 1000000 });
    const [dateFilter, setDateFilter] = useState({ from: "", to: "" });

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/getAllUsersNew`,
                {
                    params: {
                        search,
                        gender: genderFilter,
                        minCoins: coinRange.min,
                        maxCoins: coinRange.max,
                        fromDate: dateFilter.from,
                        toDate: dateFilter.to,
                        page,
                        limit: 10,
                    }
                }
            );
            setUsers(response.data.users);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("in use effect")
        fetchUsers();
    }, [page]);

    const handleSearch = () => {
        setPage(1);
        fetchUsers();
    };

    const handleApplyFilters = () => {
        setPage(1);
        fetchUsers();
    };

    const handleResetFilters = () => {
        setSearch("");
        setGenderFilter("All");
        setCoinRange({ min: 0, max: 1000000 });
        setDateFilter({ from: "", to: "" });
        setPage(1);
        fetchUsers();
    };

    const tableData = React.useMemo(
        () => (loading ? Array(10).fill({}) : users),
        [loading, users]
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

    return (
        <Card>
            <CardContent className="p-8">
                {/* Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <Input
                        placeholder="Search by name or phone"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="max-w-sm"
                    />
                    <Button onClick={handleSearch}>Search</Button>
                    <div className="flex gap-x-4">
                        <Select value={genderFilter} onValueChange={setGenderFilter}>
                            <SelectTrigger className="w-44"><SelectValue placeholder="All Genders" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="All">All Genders</SelectItem>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2">
                            <span>Coins:</span>
                            <Input type="number" placeholder="Min" value={coinRange.min}
                                onChange={(e) => setCoinRange((prev) => ({ ...prev, min: Number(e.target.value) }))} className="w-20" />
                            <Input type="number" placeholder="Max" value={coinRange.max}
                                onChange={(e) => setCoinRange((prev) => ({ ...prev, max: Number(e.target.value) }))} className="w-20" />
                        </div>

                        <div className="flex items-center gap-2">
                            <span>Date:</span>
                            <Input type="date" value={dateFilter.from} onChange={(e) => setDateFilter((prev) => ({ ...prev, from: e.target.value }))} />
                            <Input type="date" value={dateFilter.to} onChange={(e) => setDateFilter((prev) => ({ ...prev, to: e.target.value }))} />
                        </div>

                        <Button onClick={handleApplyFilters}>Apply Filters</Button>
                        <Button variant="outline" onClick={handleResetFilters}>Reset Filters</Button></div>
                </div>

                {/* Table */}
                <Table className='border-2 border-gray-100'>
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
                                                <UserEditCard userData={row.original} />
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


                {/* Pagination */}
                <div className="flex justify-end space-x-2 py-4 items-center">
                    <Button onClick={() => setPage((prev) => Math.max(prev - 1, 1))} disabled={page === 1} >
                        Previous
                    </Button>
                    <span>Page {page} of {totalPages}</span>
                    <Button onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))} disabled={page === totalPages}>
                        Next
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default AllUserTableNew;
