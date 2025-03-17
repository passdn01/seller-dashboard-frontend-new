import { useEffect, useState } from "react";
import axios from "axios";
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
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
import IssueDetailExpandable from "../issueDetailInTable";

const IssueSolver = () => {
    const navigate = useNavigate();
    const [tickets, setTickets] = useState([]);
    const [issueColumnFilters, setIssueColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [sorting, setSorting] = useState([]);
    const [statusFilter, setStatusFilter] = useState("all");
    const [globalFilter, setGlobalFilter] = useState("");
    const [selectedIssueId, setSelectedIssueId] = useState(null);

    const [ticketLoading, setTicketLoading] = useState(false);

    const userId = localStorage.getItem("userId");

    // Fetch all assigned tickets
    const fetchTickets = async () => {
        setTicketLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/tickets/assigned/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
            console.log(response, "response");
            setTickets(response.data);
        } catch (err) {
            setError("Failed to load tickets");
        } finally {
            setTicketLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    // mark issue as complete
    const markComplete = async (ticketId, e) => {
        // Prevent row click event when clicking the button
        if (e) {
            e.stopPropagation();
        }

        try {
            const token = localStorage.getItem("token");
            await axios.put(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/tickets/${ticketId}/solve`, {}, { headers: { Authorization: `Bearer ${token}` } });
            // Refresh issue details after marking as complete
            fetchTickets();
        } catch (err) {
            setError("Failed to mark the ticket as complete");
        }
    };

    const handleRowClick = (issueId) => {
        // Toggle the selected issue if clicking the same row again
        setSelectedIssueId(prevId => prevId === issueId ? null : issueId);
    };

    const closeIssueDetail = () => {
        setSelectedIssueId(null);
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
            accessorKey: "assigner",
            header: "Assigner",
            cell: ({ row }) => {
                const assigner = row.original.assignerId;
                return <div>{assigner ? `${assigner.name}` : "Assigner Not Available"}</div>;
            }
        },
        {
            id: "markComplete",
            header: "Mark Complete",
            cell: ({ row }) => (
                <Button
                    onClick={(e) => markComplete(row.original._id, e)}
                    disabled={loading || row.original.status === "Completed"}
                >
                    {row.original.status === "Completed" ? "Completed" : "Mark Complete"}
                </Button>
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

    // Initialize the table
    const table = useReactTable({
        data: tickets,
        columns,
        onSortingChange: setSorting,
        onissueColumnFiltersChange: setIssueColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            issueColumnFilters,
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

    // Get unique status values for the filter
    const statusOptions = [...new Set(tickets.map(item => item.status))];

    // Helper function to render rows with issue details
    const renderRowsWithDetails = () => {
        if (table.getRowModel().rows?.length === 0) {
            return (
                <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                        {ticketLoading ? "Loading..." : "No results."}
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
                    data-state={row.getIsSelected() && "selected"}
                    className={`${isSelected ? "bg-gray-100" : ""} cursor-pointer hover:bg-gray-100`}
                    onClick={() => !ticketLoading && row.original?._id && handleRowClick(row.original._id)}
                >
                    {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
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
        <div className="w-[90%] mx-12">
            <div className="flex items-center py-4">
                <Input
                    placeholder="Search all columns..."
                    value={globalFilter ?? ""}
                    onChange={(event) => setGlobalFilter(event.target.value)}
                    className="max-w-sm mr-4"
                />
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
                        {renderRowsWithDetails()}
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
};

export default IssueSolver;