import { useEffect, useState } from "react";
import React from 'react'
import axios from "axios";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal, Calendar, X } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../ui/dropdown-menu";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";
import { Oval } from "react-loader-spinner";
import { useNavigate } from "react-router-dom";
import { SELLER_URL_LOCAL } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import IssueDetailExpandable from "../issueDetailInTable";
import moment from 'moment-timezone'

const IssueAssigner = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [solvers, setSolvers] = useState([]);
    const [selectedSolver, setSelectedSolver] = useState({});
    const [issueColumnFilters, setIssueColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sortby, setSortby] = useState("created at: desc")
    const [statusFilter, setStatusFilter] = useState("All");
    const [globalFilter, setGlobalFilter] = useState("");
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [goToPage, setGoToPage] = useState("");
    const [applyButton, setApplyButton] = useState(false);
    const [selectedIssueId, setSelectedIssueId] = useState(null);

    // Date filter states using simple input type="date"
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [ticketLoading, setTicketLoading] = useState(false);
    const [solverLoading, setSolverLoading] = useState(false);


    const userId = localStorage.getItem("userId");
    const fetchTickets = async () => {
        setTicketLoading(true);
        try {
            const params = {
                status: statusFilter !== "All" ? statusFilter : undefined,
                search: globalFilter || undefined,
                page: page,
                limit: 10,
                sortby,
                startDate: startDate || undefined,
                endDate: endDate || undefined
            };
            const token = localStorage.getItem("token");
            const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/tickets`, { params: { ...params }, headers: { Authorization: `Bearer ${token}` } });
            console.log(response.data, response)
            setTickets(response.data.tickets);
            setTotalPages(response.data.totalPages);
        } catch (err) {
            setError("Failed to load tickets");
        } finally {
            setTicketLoading(false);
        }
    };


    useEffect(() => {
        const fetchSolvers = async () => {
            setSolverLoading(true);
            try {
                const token = localStorage.getItem("token");
                const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/tickets/solvers`, { headers: { Authorization: `Bearer ${token}` } });
                if (response?.data) {
                    setSolvers(response.data);
                }
            } catch (err) {
                setError("Failed to load solvers");
            } finally {
                setSolverLoading(false);
            }
        };
        fetchSolvers();
    }, []);

    useEffect(() => {
        console.log("in use effect")
        fetchTickets();
    }, [page, applyButton]);

    // Assign a ticket to a solver
    const handleAssignTicket = async (ticketId, solverId) => {
        if (!solverId) {
            alert("Please select a solver before assigning!");
            return;
        }

        console.log("Assigning ticket", userId, "to solver", solverId, ticketId);

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/tickets/assign`, {
                assignerId: userId,
                ticketId,
                solverId
            }, { headers: { Authorization: `Bearer ${token}` } });

            // Find the full solver object by ID
            const assignedSolver = solvers.find(solver => solver._id === solverId);

            // Update tickets with solver details
            setTickets(tickets.map(ticket =>
                ticket._id === ticketId
                    ? { ...ticket, solverId: assignedSolver, status: "In Progress" }
                    : ticket
            ));

            alert("Ticket assigned successfully!");
        } catch (err) {
            alert("Failed to assign ticket");
        } finally {
            setLoading(false);
        }
    };

    const handleRowClick = (issueId) => {
        // Toggle the selected issue if clicking the same row again
        setSelectedIssueId(prevId => prevId === issueId ? null : issueId);
    };

    const closeIssueDetail = () => {
        setSelectedIssueId(null);
    };

    const handleReset = () => {
        setStatusFilter("All");
        setSortby("created at: desc");
        setStartDate("");
        setEndDate("");
        setGlobalFilter("");
        setPage(1);
        fetchTickets();
    }

    // Helper function to format a date for display
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Define columns for the table
    const columns = [
        {
            accessorKey: "serialNo",
            header: "S.No",
            cell: ({ row }) => <div>{row.index + 1}</div>, // Adding 1 to start from 1 instead of 0
        },
        {
            accessorKey: "_id",
            header: "Ticket ID",
            cell: ({ row }) => <div>{row.getValue("_id")}</div>,
        },
        {
            accessorKey: "createdAt",
            header: ({ column }) => (
                <div className="flex items-center gap-2">
                    Joining
                </div>
            ),
            cell: ({ row }) => {
                const createdAt = row.getValue("createdAt");
                const formattedDate = moment.tz(createdAt, "Asia/Kolkata").format("DD MMMM YYYY");

                return <span>{formattedDate}</span>;
            },
        },
        {
            accessorKey: "user",
            header: "User",
            cell: ({ row }) => {
                const user = row.original.userId;
                return <div>{user ? `${user.firstName} ${user.lastName}` : "User Not Available"}</div>;
            }
        },
        {
            header: "User Number",
            cell: ({ row }) => {
                const user = row.original.userId;
                console.log(user, "user in user number")
                return <div>{user ? `${user.phone}` : "N/A"}</div>;
            }
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <div>{row.getValue("status")}</div>,
        },
        {
            accessorKey: "updatedAt",
            header: ({ column }) => (
                <div>
                    Updated</div>

            ),
            cell: ({ row }) => {
                const date = new Date(row.getValue("updatedAt")); // Convert to Date object
                const options = { day: 'numeric', month: 'long', year: 'numeric' }; // Options for formatting
                const formattedDate = date.toLocaleDateString('en-US', options); // Format the date

                return <div>{formattedDate}</div>; // Render the formatted date
            },
        },
        {
            id: "assignSolver",
            header: "Assign Solver",
            cell: ({ row }) => (
                <Select
                    value={selectedSolver[row.original._id] || row.original.solverId?._id || ""}
                    onValueChange={(value) => {
                        setSelectedSolver({ ...selectedSolver, [row.original._id]: value });
                        handleAssignTicket(row.original._id, value);
                    }}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue>
                            {solvers.find(solver => solver._id === (selectedSolver[row.original._id] || row.original.solverId?._id))?.name || "Select Solver"}
                        </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                        {solvers.map(solver => (
                            <SelectItem key={solver._id} value={solver._id}>
                                {solver.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            ),
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const tickets = row.original;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="h-8 w-8 p-0"
                                onClick={(e) => e.stopPropagation()} // Prevent row click when clicking dropdown
                            >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/issueDetail/${tickets._id}`);
                            }}>
                                View issue Details (Full Page)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => {
                                e.stopPropagation();
                                handleRowClick(tickets._id);
                            }}>
                                {selectedIssueId === tickets._id ? "Hide Details" : "Show Details"}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        },
    ];

    const tableData = React.useMemo(
        () => (ticketLoading ? Array(10).fill({}) : tickets),
        [ticketLoading, tickets]
    );
    const tableColumns = React.useMemo(
        () =>
            ticketLoading
                ? columns.map((column) => ({
                    ...column,
                    cell: () => (
                        <div className='h-8 bg-gray-100 rounded'></div>
                    )
                }))
                : columns,
        [ticketLoading, solverLoading, loading]
    );

    const table = useReactTable({
        data: tableData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

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

    const statusOptions = ["All", "In Progress", "Pending", "Completed", "Active"];
    const sortByOptions = ["created at: desc", "created at: asc", "updatedAt: desc", "updatedAt: asc"];

    // Helper function to render rows with issue details
    const renderRowsWithDetails = () => {
        if (!table.getRowModel().rows?.length) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                        {ticketLoading ? "Loading..." : "No Results."}
                    </TableCell>
                </TableRow>
            );
        }

        // Flatten to handle the detail rows
        return table.getRowModel().rows.flatMap((row) => {
            const isSelected = row.original?._id === selectedIssueId;

            const result = [
                <TableRow
                    key={row.id}
                    data-state={!loading && row.getIsSelected() && "selected"}
                    className={`${loading ? '' : "cursor-pointer hover:bg-gray-100"} ${isSelected ? "bg-gray-100" : ""}`}
                    onClick={() => !loading && !ticketLoading && row.original?._id && handleRowClick(row.original._id)}
                >
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id} className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                    ))}
                </TableRow>
            ];

            // Add the detail row if this row is selected
            if (isSelected && row.original?._id) {
                result.push(
                    <IssueDetailExpandable
                        key={`detail-${row.id}`}
                        issueId={row.original._id}
                        onClose={closeIssueDetail}
                    />
                );
            }

            return result;
        });
    };

    return (
        <div className='p-6 text-sm'>
            {/* Search Filter */}
            <div className="flex px-4 pb-6">
                <Input
                    placeholder="Search tickets..."
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                    className="w-[350px]"
                />
            </div>

            <div className="flex flex-wrap gap-4 px-4 pb-6 items-end">

                {/* Status Filter */}
                <div>
                    <Label>Status</Label>
                    <Select onValueChange={setStatusFilter} value={statusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by status" />
                        </SelectTrigger>
                        <SelectContent>
                            {statusOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Sort By Filter */}
                <div>
                    <Label>Sort by</Label>
                    <Select onValueChange={setSortby} value={sortby}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="created at: desc" />
                        </SelectTrigger>
                        <SelectContent>
                            {sortByOptions.map((status) => (
                                <SelectItem key={status} value={status}>
                                    {status}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Simple Date Filters */}
                <div>
                    <Label>Start Date</Label>
                    <div className="relative">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-[180px] pl-9"
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        {startDate && (
                            <button
                                onClick={() => setStartDate("")}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                <div>
                    <Label>End Date</Label>
                    <div className="relative">
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="w-[180px] pl-9"
                            min={startDate}
                        />
                        <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                        {endDate && (
                            <button
                                onClick={() => setEndDate("")}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-x-4'>
                    <Button onClick={() => setApplyButton(!applyButton)} disabled={loading}>Apply filters</Button>
                    <Button onClick={handleReset} variant="outline" disabled={loading}>Reset filters</Button>
                </div>
            </div>

            {/* Date filter info */}
            {(startDate || endDate) && (
                <div className="mb-4 ml-4">
                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>
                            Showing tickets from
                            {startDate ? ` ${formatDateForDisplay(startDate)}` : " all time"}
                            {endDate ? ` to ${formatDateForDisplay(endDate)}` : ""}
                        </span>
                    </div>
                </div>
            )}

            <div className='border-gray-200 border-2 rounded'>
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
                        {renderRowsWithDetails()}
                    </TableBody>
                </Table>
            </div>
            <div className='flex gap-x-4 items-center justify-between p-4'>
                {/* Previous Button */}
                <div className="flex gap-4 items-center">
                    <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>

                    <span>Page {page} of {totalPages}</span>

                    {/* Next Button */}
                    <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
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
                        />
                    </div>
                    <Button
                        onClick={() => {
                            const newPage = Math.max(1, Math.min(totalPages, Number(goToPage)));
                            setPage(newPage);
                            setGoToPage("");
                        }}
                        disabled={!goToPage || goToPage < 1 || goToPage > totalPages}
                    >
                        Go To Page
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default IssueAssigner;