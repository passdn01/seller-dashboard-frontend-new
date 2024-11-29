import { useEffect, useState } from 'react';
import axios from 'axios';

import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown } from "lucide-react";

import { Button } from "../../ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
import { Input } from "../../ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../ui/table";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Oval } from 'react-loader-spinner';
import io from 'socket.io-client';

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
        accessorKey: "driverId",
        header: "Driver ID",
        cell: ({ row }) => <div>{row.original.driverId || "N/A"}</div>,
    },
    {
        accessorKey: "driverName",
        header: ({ column }) => (
            <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Name
                <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        ),
        cell: ({ row }) => <div>{row.getValue("driverName") || "N/A"}</div>,
    },
    {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => <div>{row.getValue("phone") || "N/A"}</div>,
    },
    // {
    //     accessorKey: "category",
    //     header: "Category",
    //     cell: ({ row }) => <div>{row.getValue("category") || "N/A"}</div>,
    // },
    {
        accessorKey: "driverLiveLocation.latitude",
        header: "Latitude",
        cell: ({ row }) => <div>{row.original.driverLiveLocation?.latitude || "N/A"}</div>,
    },
    {
        accessorKey: "driverLiveLocation.longitude",
        header: "Longitude",
        cell: ({ row }) => <div>{row.original.driverLiveLocation?.longitude || "N/A"}</div>,
    },
    {
        accessorKey: "drivingLicense",
        header: "Driving License",
        cell: ({ row }) => {
            const licenseUrl = row.getValue("drivingLicense");
            return licenseUrl ? (
                <a
                    href={licenseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500"
                >
                    Driving License
                </a>
            ) : (
                "N/A"
            );
        },
    },
];


export default function LiveDriverTable() {
    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [data, setData] = useState([]);
    // const [categoryFilter, setCategoryFilter] = useState("all");
    const [loading, setLoading] = useState(true);  // Track loading state
    const [socket, setSocket] = useState(null); // Socket instance

    // Effect to initialize WebSocket connection
    useEffect(() => {
        // Establish WebSocket connection
        const newSocket = io('https://55kqzrxn-2003.inc1.devtunnels.ms'); // Change the URL to match your server
        setSocket(newSocket);

        // Request online drivers once connected
        newSocket.on('connect', () => {
            console.log('Connected to WebSocket server');
            newSocket.emit('getOnlineDrivers'); // Emit the 'getOnlineDrivers' event to fetch data
        });

        // Listen for the onlineDrivers event and update data
        newSocket.on('onlineDrivers', (response) => {
            console.log(response);
            const allDrivers = response.drivers.flat(); // Flatten nested arrays
            const validData = allDrivers.filter(driver => 
                driver && driver.driverId && driver.driverName && driver.driverLiveLocation
            );
            setData(validData); // Set only valid data
            setLoading(false); // Stop loading after data is fetched
        });

        // Cleanup function to disconnect from WebSocket when the component is unmounted
        return () => newSocket.close();

    }, []); // Empty array means this effect runs only once when the component is mounted
    

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
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    });

    if (loading) {  // If loading, show spinner
        return (
            <div className="flex items-center justify-center min-h-screen">
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
            </div>
        );
    }

    return (
        <div className="w-[95%] mx-5 mt-2">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Filter names..."
                    value={table.getColumn("driverName")?.getFilterValue() || ""}
                    onChange={(event) =>
                        table.getColumn("driverName")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm mr-4"
                />
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
            </div>
            <div className="rounded-md border bg-white">
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
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
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
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
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
