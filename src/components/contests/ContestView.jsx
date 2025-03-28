import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, Edit } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const ContestView = () => {
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cityLoading, setCityLoading] = useState(false);
    const [city, setCity] = useState(null);
    const [driverLoading, setDriverLoading] = useState(false)
    const [drivers, setDrivers] = useState([])
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchContest();
        fetchDrivers();
    }, [id]);



    const fetchContest = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://3n8qx2vb-8055.inc1.devtunnels.ms/api/contest/${id}`);
            setContest(response.data.data);
            console.log(response.data.data, "ind contest ");
        } catch (error) {
            console.error('Error fetching contest:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDrivers = async () => {
        try {
            setDriverLoading(true);
            console.log("id in point api", id)
            const response = await axios.get(`https://3n8qx2vb-8055.inc1.devtunnels.ms/api/point/all/${id}`);

            setDrivers(response.data.data);
            console.log("drivers", response.data)
        } catch (err) {
            console.error('Error fetching drivers:', err);
        } finally {
            setDriverLoading(false);
        }
    };


    useEffect(() => {
        if (contest?.city && Array.isArray(contest.city) && contest.city.length > 0) {
            fetchCities(contest.city);
        }
    }, [contest]);


    const fetchCities = async (cityIds) => {
        try {
            setCityLoading(true);
            const cityNames = [];

            // Fetch each city
            for (const cityId of cityIds) {
                try {
                    const response = await axios.get(`https://3n8qx2vb-8055.inc1.devtunnels.ms/admin/city/${cityId}`);
                    if (response.data && response.data.name) {
                        cityNames.push(response.data.name);
                    }
                } catch (err) {
                    console.error(`Error fetching city with ID ${cityId}:`, err);
                }
            }

            setCity(cityNames);
        } catch (error) {
            console.error('Error fetching cities:', error);
            setCity([]);
        } finally {
            setCityLoading(false);
        }
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMMM dd, yyyy');
        } catch (e) {
            return dateString;
        }
    };
    const handleDriverClick = (driverId) => {
        window.open(`/drivers/allDrivers/${driverId}`, '_blank');
    };

    if (loading) {
        return (
            <div className="container mx-auto py-12 flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!contest) {
        return (
            <div className=" mx-16 py-12">
                <Card>
                    <CardContent className="py-12">
                        <div className="text-center">
                            <p className="text-lg text-muted-foreground">Contest not found</p>
                            <Button className="mt-4" onClick={() => navigate('/contests')}>
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Contests
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className=" mx-16 py-6">
            <div className="mb-6 flex items-center">
                <Button variant="ghost" onClick={() => navigate('/contests')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Contests
                </Button>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-2xl">{contest.title}</CardTitle>
                    <Button onClick={() => navigate(`/contests/edit/${id}`)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Contest
                    </Button>
                </CardHeader>

                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-medium">Contest Details</h3>
                        <Badge className='my-2 bg-gray-100 text-black '> Participants: {contest.participantCount}</Badge>
                        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Start Date</p>
                                <p className="font-medium">{formatDate(contest.startDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">End Date</p>
                                <p className="font-medium">{formatDate(contest.endDate)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Cities</p>
                                <p className="font-medium">
                                    {cityLoading ? (
                                        <Loader2 className="h-4 w-4 inline animate-spin mr-2" />
                                    ) : (
                                        Array.isArray(city) && city.length > 0 ?
                                            city.join(', ') : 'No cities assigned'
                                    )}
                                </p>
                            </div>

                            <div>
                                <p className="text-sm text-muted-foreground">Vehicle Types</p>
                                <p className="font-medium">

                                    {Array.isArray(contest.vehicleType) && contest.vehicleType.length > 0 ?
                                        contest.vehicleType.join(', ') : 'No vehicle types assigned'
                                    }
                                </p>
                            </div>
                            <div>
                                <p className="text-blue-800 text-sm text-muted-foreground">Contest Link</p>
                                <p className="font-medium">{contest?.videoLink || "No link given."}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Created</p>
                                <p className="font-medium">{formatDate(contest.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="font-medium">{contest?.description || "No description available"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Rules</p>
                        <p className="font-medium">{contest?.rules || "No rules specified"}</p>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">T&C</p>
                        <p className="font-medium">{contest?.tandc || "No T&C specified"}</p>
                    </div>
                    <div className='flex w-full gap-x-4 items-start'>
                        <div className='w-full'>
                            <h3 className="text-lg font-medium">Rewards</h3>
                            {Object.keys(contest.rewardList || {}).length === 0 ? (
                                <p className="mt-2 text-muted-foreground">No rewards defined for this contest.</p>
                            ) : (
                                <div className="mt-2 grid grid-cols-1 gap-4">
                                    {Object.entries(contest.rewardList || {}).map(([key, value]) => (
                                        <Card key={key} className="border border-muted">
                                            <CardContent className="p-4">
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium">{key}</p>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium">{value}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className='w-full'>
                            <h3 className="text-lg font-medium ">Drivers with points</h3>
                            {driverLoading ? (
                                <div className="flex justify-center py-4">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : drivers.length === 0 ? (
                                <p className="mt-2 text-muted-foreground">No drivers found for this contest.</p>
                            ) : (
                                <div className="mt-2 flex justify-start border-2 border-gray-200 max-h-[400px] overflow-y-auto">
                                    <Table className="relative">
                                        <TableHeader className="sticky top-0 bg-white z-10">
                                            <TableRow>
                                                <TableHead>Driver</TableHead>
                                                <TableHead>Vehicle Number</TableHead>
                                                <TableHead className="text-right">Total Points</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {drivers.map((driver) => (
                                                <TableRow key={driver.driverId}>
                                                    <TableCell>
                                                        <div className="flex items-center space-x-3">
                                                            <Avatar>
                                                                <AvatarImage
                                                                    src={driver.driverData.profileUrl || '/default-avatar.png'}
                                                                    alt={driver.driverData.name}
                                                                />
                                                                <AvatarFallback>
                                                                    {driver.driverData.name.split(' ').map(n => n[0]).join('')}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span
                                                                className="cursor-pointer hover:underline"
                                                                onClick={() => handleDriverClick(driver.driverId)}
                                                            >
                                                                {driver.driverData.name}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>{driver.driverData.vehicleNumber}</TableCell>
                                                    <TableCell className="text-right">{driver.totalPoints}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => navigate(`/contests/view/${contest?._id}/${driver?.driverId}`)}
                                                        >
                                                            View History

                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </div>




                </CardContent>

                <CardFooter className="border-t bg-muted/50 px-6 py-4">
                    <div className="text-sm text-muted-foreground">
                        Last updated: {formatDate(contest.updatedAt)}
                    </div>
                </CardFooter>
            </Card>
        </div>
    );
};

export default ContestView;