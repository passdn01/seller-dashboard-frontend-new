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

function UserLastRides({ userId, data }) {
    const [userdata, setUserdata] = useState([]);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalRides, setTotalRides] = useState(0);

    const [status, setStatus] = useState('ALL');

    const [loading, setLoading] = useState(false)

    const statusOptions = [
        { value: 'ALL', label: 'All Rides' },
        { value: 'RIDE_ENROUTE_PICKUP', label: 'Enroute Pickup' },
        { value: 'RIDE_ARRIVED_PICKUP', label: 'Arrived at Pickup' },
        { value: 'RIDE_STARTED', label: 'Ride Started' },
        { value: 'RIDE_ENDED', label: 'Ride Ended' },
        { value: 'RIDE_CANCELLED', label: 'Ride Cancelled' },
        { value: 'DRIVER_NOT_FOUND', label: 'Driver Not Found' },
        { value: 'FAKE_RIDE', label: 'Fake Ride' },
        { value: 'RIDE_CONFIRMED', label: 'Ride Confirmed' }
    ];

    useEffect(() => {
        if (userId) {
            fetchRides(currentPage);
        }
    }, [userId, currentPage, status]);

    const fetchRides = async (page) => {
        try {
            setLoading(true)
            const token = localStorage.getItem('token')
            const response = await fetch(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/getLastRides`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    id: userId,
                    page: page,
                    status: status
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            setUserdata(data.rides);
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
        console.log("clicked")
        if (ride) {
            navigate(`/rides/allRides/${ride.transaction_id}`)
        }
    }

    if (error) {
        return <div>Error loading rides: {error}</div>;
    }

    return (
        <div className='border my-2 mb-4'>
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
                userdata.length ? <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Fare</TableHead>
                            <TableHead>Driver</TableHead>
                            <TableHead>Updated At</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userdata.map((ride) => (
                            <TableRow key={ride._id} onClick={() => handleRowClick(ride)}>
                                <TableCell>
                                    {ride.createdAt
                                        ? format(new Date(ride.createdAt), 'PPp')
                                        : 'N/A'}
                                </TableCell>
                                <TableCell>{data?.firstName} {data?.lastName}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(ride.status)}>
                                        {ride.status || 'Unknown'}
                                    </Badge>
                                </TableCell>
                                <TableCell>{ride.fare || 'N/A'}</TableCell>
                                <TableCell>
                                    {ride.driverDetails?.vehicleDetail?.make || 'Unassigned'}
                                </TableCell>
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

export default UserLastRides;