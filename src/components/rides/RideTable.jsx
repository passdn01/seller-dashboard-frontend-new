import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
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
// Columns configuration
const columns = [
    {
        id: "sno",
        header: "S.No.",
        cell: ({ row }) => <div>{row.index + 1}</div>,
        enableHiding: false,
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
                    Created At
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
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
        accessorKey: "userPhone",
        header: "User Phone",
        cell: ({ row }) => <div>{row.getValue("userInfo")?.phone} </div>
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
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Updated
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
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

export default function RideTable() {
    const [expandedRowId, setExpandedRowId] = useState(null);
    const handleRowClick = (rowId) => {
        setExpandedRowId(expandedRowId === rowId ? null : rowId);
    };
    const [sorting, setSorting] = useState([]);
    const [rideColumnFilters, setRideColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [globalFilter, setGlobalFilter] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        const socket = io(`${import.meta.env.VITE_SELLER_URL_LOCAL}`); // Replace with your server URL

        console.time("Socket API Response Time"); // Start measuring time

        socket.on("connect", () => {
            console.log("Connected to socket server");
            // Request to get all drivers
            socket.emit("getAllRides");
        });

        // Handle incoming driver data (batch-based)
        socket.on("rideData", (data) => {
            setData((prevDrivers) => [...prevDrivers, ...data]); // Add new data to state dynamically
            setLoading(false);
        });

        // Handle the end of the data stream
        socket.on("rideDataEnd", () => {
            console.timeEnd("Socket API Response Time"); // End measuring time
            setLoading(false); // Stop loading when all data is received
        });

        // Handle errors
        socket.on("rideDataError", (error) => {
            console.error("Error:", error.message);
            setError(error.message); // Set error message
            setLoading(false); // Stop loading in case of error
        });

        // Clean up the socket connection when the component unmounts
        return () => {
            socket.off("rideData");
            socket.off("rideDataEnd");
            socket.off("rideDataError");
            socket.disconnect();
        };

    }, []);

    // Handle date range filtering
    useEffect(() => {
        let filtered = [...data];

        if (startDate || endDate) {
            filtered = filtered.filter(item => {
                const itemDate = new Date(item.createdAt);
                const start = startDate ? new Date(startDate) : new Date(0);
                const end = endDate ? new Date(endDate) : new Date(8640000000000000);

                // Set the time to midnight for accurate date comparison
                start.setHours(0, 0, 0, 0);
                end.setHours(23, 59, 59, 999);

                return itemDate >= start && itemDate <= end;
            });
        }

        setFilteredData(filtered);
    }, [data, startDate, endDate]);


    const handleExportExcel = async () => {
        try {
            // Show loading state
            setLoading(true);

            // Prepare query parameters based on current filters
            const exportParams = {
                startDate: startDate || undefined,
                endDate: endDate || undefined,
                status: statusFilter !== "all" ? statusFilter : undefined
            };

            console.log(exportParams)

            // Call the export API
            const token = localStorage.getItem("token");
            const response = await axios.post(
                `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/exportRide`,
                exportParams,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            console.log(response.data.data.length)

            if (response.data.success) {
                // Process the data for Excel
                const excelData = response.data.data.map(ride => ({
                    'Date': new Date(ride.createdAt).toLocaleDateString(),
                    'Transaction ID': ride.transaction_id || '',
                    'User Name': ride.userInfo?.name || '',
                    'User Phone': ride.userInfo?.phone || '',
                    'Driver Name': ride.driverInfo?.name || '',
                    'Driver Phone': ride.driverInfo?.phone || '',
                    'Vehicle Category': ride.driverInfo?.vehicleDetail?.category || '',
                    'Vehicle Number': ride.driverInfo?.vehicleDetail?.vehicleNumber || '',
                    'License Number': ride.driverInfo?.vehicleDetail?.licenseNumber || '',
                    'Fare': ride.fare || 0,
                    'Distance': ride.distance || 0,
                    'Status': ride.status || '',
                    'Last Updated': new Date(ride.updatedAt).toLocaleDateString()
                }));

                // Create workbook and worksheet
                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.json_to_sheet(excelData);

                // Add worksheet to workbook
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Rides');

                // Generate Excel file
                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                // Create download link
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `rides_export_${new Date().toISOString().split('T')[0]}.xlsx`;
                link.click();

                // Cleanup
                window.URL.revokeObjectURL(url);
            } else {
                throw new Error('Failed to export data');
            }
        } catch (error) {
            console.error('Export failed:', error);
            // You might want to show an error message to the user here
        } finally {
            setLoading(false);
        }
    };

    const table = useReactTable({
        data: filteredData, // Use filteredData instead of data
        columns,
        onSortingChange: setSorting,
        onrideColumnFiltersChange: setRideColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            rideColumnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    useEffect(() => {
        if (statusFilter && statusFilter !== "all") {
            table.getColumn("status")?.setFilterValue(statusFilter);
        } else {
            table.getColumn("status")?.setFilterValue("");
        }
    }, [statusFilter, table]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <Oval
                height={60}
                width={60}
                color="#4fa94d"
                visible={true}
                ariaLabel='oval-loading'
                secondaryColor="#4fa94d"
                strokeWidth={2}
                strokeWidthSecondary={2}
            />
        </div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const statusOptions = [...new Set(data.map(item => item.status))];

    return (
        <div className="w-[80%] mx-24">
            <div className="flex items-center py-4 space-x-4">
                <Input
                    placeholder="Search all columns..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm"
                />
                <div className="flex items-center space-x-2">
                    <Input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-40"
                    />
                    <span>to</span>
                    <Input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-40"
                    />
                </div>
                <Select onValueChange={setStatusFilter} value={statusFilter}>
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                                {status}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
                            Columns <ChevronDown className="ml-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => (
                                <DropdownMenuCheckboxItem
                                    key={column.id}
                                    className="capitalize"
                                    checked={column.getIsVisible()}
                                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                >
                                    {column.id}
                                </DropdownMenuCheckboxItem>
                            ))}
                    </DropdownMenuContent>
                </DropdownMenu>
                <Button
                    variant="outline"
                    onClick={handleExportExcel}
                    disabled={loading}
                    className="ml-2 bg-green-600 text-white"
                >
                    {loading ? 'Exporting...' : 'Export Excel'}
                </Button>
            </div>
            {/* Rest of the component remains the same... */}
            <div className="rounded-md border">
                <Table>
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
                                                <RideDetail transactionId={row.original.transaction_id} distance={row.original.distance} userInfo={row.original.userInfo}></RideDetail>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )

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
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Total {table.getFilteredRowModel().rows.length} row(s) available.
                </div>
                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <input
                        type="number"
                        min="1"
                        max={table.getFilteredRowModel().rows.length}
                        placeholder="Go to row..."
                        className="w-60 border rounded px-2 py-2 text-sm"
                        onChange={(e) => {
                            const rowNumber = Number(e.target.value);
                            if (rowNumber > 0 && rowNumber <= table.getFilteredRowModel().rows.length) {
                                table.setPageIndex(Math.floor((rowNumber - 1) / table.getState().pagination.pageSize));
                            }
                        }}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}