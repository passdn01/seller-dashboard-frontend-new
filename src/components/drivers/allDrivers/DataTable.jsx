import { React, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    // DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "../../ui/button";

import { Input } from "../../ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";
import { Oval } from 'react-loader-spinner';

// import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";


import { ChevronDown, MoreHorizontal, ChevronRight, ArrowUpDown } from "lucide-react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

// import { Label } from '@/components/ui/label';
// import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';


// import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';



import DriverDetails from './DriverDetailsInTable';
import { io } from 'socket.io-client';
import { SELLER_URL_LOCAL } from '@/lib/utils';

export default function DriverTable() {


    const [expandedRowId, setExpandedRowId] = useState(null);
    const handleRowClick = (rowId) => {
        setExpandedRowId(expandedRowId === rowId ? null : rowId);
    };

    const [sorting, setSorting] = useState([]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [data, setData] = useState([]);
    // const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [verifyFilter, setVerifyFilter] = useState("all");
    const [rcFilter, setRcFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [globalFilter, setGlobalFilter] = useState("");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [driverToDelete, setDriverToDelete] = useState(null);
    // const [driverToUpdate, setDriverToUpdate] = useState(null);
    const navigate = useNavigate();
    const [filteredData, setFilteredData] = useState([]);
    const [missingFilters, setMissingFilters] = useState({
        dlMissing: false,
        dlBackMissing: false,
        rcMissing: false,
        profileMissing: false,
        rcBackMissing: false,
        none: false,  // Initially not selected
    });


    useEffect(() => {
        const socket = io(`${import.meta.env.VITE_SELLER_URL_LOCAL}`); // Replace with your server URL

        console.time("Socket API Response Time"); // Start measuring time

        socket.on("connect", () => {
            console.log("Connected to socket server");
            // Request to get all drivers
            socket.emit("getAllDrivers");
        });

        // Handle incoming driver data (batch-based)
        socket.on("driverData", (data) => {
            const processedData = data.map(driver => {
                const isIncompleteRegistration = driver.isCompleteRegistration === false;
                // const completeRegistration = driver.isCompleteRegistration === true;
                const isMissingNameOrLicense = driver.licenseNumber || driver.name && driver.name !== "null";

                let verificationStatus = "";

                if (driver.isCompleteRegistration === true) {
                    verificationStatus = "Verified";
                }

                if (isIncompleteRegistration && !isMissingNameOrLicense) {
                    verificationStatus = "Not";
                }

                if (isIncompleteRegistration && isMissingNameOrLicense) {
                    verificationStatus = "Pending";
                }


                return { ...driver, verify: verificationStatus };
            });

            setData((prevDrivers) => [...prevDrivers, ...processedData]);
            setLoading(false);
        });

        // Handle the end of the data stream
        socket.on("driverDataEnd", () => {
            console.timeEnd("Socket API Response Time");
            setLoading(false);
        });

        // Handle errors
        socket.on("driverDataError", (error) => {
            console.error("Error:", error.message);
            setError(error.message);
            setLoading(false);
        });


        // Clean up the socket connection when the component unmounts
        return () => {
            socket.off("driverData");
            socket.off("driverDataEnd");
            socket.off("driverDataError");
            socket.disconnect();
        };
    }, []);

    const [showEmptyRC, setShowEmptyRC] = useState(false);

    useEffect(() => {
        // Filter the data dynamically if necessary
        setFilteredData(data);
    }, [data]);

    const [showMissingNameAndLicense, setShowMissingNameAndLicense] = useState(false);

    useEffect(() => {
        applyMissingFilters(); // Apply filters whenever new data arrives
    }, [data]); // Trigger on data change

    useEffect(() => {
        applyMissingFilters(); // Reapply filters when filters change
    }, [missingFilters, showMissingNameAndLicense]); // Added showEmptyRC dependency

    // Updated function to apply filters dynamically when data updates
    const applyMissingFilters = () => {
        const { rcNumberMissing, dlMissing, dlBackMissing, rcMissing, profileMissing, rcBackMissing, none } = missingFilters;

        const filtered = data.filter((driver) => {

            // Check for missing name and license
            if (showMissingNameAndLicense) {
                return !driver.name && !driver.licenseNumber;
            }

            const isRcNumberMissing = rcNumberMissing && driver.vehicleNumber;
            const isDlMissing = dlMissing && !driver.drivingLicense;
            const isDlBackMissing = dlBackMissing && !driver.drivingLicenseBack;
            const isRcMissing = rcMissing && !driver.registrationCertificate;
            const isProfileMissing = profileMissing && !driver.profileUrl;
            const isRcBackMissing = rcBackMissing && !driver.registrationCertificateBack;

            // Check for none missing documents
            if (none) {
                return driver.vehicleNumber &&
                    driver.drivingLicense &&
                    driver.drivingLicenseBack &&
                    driver.registrationCertificate &&
                    driver.profileUrl &&
                    driver.registrationCertificateBack;
            }

            if (!dlMissing && !dlBackMissing && !rcMissing && !profileMissing && !rcBackMissing && !rcNumberMissing) {
                return true;
            }

            // Apply document missing filters
            return isDlMissing || isDlBackMissing || isRcMissing || isProfileMissing || isRcBackMissing || isRcNumberMissing;
        });

        setFilteredData(filtered); // Update filtered data dynamically
    };

    // Handler for checkbox change
    const handleCheckboxChange = (filterKey) => {
        setMissingFilters(prev => ({
            ...prev,
            [filterKey]: !prev[filterKey]
        }));
    };


    // Whenever the missing filter state changes, apply filters
    useEffect(() => {
        applyMissingFilters();
    }, [missingFilters, data]);


    // Function to open the dialog with the selected driver ID
    const openDeleteDialog = (driverId) => {
        setDriverToDelete(driverId);
        setIsDialogOpen(true);
    };

    //for syncing 
    const handleUpdateDriver = (updatedDriver) => {
        setData((prevData) =>
            prevData.map((driver) =>
                driver._id === updatedDriver._id ? updatedDriver : driver
            )
        );
    };


    const handleDelete = async () => {
        if (!driverToDelete) return;

        try {
            const response = await axios.delete(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driver/${driverToDelete}`);
            if (response.data.success) {
                // Refetch data after deletion
                const newResponse = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/allDrivers`);
                if (newResponse.data.success) {
                    const updatedData = newResponse.data.data;
                    setData(updatedData);
                    // sessionStorage.setItem('myData', JSON.stringify(updatedData));
                    // sessionStorage.setItem('lastFetchTime', Date.now().toString());

                    alert('Driver deleted successfully');
                }
            } else {
                alert('Failed to delete driver');
            }
        } catch (error) {
            console.error("Error deleting driver:", error);
        } finally {
            setIsDialogOpen(false); // Close dialog
            setDriverToDelete(null); // Reset driver to delete
        }
    };

    const handleStatusUpdate = async (driverId, currentStatus) => {
        try {
            await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driver/${driverId}/completeEdit`, {
                completeStatus: !currentStatus // Toggle the status
            });

            const updatedData = data.map(driver => driver._id === driverId ? { ...driver, isCompleteRegistration: !currentStatus } : driver);
            setData(updatedData);

            alert(`Driver marked as ${!currentStatus ? 'complete' : 'incomplete'}`);
        } catch (error) {
            console.error("Error updating status:", error);
            setError('Error updating status');
        }
    };


    const handleStatusRejectUpdate = async (driverId, currentStatus) => {
        try {
            currentStatus = currentStatus == "REJECTED" ? 'OFFLINE' : 'REJECTED'
            await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driver/${driverId}/completeEdit`, {
                status: currentStatus // Toggle the status
            });

            const updatedData = data.map(driver => driver._id === driverId ? { ...driver, status: currentStatus } : driver);
            setData(updatedData);

            alert(`Driver marked as ${currentStatus == "REJECTED" ? 'REJECTED' : 'OFFLINE'}`);

        } catch (error) {
            console.error("Error updating status:", error);
            setError('Error updating status');
        }
    };



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
                        Joining
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
            accessorKey: "phone",
            header: "Driver Phone",
            cell: ({ row }) => <div>{row.getValue("phone")}</div>,
        },
        {
            accessorKey: "name",
            header: ({ column }) => (
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                    >
                        Name
                        <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                </div>
            ),
            cell: ({ row }) => (
                <div className="flex items-center gap-2">
                    <span>{row.getValue("name")}</span>
                    {/* Display the status dot based on isCompleteRegistration */}
                    <span
                        className={`w-3 h-3 rounded-full ${row.original.status == "REJECTED" ? 'bg-yellow-500' : row.original.isCompleteRegistration ? 'bg-green-400' : 'bg-red-400'
                            }`}
                        title={row.original.isCompleteRegistration ? "Registration Complete" : "Registration Incomplete"}
                    ></span>
                </div>
            ),
        },
        {
            accessorKey: "verify",
            header: "Verify",
            cell: ({ row }) => <div>{row.getValue("verify")}</div>,
        },
        {
            accessorKey: "vehicleNumber",
            header: "RC Number",
            cell: ({ row }) => <div>{row.getValue("vehicleNumber")}</div>,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <div>{row.getValue("status")}</div>,
        },
        {
            id: "missingDocs",
            header: "Missing",
            cell: ({ row }) => {
                const driver = row.original;
                const missingDocs = [];
                if (!driver.drivingLicense) missingDocs.push("DL");
                if (!driver.drivingLicenseBack) missingDocs.push("DLB");
                if (!driver.registrationCertificate) missingDocs.push("RC");
                if (!driver.registrationCertificateBack) missingDocs.push("RCB");
                if (!driver.profileUrl) missingDocs.push("PF");

                return <div>{missingDocs.length > 0 ? missingDocs.join(", ") : "None"}</div>;
            },
        },
        {
            accessorKey: "category",
            header: "Category",
            cell: ({ row }) => {
                const driver = row.original
                let ca = driver?.category
                if (ca === "HATCHBACK") {
                    ca = "CAB"
                }
                else if (ca === "SEDAN") {
                    ca = "ELITE"
                }

                return <div>{ca}</div>
            }
        },
        {
            accessorKey: "updatedAt",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    Updated
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
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
                const driver = row.original;

                return (
                    <>
                        {/* Dropdown Menu */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(driver.phone)}>
                                    Copy Driver Phone
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => window.open(`/drivers/allDrivers/${driver._id}`, "_blank", "noopener,noreferrer")}
                                >
                                    View Driver Details
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openDeleteDialog(driver._id)}>
                                    Delete Driver
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusUpdate(driver._id, driver.isCompleteRegistration)}>
                                    Mark as {driver.isCompleteRegistration ? 'Incomplete' : 'Complete'}
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleStatusRejectUpdate(driver._id, driver.status)}>
                                    Mark as {driver.status == "REJECTED" ? 'OFFLINE' : 'REJECTED'}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Confirmation Dialog */}
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogContent className="bg-white h-[200px]">
                                <DialogHeader>
                                    <DialogTitle>Confirm Deletion</DialogTitle>
                                    <DialogDescription>
                                        Are you sure you want to delete this driver? This action cannot be undone.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-end gap-2 mt-4">
                                    <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleDelete}>
                                        Confirm
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </>
                );
            },
        },
    ];





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
            globalFilter,
        },
        onGlobalFilterChange: setGlobalFilter,
    });

    useEffect(() => {
        if (verifyFilter && verifyFilter !== "all") {
            table.getColumn("verify")?.setFilterValue(verifyFilter);
        } else {
            table.getColumn("verify")?.setFilterValue("");
        }
    }, [verifyFilter, table]);

    useEffect(() => {
        if (statusFilter && statusFilter !== "all") {
            table.getColumn("status")?.setFilterValue(statusFilter);
        } else {
            table.getColumn("status")?.setFilterValue("");
        }
    }, [statusFilter, table]);

    useEffect(() => {
        if (categoryFilter && categoryFilter !== "all") {
            table.getColumn("category")?.setFilterValue(categoryFilter);
        } else {
            table.getColumn("category")?.setFilterValue("");
        }
    }, [categoryFilter, table]);


    if (error) {
        return <div>Error: {error}</div>;
    }

    const statusOptions = [...new Set(data.map(item => item.status))];
    const categoryOptions = [...new Set(data.map(item => item.category))]
    const verifyOptions = [...new Set(data.map(item => item.verify))];

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

    return (
        <div className="w-[90%] m-auto">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Search all columns..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm mr-2"
                />
                <Select onValueChange={setStatusFilter} value={statusFilter}>
                    <SelectTrigger className="w-[180px] mr-2">
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

                <Select onValueChange={setVerifyFilter} value={verifyFilter}>
                    <SelectTrigger className="w-[180px] mr-2">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All verify status</SelectItem>
                        {verifyOptions.map((verify) => (
                            <SelectItem key={verify} value={verify}>
                                {verify}
                            </SelectItem>

                        ))}

                    </SelectContent>
                </Select>

                <Select onValueChange={setCategoryFilter} value={categoryFilter}>
                    <SelectTrigger className="w-[180px] mr-2">
                        <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Category</SelectItem>
                        {categoryOptions.map((c) => (
                            <SelectItem key={c} value={c}>
                                {c === "HATCHBACK" ? "CAB" : (c === "SEDAN" ? "ELITE" : c)}
                            </SelectItem>

                        ))}

                    </SelectContent>
                </Select>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild className="mr-2">
                        <Button variant="outline">Present Docs</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuCheckboxItem
                            checked={missingFilters.rcNumberMissing}
                            onCheckedChange={() => handleCheckboxChange("rcNumberMissing")}
                        >
                            RC Number Present
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline">Select Missing Documents</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuCheckboxItem
                            checked={missingFilters.rcNumberMissing}
                            onCheckedChange={() => handleCheckboxChange("rcNumberMissing")}
                        >
                            RC Number Present
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={missingFilters.dlMissing}
                            onCheckedChange={() => handleCheckboxChange("dlMissing")}
                        >
                            DL Missing
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={missingFilters.dlBackMissing}
                            onCheckedChange={() => handleCheckboxChange("dlBackMissing")}
                        >
                            DL Back Missing
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={missingFilters.rcMissing}
                            onCheckedChange={() => handleCheckboxChange("rcMissing")}
                        >
                            RC Missing
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={missingFilters.rcBackMissing}
                            onCheckedChange={() => handleCheckboxChange("rcBackMissing")}
                        >RC Back Missing</DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={missingFilters.profileMissing}
                            onCheckedChange={() => handleCheckboxChange("profileMissing")}
                        >
                            Profile Missing
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                            checked={missingFilters.none}
                            onCheckedChange={() => handleCheckboxChange("none")}
                        >
                            None Missing
                        </DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto mr-2">
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
                </DropdownMenu> */}
            </div>
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
                        {filteredData.length ? (
                            table.getRowModel().rows?.length ? (
                                table.getRowModel().rows
                                    .filter((row) => filteredData.includes(row.original))
                                    .map((row) => [
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
                                                        <DriverDetails data={row.original} onDriverUpdated={handleUpdateDriver} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    ]).flat()
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )
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