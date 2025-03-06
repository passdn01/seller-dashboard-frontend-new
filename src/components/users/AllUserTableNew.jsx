import React, { useState, useEffect } from "react";
import axios from "axios";
import * as XLSX from 'xlsx';
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
import { MoreHorizontal, Download } from "lucide-react";

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import UserEditCard from "./UserEditCard";
import { useSearchParams } from "react-router-dom";

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
    const [exportLoading, setExportLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [goToPage, setGoToPage] = useState(1);
    const [totalUsers, setTotalUsers] = useState(0)
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
    const [searchParams, setSearchParams] = useSearchParams();

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
            setTotalUsers(response.data.totalUsers)
        } catch (err) {
            setError("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    // Handle Excel Export functionality
    const handleExportExcel = async () => {
        try {
            setExportLoading(true);
            
            // Prepare the filter parameters based on current filters
            const exportParams = {
                startDate: dateFilter.from || undefined,
                endDate: dateFilter.to || undefined,
                minCoins: coinRange.min > 0 ? coinRange.min : undefined,
                maxCoins: coinRange.max < 1000000 ? coinRange.max : undefined,
                gender: genderFilter !== "All" ? genderFilter : undefined
            };
            
            // Call the export API
            const response = await axios.post(
                `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/exportUser`,
                exportParams
            );
            
            if (response.data.success) {
                const userData = response.data.data;
                
                // Format data for Excel
                const worksheetData = userData.map(user => ({
                    'ID': user._id,
                    'First Name': user.firstName,
                    'Last Name': user.lastName || '',
                    'Email': user.email || 'N/A',
                    'Phone': user.phone || 'N/A',
                    'Gender': user.gender || 'N/A',
                    'Coins': user.coins || 0,
                    'Date of Birth': user.dob ? new Date(user.dob).toLocaleDateString() : 'N/A',
                    'Total Rides': user.rideCreated?.length || 0,
                    'Referral Code': user.referralCode || 'N/A',
                    'Account Status': user.isActive ? 'Active' : 'Inactive',
                    'Created At': new Date(user.createdAt).toLocaleString(),
                    'Last Updated': new Date(user.updatedAt).toLocaleString()
                }));
                
                // Create worksheet
                const worksheet = XLSX.utils.json_to_sheet(worksheetData);
                
                // Add column widths for better readability
                const wscols = [
                    { wch: 24 }, // ID
                    { wch: 15 }, // First Name
                    { wch: 15 }, // Last Name
                    { wch: 25 }, // Email
                    { wch: 15 }, // Phone
                    { wch: 10 }, // Gender
                    { wch: 10 }, // Coins
                    { wch: 15 }, // DOB
                    { wch: 12 }, // Total Rides
                    { wch: 15 }, // Referral Code
                    { wch: 15 }, // Account Status
                    { wch: 20 }, // Created At
                    { wch: 20 }  // Updated At
                ];
                worksheet['!cols'] = wscols;
                
                // Create workbook and add the worksheet
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
                
                // Generate Excel file
                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                
                // Create a download link and trigger download
                const fileName = `Users_Export_${new Date().toISOString().split('T')[0]}.xlsx`;
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = fileName;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                
            } else {
                setError("Failed to export data");
            }
        } catch (err) {
            console.error("Error exporting users:", err);
            setError("Error exporting data");
        } finally {
            setExportLoading(false);
        }
    };

    useEffect(() => {
        console.log("in use effect")
        fetchUsers();
    }, [page]);

    useEffect(() => {
        // Initialize from URL parameters on first load
        const searchParam = searchParams.get("search");
        const genderParam = searchParams.get("gender");
        const minCoinsParam = searchParams.get("minCoins");
        const maxCoinsParam = searchParams.get("maxCoins");
        const fromDateParam = searchParams.get("fromDate");
        const toDateParam = searchParams.get("toDate");
        const pageParam = searchParams.get("page");

        if (searchParam) setSearch(searchParam);
        if (genderParam) setGenderFilter(genderParam);
        if (minCoinsParam || maxCoinsParam) {
            setCoinRange({
                min: minCoinsParam ? Number(minCoinsParam) : 0,
                max: maxCoinsParam ? Number(maxCoinsParam) : 1000000
            });
        }
        if (fromDateParam || toDateParam) {
            setDateFilter({
                from: fromDateParam || "",
                to: toDateParam || ""
            });
        }
        if (pageParam) setPage(Number(pageParam));

        fetchUsers();
    }, []);

    const handleSearch = () => {
        setPage(1);
        searchParams.set("search", search);
        searchParams.set("page", "1");
        setSearchParams(searchParams);
        fetchUsers();
    };

    const handleApplyFilters = () => {
        setPage(1);

        // Update URL with all current filter values
        if (search) searchParams.set("search", search);
        if (genderFilter !== "All") searchParams.set("gender", genderFilter);
        else searchParams.delete("gender");

        if (coinRange.min > 0) searchParams.set("minCoins", coinRange.min.toString());
        else searchParams.delete("minCoins");

        if (coinRange.max < 1000000) searchParams.set("maxCoins", coinRange.max.toString());
        else searchParams.delete("maxCoins");

        if (dateFilter.from) searchParams.set("fromDate", dateFilter.from);
        else searchParams.delete("fromDate");

        if (dateFilter.to) searchParams.set("toDate", dateFilter.to);
        else searchParams.delete("toDate");

        searchParams.set("page", "1");
        setSearchParams(searchParams);
        fetchUsers();
    };
    const handleResetFilters = () => {
        setSearch("");
        setGenderFilter("All");
        setCoinRange({ min: 0, max: 1000000 });
        setDateFilter({ from: "", to: "" });
        setPage(1);
        setSearchParams({}); // Clear all URL params
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
                    <div className="flex gap-x-4 gap-y-2">
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
                        <Button variant="outline" onClick={handleResetFilters}>Reset Filters</Button>
                        
                        {/* Export Excel Button */}
                        <Button 
                            variant="outline" 
                            onClick={handleExportExcel} 
                            className=" bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                            disabled={exportLoading}
                        >
                            {exportLoading ? (
                                <><Oval width={16} height={16} color="currentColor" className="mr-2" /> Exporting...</>
                            ) : (
                                <>
                                    <Download className="w-4 h-4 mr-2" />
                                    Export Excel
                                </>
                            )}
                        </Button>
                    </div>
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
                <div className="flex justify-between space-x-2 py-4 items-center">
                    <div className="text-gray-500">
                        Total Users : {totalUsers}
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            onClick={() => {
                                const newPage = Math.max(page - 1, 1);
                                setPage(newPage);
                                searchParams.set('page', newPage.toString());
                                setSearchParams(searchParams);
                            }}
                            disabled={page === 1 || loading}
                        >
                            Previous
                        </Button>
                        <span>Page {page} of {totalPages}</span>
                        <Button
                            variant="outline"
                            onClick={() => {
                                const newPage = Math.min(page + 1, totalPages);
                                setPage(newPage);
                                searchParams.set('page', newPage.toString());
                                setSearchParams(searchParams);
                            }}
                            disabled={page === totalPages}
                        >
                            Next
                        </Button>

                        {/* GO to Page */}
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

                            <Button
                                onClick={() => {
                                    const newPage = Math.max(1, Math.min(totalPages, Number(goToPage)));
                                    setPage(newPage);
                                    searchParams.set('page', newPage.toString());
                                    setSearchParams(searchParams);
                                    setGoToPage("");
                                }}
                                disabled={!goToPage || goToPage < 1 || goToPage > totalPages}
                            >
                                Go To Page
                            </Button>
                        </div>
                    </div>

                </div>
            </CardContent>
        </Card>
    );
};

export default AllUserTableNew;