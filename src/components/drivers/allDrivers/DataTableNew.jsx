import { useEffect, useState, useRef } from 'react';
import React from 'react'
import axios from 'axios';
import { useNavigate, useSearchParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { Download } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    // DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../../ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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


import { ChevronDown, MoreHorizontal, ChevronRight, ArrowUpDown, X, Search, RefreshCw } from "lucide-react";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { Label } from '@/components/ui/label';
import DriverDetails from './DriverDetailsInTable';
import { getLocalStorage } from '@/common';
import { useCities } from './Header';

const DeleteDriverDialog = ({ isOpen, onClose, driverId, onDriverDeleted }) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const modalRef = useRef(null);

    // Handle clicks outside the modal to close it
    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target) && !isDeleting) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [isOpen, onClose, isDeleting]);

    // Close on ESC key press
    useEffect(() => {
        const handleEscape = (event) => {
            if (event.key === 'Escape' && !isDeleting) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose, isDeleting]);

    const handleDelete = async () => {
        if (!driverId) return;

        try {
            setIsDeleting(true);
            const token = localStorage.getItem('token')
            const response = await axios.delete(
                `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driver/${driverId}`, { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                alert('Driver deleted successfully');
                onDriverDeleted(); // Call the callback to refresh the data
            } else {
                alert('Failed to delete driver');
            }
        } catch (error) {
            console.error("Error deleting driver:", error);
            alert('An error occurred while deleting the driver');
        } finally {
            setIsDeleting(false);
            onClose(); // Close dialog regardless of outcome
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center" onClick={onClose}>
            <div
                ref={modalRef}
                className="bg-white rounded-lg p-6 w-[400px] shadow-lg"
                onClick={e => e.stopPropagation()}
            >
                <div className="mb-4">
                    <h3 className="text-lg font-medium">Confirm Deletion</h3>
                    <p className="text-sm text-gray-500 mt-1">
                        Are you sure you want to delete this driver? This action cannot be undone.
                    </p>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                    <button
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        onClick={onClose}
                        disabled={isDeleting}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? (
                            <div className="flex items-center gap-2">
                                <Oval
                                    height={16}
                                    width={16}
                                    color="white"
                                    secondaryColor="rgba(255, 255, 255, 0.5)"
                                    strokeWidth={3}
                                    strokeWidthSecondary={3}
                                />
                                <span>Deleting...</span>
                            </div>
                        ) : (
                            "Confirm"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};


function DataTableNew() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [page, setPage] = useState(1);
    const [goToPage, setGoToPage] = useState("");
    const [totalPages, setTotalPages] = useState(1);
    const [totalDrivers, setTotalDrivers] = useState(0)
    const [applyButton, setApplyButton] = useState(false);
    const [exportLoading, setExportLoading] = useState(false);

    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("ALL");
    const [verificationFilter, setVerificationFilter] = useState("ALL");
    const [rcNumberPresent, setRcNumberPresent] = useState(false);
    const [missingDocsFilter, setMissingDocsFilter] = useState([]);

    const [expandedRowId, setExpandedRowId] = useState(null);
    const handleRowClick = (rowId) => {
        setExpandedRowId(expandedRowId === rowId ? null : rowId);
    };

    const [searchParams, setSearchParams] = useSearchParams();

    const [driverToDelete, setDriverToDelete] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const sortByOptions = ["created at: desc", "created at: asc", "updatedAt: desc", "updatedAt: asc"]
    const missingDocOptions = [
        { label: "No Missing Docs", value: "NONE" },
        { label: "DL Missing", value: "DL" },
        { label: "DL Back Missing", value: "DLB" },
        { label: "RC Missing", value: "RC" },
        { label: "RC Back Missing", value: "RCB" },
        { label: "Profile Missing", value: "PF" },
    ];

    const [sortby, setSortby] = useState("created at: desc")

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

                    Joining

                </div>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt")); // Convert to Date object
                const options = { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' }; // Options for formatting
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

                    Name

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
            cell: ({ row }) => <div>{row.original?.isCompleteRegistration ? 'VERIFIED' : row.original?.licenseNumber && row.original?.vehicleNumber && row.original?.name ? row.original?.paymentTransactionId ? 'PENDING' : 'FEES PENDING' : 'NOT'}</div>,
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
                <div>
                    Updated

                </div>
            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("updatedAt")); // Convert to Date object
                const options = { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric' }; // Options for formatting
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
                        <TableCell onClick={(e) => e.stopPropagation()}>
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
                        </TableCell>

                    </>
                );
            },
        },
    ];


    const handleExportExcel = async () => {
        try {
            setExportLoading(true);

            // Prepare the filter parameters based on current filters
            const exportParams = {
                startDate,
                endDate,
                status: statusFilter !== "ALL" ? statusFilter : undefined,
                categoryFilter: categoryFilter !== "ALL" ? categoryFilter : undefined,
                verificationFilter: verificationFilter !== "ALL" ? verificationFilter : undefined,
                missingDocsFilter: missingDocsFilter.length > 0 ? missingDocsFilter : undefined,
                rcNumberPresent: rcNumberPresent ? 'true' : undefined,
                searchQuery: searchQuery || undefined
            };

            // Call the export API
            const token = localStorage.getItem('token')
            const response = await axios.post(
                `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/exportDriver`,
                exportParams, { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data.success) {
                const driverData = response.data.data;

                // Format data for Excel
                const worksheetData = driverData.map(driver => {
                    // Format category display
                    let category = driver.category;
                    if (category === "HATCHBACK") category = "CAB";
                    else if (category === "SEDAN") category = "ELITE";

                    // Check verification status
                    let verificationStatus = "NOT";
                    if (driver.isCompleteRegistration) {
                        verificationStatus = "VERIFIED";
                    } else if (driver.licenseNumber && driver.vehicleNumber && driver.name && driver.name !== "null") {
                        if (driver.paymentTransactionId) verificationStatus = "PENDING";
                        else verificationStatus = "FEES PENDING";
                    }

                    // Determine missing documents
                    const missingDocs = [];
                    if (!driver.drivingLicense) missingDocs.push("DL");
                    if (!driver.drivingLicenseBack) missingDocs.push("DLB");
                    if (!driver.registrationCertificate) missingDocs.push("RC");
                    if (!driver.registrationCertificateBack) missingDocs.push("RCB");
                    if (!driver.profileUrl) missingDocs.push("PF");

                    return {
                        'ID': driver._id,
                        'Name': driver.name || 'N/A',
                        'Phone': driver.phone || 'N/A',
                        'Email': driver.email || 'N/A',
                        'RC Number': driver.vehicleNumber || 'N/A',
                        'License Number': driver.licenseNumber || 'N/A',
                        'Category': category || 'N/A',
                        'Status': driver.status || 'N/A',
                        'Verification Status': verificationStatus,
                        'Total Rides': driver.totalRides || 0,
                        'Total Earnings': driver.totalEarnings ? `₹${driver.totalEarnings}` : '₹0',
                        'Average Rating': driver.avgRating?.toFixed(1) || 'N/A',
                        'Missing Documents': missingDocs.length > 0 ? missingDocs.join(", ") : "None",
                        'DL Present': driver.drivingLicense ? 'Yes' : 'No',
                        'DL Back Present': driver.drivingLicenseBack ? 'Yes' : 'No',
                        'RC Present': driver.registrationCertificate ? 'Yes' : 'No',
                        'RC Back Present': driver.registrationCertificateBack ? 'Yes' : 'No',
                        'Profile Photo': driver.profileUrl ? 'Yes' : 'No',
                        'Created At': new Date(driver.createdAt).toLocaleString(),
                        'Updated At': new Date(driver.updatedAt).toLocaleString()
                    };
                });

                // Create worksheet
                const worksheet = XLSX.utils.json_to_sheet(worksheetData);

                // Add column widths for better readability
                const wscols = [
                    { wch: 24 }, // ID
                    { wch: 18 }, // Name
                    { wch: 15 }, // Phone
                    { wch: 25 }, // Email
                    { wch: 15 }, // RC Number
                    { wch: 15 }, // License Number
                    { wch: 12 }, // Category
                    { wch: 12 }, // Status
                    { wch: 15 }, // Verification Status
                    { wch: 12 }, // Total Rides
                    { wch: 15 }, // Total Earnings
                    { wch: 15 }, // Average Rating
                    { wch: 20 }, // Missing Documents
                    { wch: 12 }, // DL Present
                    { wch: 12 }, // DL Back Present
                    { wch: 12 }, // RC Present
                    { wch: 12 }, // RC Back Present
                    { wch: 15 }, // Profile Photo
                    { wch: 20 }, // Created At
                    { wch: 20 }  // Updated At
                ];
                worksheet['!cols'] = wscols;

                // Create workbook and add the worksheet
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Drivers');

                // Generate Excel file
                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                // Create a download link and trigger download
                const today = new Date().toISOString().split('T')[0];
                const fileName = `Drivers_Export_${today}.xlsx`;
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
            console.error("Error exporting drivers:", err);
            setError("Error exporting data");
        } finally {
            setExportLoading(false);
        }
    };


    const openDeleteDialog = (driverId) => {

        setDriverToDelete(driverId);
        setIsDeleteDialogOpen(true);
    };

    //for syncing 
    const handleUpdateDriver = (updatedDriver) => {
        if (updatedDriver && updatedDriver?._id) {
            setData((prevData) =>
                prevData.map((driver) =>
                    driver._id === updatedDriver._id ? updatedDriver : driver
                )
            )
        }
        // fetchDrivers();
    };

    const handleDriverDeleted = () => {
        fetchDrivers(); // Refresh the data
    };

    const handleStatusUpdate = async (driverId, currentStatus) => {
        try {
            const token = localStorage.getItem('token')
            await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driver/${driverId}/completeEdit`, {
                completeStatus: !currentStatus // Toggle the status
            }, { headers: { Authorization: `Bearer ${token}` } });

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
            const token = localStorage.getItem('token')
            currentStatus = currentStatus == "REJECTED" ? 'OFFLINE' : 'REJECTED'
            await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driver/${driverId}/completeEdit`, {
                status: currentStatus // Toggle the status
            }, { headers: { Authorization: `Bearer ${token}` } });

            const updatedData = data.map(driver => driver._id === driverId ? { ...driver, status: currentStatus } : driver);
            setData(updatedData);

            alert(`Driver marked as ${currentStatus == "REJECTED" ? 'REJECTED' : 'OFFLINE'}`);

        } catch (error) {
            console.error("Error updating status:", error);
            setError('Error updating status');
        }
    };

    const toggleSelection = (value) => {
        setMissingDocsFilter((prev) =>
            prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
        );
    };


    const { selectedCities } = useCities();
    const fetchDrivers = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/getAllDriversNew`, { cityIds: selectedCities }, {
                params: {
                    startDate,
                    endDate,
                    status: statusFilter,
                    page,
                    limit: 10,
                    searchQuery,
                    categoryFilter,
                    verificationFilter,
                    rcNumberPresent,
                    missingDocsFilter,
                    sortby
                },
                headers: { Authorization: `Bearer ${token}` }
            },);

            console.log(response.data, "response");
            setData(response.data.rides);
            setTotalPages(response.data.totalPages);
            setTotalDrivers(response.data.totalDrivers)
        } catch (err) {
            console.error("Error fetching drivers:", err);
            setError("Error fetching data");
        } finally {
            setLoading(false);
        }
    };

    // Only fetch when page changes or when filters are applied
    useEffect(() => {
        console.log("Fetching drivers - page or applyButton changed");
        fetchDrivers();
    }, [page, applyButton, selectedCities]);

    const applyFilters = () => {
        setPage(1); // Reset to first page when applying new filters
        updateUrlParams();
        setApplyButton(!applyButton); // Toggle this to trigger the useEffect
    };

    const handleSearch = () => {
        setPage(1); // Reset to first page when searching
        updateUrlParams();
        setApplyButton(!applyButton); // Toggle to trigger useEffect
    };

    const resetFilters = () => {
        // Reset all filter states to their default values
        setSearchQuery("");
        setStatusFilter("ALL");
        setCategoryFilter("ALL");
        setVerificationFilter("ALL");
        setRcNumberPresent(false);
        setMissingDocsFilter([]);
        setStartDate("");
        setEndDate("");
        setGoToPage("")
        setSortby("created at: desc")

        // Fetch with reset filters
        setPage(1);
        setSearchParams(new URLSearchParams());
        setApplyButton(!applyButton);
    };

    //req query
    useEffect(() => {
        // Initialize state from URL params
        setSearchQuery(searchParams.get('search') || "");
        setStatusFilter(searchParams.get('status') || "ALL");
        setCategoryFilter(searchParams.get('category') || "ALL");
        setVerificationFilter(searchParams.get('verification') || "ALL");
        setRcNumberPresent(searchParams.get('rcPresent') === 'true');
        setPage(parseInt(searchParams.get('page') || '1'));
        setSortby(searchParams.get('sortby') || "created at: desc");

        // Handle missing docs filter as comma-separated values
        const missingDocs = searchParams.get('missingDocs');
        if (missingDocs) {
            setMissingDocsFilter(missingDocs.split(','));
        }

        // Date filters
        if (searchParams.get('startDate')) setStartDate(searchParams.get('startDate'));
        if (searchParams.get('endDate')) setEndDate(searchParams.get('endDate'));

        // Fetch data if URL has parameters
        if (searchParams.toString()) {
            fetchDrivers();
        }
    }, []);

    const updateUrlParams = () => {
        const params = new URLSearchParams();

        if (searchQuery) params.set('search', searchQuery);
        if (statusFilter !== "ALL") params.set('status', statusFilter);
        if (categoryFilter !== "ALL") params.set('category', categoryFilter);
        if (verificationFilter !== "ALL") params.set('verification', verificationFilter);
        if (rcNumberPresent) params.set('rcPresent', 'true');
        if (page > 1) params.set('page', page.toString());
        if (sortby !== "created at: desc") params.set('sortby', sortby);

        if (missingDocsFilter.length > 0) {
            params.set('missingDocs', missingDocsFilter.join(','));
        }

        if (startDate) params.set('startDate', startDate);
        if (endDate) params.set('endDate', endDate);

        setSearchParams(params);
    };

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
        getSortedRowModel: getSortedRowModel(),
    });

    return (
        <div className='border-gray-200 border-2 rounded'>
            <div className="gap-4 p-4 mb-4">
                <div className="flex gap-2 justify-between items-center">
                    <div className='flex gap-x-6'>
                        <div className='flex gap-2'>
                            <Input
                                placeholder="Search by name, phone..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-60"
                            />
                            <Button
                                onClick={handleSearch}
                                variant="default"
                                className="flex items-center gap-1"
                            >
                                <Search className="h-4 w-4" />
                                Search
                            </Button></div>
                        <div className='flex items-center gap-2'>
                            <Label>Start Date</Label>
                            <Input className='w-[132px] p-2' type="date" onChange={(e) => { setStartDate(e.target.value) }} value={startDate}></Input>

                            <Label>End Date</Label>
                            <Input className='w-[132px] p-2' type="date" onChange={(e) => { setEndDate(e.target.value) }} value={endDate}></Input>
                        </div></div>

                    <div className='flex p-4 gap-x-2 justify-end pr-8'>
                        {/* Apply Filters Button */}
                        <Button
                            onClick={applyFilters}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                            Apply Filters
                        </Button>

                        {/* Reset Filters Button */}
                        <Button
                            onClick={resetFilters}
                            variant="outline"
                            className="flex items-center gap-1"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Reset Filters
                        </Button>

                        <Button
                            onClick={handleExportExcel}
                            variant="outline"
                            className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
                            disabled={exportLoading}
                        >
                            {exportLoading ? (
                                <>
                                    <Oval
                                        height={16}
                                        width={16}
                                        color="currentColor"
                                        secondaryColor="rgba(0, 128, 0, 0.2)"
                                        strokeWidth={3}
                                        strokeWidthSecondary={3}
                                    />
                                    <span>Exporting...</span>
                                </>
                            ) : (
                                <>
                                    <Download className="h-4 w-4" />
                                    Export Excel
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                <div className='flex gap-4 mt-2'>

                    <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Status</SelectItem>
                            <SelectItem value="OFFLINE">Offline</SelectItem>
                            <SelectItem value="AVAILABLE">Available</SelectItem>
                            <SelectItem value="LOW_BALANCE">Low Balance</SelectItem>
                            <SelectItem value="REJECTED">Rejected</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Categories</SelectItem>
                            <SelectItem value="AUTO">Auto</SelectItem>
                            <SelectItem value="CAB">Cab</SelectItem>
                            <SelectItem value="ELITE">Elite</SelectItem>
                            <SelectItem value="SUV">SUV</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={verificationFilter} onValueChange={(value) => setVerificationFilter(value)}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Verification" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Verification</SelectItem>
                            <SelectItem value="VERIFIED">Verified</SelectItem>
                            <SelectItem value="NOT">Not Verified</SelectItem>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="FEES PENDING"> Fees Pending</SelectItem>
                        </SelectContent>
                    </Select>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="rcNumberPresent"
                            checked={rcNumberPresent}
                            onCheckedChange={() => setRcNumberPresent(!rcNumberPresent)}
                        />
                        <label htmlFor="rcNumberPresent">RC Number Present</label>
                    </div>

                    {/* //missing  */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-[180px]">
                                Missing Docs
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[200px]">
                            {missingDocOptions.map((item) => (
                                <DropdownMenuCheckboxItem
                                    key={item.value}
                                    checked={missingDocsFilter.includes(item.value)}
                                    onCheckedChange={() => toggleSelection(item.value)}
                                >
                                    {item.label}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>


                    <div className='flex items-center gap-x-2'>
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

                </div>

            </div>
            <div className='mx-4 border-2 border-gray-100'>
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
                                                {/* Expanded row content */}
                                                <DriverDetails data={row.original} onDriverUpdated={handleUpdateDriver} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ]).flat())
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {loading ? (
                                        <div className="flex justify-center">
                                            <Oval
                                                height={30}
                                                width={30}
                                                color="#3b82f6"
                                                secondaryColor="#dbeafe"
                                                strokeWidth={4}
                                                strokeWidthSecondary={4}
                                            />
                                        </div>
                                    ) : error ? (
                                        <div className="text-red-500">{error}</div>
                                    ) : (
                                        "No results found."
                                    )}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table></div>
            <div className='flex items-center justify-between mx-4 text-sm'>
                <div className='mt-4 text-gray-500'>
                    Total Drivers : {totalDrivers}
                </div>
                <div className="flex justify-end items-center mt-4 gap-x-2">
                    <Button
                        variant="outline"
                        disabled={page === 1 || loading}
                        onClick={() => {
                            const newPage = page - 1;
                            setPage(newPage);
                            searchParams.set('page', newPage.toString());
                            setSearchParams(searchParams);
                        }}
                    >
                        Previous
                    </Button>
                    <span>Page {page} of {totalPages || 1}</span>
                    <Button
                        variant="outline"
                        disabled={page === totalPages || totalPages === 0 || loading}
                        onClick={() => {
                            const newPage = page + 1;
                            setPage(newPage);
                            searchParams.set('page', newPage.toString());
                            setSearchParams(searchParams);
                        }}
                    >
                        Next
                    </Button>
                </div>
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
                            searchParams.set('page', newPage.toString());
                            setSearchParams(searchParams);
                            setGoToPage("")
                        }}
                        disabled={!goToPage || goToPage < 1 || goToPage > totalPages}
                    >
                        Go To Page
                    </Button>
                </div>
            </div>
            {/* //dialog for deleting driver */}
            <DeleteDriverDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                driverId={driverToDelete}
                onDriverDeleted={handleDriverDeleted}
            />
        </div>
    );
}

export default DataTableNew;