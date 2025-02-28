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
import { ArrowUpDown, ChevronDown, MoreHorizontal } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    // DropdownMenuItem,
    // DropdownMenuLabel,
    // DropdownMenuSeparator,
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
    const [applyButton, setApplyButton] = useState(false);

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
                sortby
            };
            const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/tickets`, { params });
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
                const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/tickets/solvers`);
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
            await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/tickets/assign`, {
                assignerId: userId,
                ticketId,
                solverId
            });

            alert("Ticket assigned successfully!");
            setTickets(tickets.map(ticket =>
                ticket._id === ticketId ? { ...ticket, solverId, status: "In Progress" } : ticket
            ));
        } catch (err) {
            alert("Failed to assign ticket");
        } finally {
            setLoading(false);
        }
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
                        <SelectValue placeholder="Select Solver" />
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
            id: "assign",
            header: "Assign",
            cell: ({ row }) => (
                <Button
                    onClick={() => handleAssignTicket(row.original._id)}
                    disabled={loading}
                >
                    {loading ? "Assigning..." : "Assign"}
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
                            <DropdownMenuItem onClick={() => navigate(`/issueDetail/${tickets._id}`)}>
                                View issue Details
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
        [ticketLoading]
    );

    const table = useReactTable({
        data: tableData,
        columns: tableColumns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    const handleReset = () => {
        setStatusFilter("All")
        setSortby("created at: desc")
        fetchTickets();
    }


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
    const sortByOptions = ["created at: desc", "created at: asc", "updatedAt: desc", "updatedAt: asc"]


    return (
        <div className='p-6 text-sm'>

            <div className="flex gap-x-8 px-4 pb-4 items-center ">
                <div>
                    <Label>Status</Label><Select onValueChange={setStatusFilter} value={statusFilter}>
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

                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>,


                            ]).flat())
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {ticketLoading ? "Loading..." : "No Results."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className='flex gap-x-4 items-center'>
                {/* Previous Button */}
                <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</Button>

                <span>Page {page} of {totalPages}</span>

                {/* Next Button */}
                <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button></div>
        </div>

    );

};

export default IssueAssigner;