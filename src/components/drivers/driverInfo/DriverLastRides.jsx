import React, { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { SELLER_URL_LOCAL } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

function DriverLastRides({ driverId, data }) {
    const [driverdata, setDriverdata] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRides, setTotalRides] = useState(0);

    const [status, setStatus] = useState('ALL');

    const [loading, setLoading] = useState(false)

    const statusOptions = [
        { value: 'ALL', label: 'All Rides' },
        { value: 'ACTIVE', label: 'Active' },
        { value: 'COMPLETED', label: 'Completed' },
        { value: 'CANCELLED', label: 'Cancelled' },
        { value: 'PENDING', label: 'Pending' },


    ];

    console.log(data, "data")

    useEffect(() => {
        if (driverId) {
            fetchRides(currentPage);
        }
    }, [driverId, currentPage, status]);

    const fetchRides = async (page) => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/getLastRides`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: driverId,
                    page: page,
                    status: status
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setDriverdata(data.rides);
            setTotalPages(data.pagination.totalPages);
            setTotalRides(data.pagination.totalRides);
        }
        catch (err) {
            console.error("Error fetching rides:", err);
            setError(err.message);
        } finally {
            setLoading(false)
        }
    };

    const getStatusBadgeVariant = (status) => {
        switch (status?.toLowerCase()) {
            case 'completed': return 'default';
            case 'cancelled': return 'destructive';
            case 'in progress': return 'outline';
            default: return 'secondary';
        }
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    const navigate = useNavigate();

    const handleRowClick = (ride) => {
        if (ride) {
            navigate(`/rides/allRides/${ride.transaction_id}`)
        }
    }

    if (error) {
        return <div>Error loading rides: {error}</div>;
    }

    return (
        <div className='border my-2 mb-4 mx-8'>
            <div className="p-4">
                <select
                    value={status}
                    onChange={(e) => {
                        setStatus(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="border p-2 rounded"
                >
                    {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>
            {loading ? "Loading..." :
                driverdata.length ? <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>User Name</TableHead>
                            <TableHead>User Number</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Fare</TableHead>
                            <TableHead>Updated At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {driverdata.map((ride) => (
                            <TableRow key={ride._id} onClick={() => handleRowClick(ride)}>
                                <TableCell>
                                    {ride.createdAt
                                        ? format(new Date(ride.createdAt), 'PPp')
                                        : 'N/A'}
                                </TableCell>
                                <TableCell>{ride?.userInfo?.name}</TableCell>
                                <TableCell>{ride?.userInfo?.phone}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(ride.status)}>
                                        {ride.status || 'Unknown'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{ride.fare || 'N/A'}</TableCell>

                                <TableCell>
                                    {ride.updatedAt
                                        ? format(new Date(ride.createdAt), 'PPp')
                                        : 'N/A'}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table> : <div className='p-4'>No rides with specified status.</div>}

            <div className="flex justify-between items-center p-4">
                <span>
                    Page {currentPage} of {totalPages} (Total Rides: {totalRides})
                </span>
                <div className="space-x-2">
                    <Button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        Previous
                    </Button>
                    <Button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        Next
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default DriverLastRides;