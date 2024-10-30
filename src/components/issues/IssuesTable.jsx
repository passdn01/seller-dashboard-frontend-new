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
import { ChevronDown } from "lucide-react";

import { Button } from "../ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
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
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import EditIssue from './EditIssue';

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
        accessorKey: "_id",
        header: "Issue ID",
        cell: ({ row }) => <div>{row.getValue("_id")}</div>,
    },
    {
        accessorKey: "complainName",
        header: "Complainant Name",
        cell: ({ row }) => <div>{row.original.complainant_info.person.name}</div>,
    },
    {
        accessorKey: "complainNumber",
        header: "Complainant Number",
        cell: ({ row }) => <div>{row.original.complainant_info.contact.phone}</div>,
    },
    {
        accessorKey: "complainantStatus",
        header: "Complainant Status",
        cell: ({ row }) => <div>{row.original.issue_actions.complainant_actions.slice(-1)[0]?.complainant_action}</div>,
    },
    {
        accessorKey: "respondentName",
        header: "Respondent Name",
        cell: ({ row }) => <div>{row.original.respondent_actions.slice(-1)[0]?.updated_by.person.name}</div>,
    },
    {
        accessorKey: "respondentStatus",
        header: "Respondent Status",
        cell: ({ row }) => <div>{row.original.respondent_actions.slice(-1)[0]?.respondent_action}</div>,
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <div>{row.getValue("status")}</div>,
    },
    {
        id: "actions",
        header: "Actions",
        enableHiding: false,
        cell: ({ row }) => {
            const issue = row.original;
            // console.log(row.original.respondent_actions.slice(-1)[0]?.respondent_action0);
    
            return (
                <>
                    <Dialog>
                        <DialogTrigger>
                            <button>
                                Edit
                            </button>
                        </DialogTrigger>
                        <DialogContent className="mt-2 mb-2 max-w-lg w-full mx-auto p-2 bg-white rounded-lg shadow-lg">
                            <EditIssue Id={issue._id} />
                        </DialogContent>
                    </Dialog>
                </>
            );
        },
    },
];

export default function IssueTable() {
    const [sorting, setSorting] = useState([]);
    const [issueColumnFilters, setIssueColumnFilters] = useState([]);
    const [columnVisibility, setColumnVisibility] = useState({});
    const [rowSelection, setRowSelection] = useState({});
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [globalFilter, setGlobalFilter] = useState("");
    // const [isDialogOpen, setDialogOpen] = useState(false);

    // const handleDialogClose = () => {
    //     setDialogOpen(false);
    //     fetchData(); // Fetch data when the dialog is closed
    // };
    
    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axios.get('https://seller.passdn.com/all_issues');
            console.log(response.data)
            setData(response.data);
            sessionStorage.setItem('myIssueData', JSON.stringify(response.data));
            sessionStorage.setItem('lastFetchTime', Date.now().toString());
            console.log("running")
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        const storedData = sessionStorage.getItem('myIssueData');
        const lastFetchTime = sessionStorage.getItem('lastFetchTime');
        const currentTime = Date.now();
        const timeSinceLastFetch = currentTime - (lastFetchTime ? parseInt(lastFetchTime) : 0);
    
        if (storedData && timeSinceLastFetch < 60000) {
            setData(JSON.parse(storedData));
            setLoading(false);
        } else {
            fetchData();
        }
    }, []);    

    const table = useReactTable({
        data,
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
    const statusOptions = [...new Set(data.map(item => item.status))];

    return (
        <div className="w-full max-w-6xl overflow-x-hidden mx-auto px-6">
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
                {/* <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger>
                        <Button className="text-white text-md border-2 ml-2 p-1 pr-4 pl-4 rounded-md float-right">Add</Button>
                    </DialogTrigger>
                    <DialogContent className="mt-2 mb-2 max-w-lg w-full mx-auto p-2 bg-white rounded-lg shadow-lg">
                        <AddIssue onClose={handleDialogClose} />
                    </DialogContent>
                </Dialog> */}
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