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
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";
import { SELLER_URL_LOCAL } from '@/lib/utils';

function UserLastRides({ userId, data }) {
    const [userdata, setUserdata] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId) {
            fetchRides();
        }
    }, [userId]);

    const fetchRides = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/getLastTenRides`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ id: userId }),
            });

            console.log(response, "respnose in fetchrides")

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("ride data is", data)
            setUserdata(data.rides);
        }
        catch (err) {
            console.error("Error fetching rides:", err);
            setError(err.message);
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

    if (error) {
        return <div>Error loading rides: {error}</div>;
    }

    return (
        <div className='border my-2 mb-4'>
            <Table>
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
                        <TableRow key={ride.createdAt}>

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
            </Table>
        </div>
    );
}

export default UserLastRides;