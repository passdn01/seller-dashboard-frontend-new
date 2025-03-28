import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Edit, Eye, Trash, Filter } from "lucide-react";
import { Badge } from '../ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

const ContestsList = () => {
    const [contests, setContests] = useState([]);
    const [filteredContests, setFilteredContests] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCity, setSelectedCity] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('all');
    const navigate = useNavigate();


    const getContestStatus = (contest) => {
        const now = new Date();
        const startDate = new Date(contest.startDate);
        const endDate = new Date(contest.endDate);


        endDate.setHours(23, 59, 59, 999);

        if (startDate > now) {
            return 'upcoming';
        } else if (endDate >= now) {
            return 'active';
        } else {
            return 'inactive';
        }
    };

    useEffect(() => {
        fetchContests();
        fetchCities();
    }, []);

    useEffect(() => {
        if (contests.length > 0 && cities.length > 0) {
            const updatedContests = contests.map(contest => {
                const city = cities.find(city => city._id === contest.city);
                const status = getContestStatus(contest);
                return {
                    ...contest,
                    cityName: city?.name || "Unknown",
                    status
                };
            });


            if (JSON.stringify(updatedContests) !== JSON.stringify(contests)) {
                setContests(updatedContests);
                setFilteredContests(updatedContests);
            }
        }
    }, [contests, cities]);


    useEffect(() => {
        let filtered = contests;

        if (selectedCity) {
            filtered = filtered.filter(contest =>
                Array.isArray(contest.city) && contest.city.includes(selectedCity)
            );
        }

        if (selectedStatus !== 'all') {
            filtered = filtered.filter(contest => contest.status === selectedStatus);
        }

        setFilteredContests(filtered);
    }, [selectedCity, selectedStatus, contests]);

    const fetchContests = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://3n8qx2vb-8055.inc1.devtunnels.ms/api/contest');
            console.log(response.data, "contests coming")
            setContests(response.data.data);
            setFilteredContests(response.data.data);
        } catch (error) {
            console.error('Error fetching contests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCities = async () => {
        try {
            const response = await axios.get('https://3n8qx2vb-8055.inc1.devtunnels.ms/admin/city');
            setCities(response.data);
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this contest?')) {
            try {
                await axios.delete(`https://3n8qx2vb-8055.inc1.devtunnels.ms/api/contest/${id}`);

                fetchContests();
            } catch (error) {
                console.error('Error deleting contest:', error);
            }
        }
    };

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), 'MMM dd, yyyy');
        } catch (e) {
            return dateString;
        }
    };

    // Get city name from ID
    const getCityName = (cityId) => {
        const city = cities.find(city => city._id === cityId);
        return city?.name || "Unknown";
    };

    const statusVariants = {
        'active': 'success',
        'inactive': 'destructive',
        'upcoming': 'secondary'
    };

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Driver Contests</CardTitle>
                    <div className="flex items-center gap-4">
                        {/* City filter dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Filter size={18} />
                                    {selectedCity
                                        ? `City: ${getCityName(selectedCity)}`
                                        : 'Filter by City'}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setSelectedCity(null)}>
                                    All Cities
                                </DropdownMenuItem>
                                {cities.map(city => (
                                    <DropdownMenuItem
                                        key={city._id}
                                        onClick={() => setSelectedCity(city._id)}
                                    >
                                        {city.name}
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Status filter dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="flex items-center gap-2">
                                    <Filter size={18} />
                                    {selectedStatus === 'all'
                                        ? 'All Statuses'
                                        : `Status: ${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)}`}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => setSelectedStatus('all')}>
                                    All Statuses
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedStatus('active')}>
                                    Active
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedStatus('inactive')}>
                                    Inactive
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setSelectedStatus('upcoming')}>
                                    Upcoming
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button onClick={() => navigate('/contests/new')} size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Contest
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="flex justify-center items-center h-40">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>City</TableHead>
                                    <TableHead>Vehicle Types</TableHead>
                                    <TableHead>Start Date</TableHead>
                                    <TableHead>End Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Rewards</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredContests?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                            {selectedCity && selectedStatus === 'all'
                                                ? `No contests found for ${getCityName(selectedCity)}`
                                                : selectedStatus !== 'all'
                                                    ? `No ${selectedStatus} contests found`
                                                    : 'No contests found.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredContests && filteredContests.map((contest) => (
                                        <TableRow key={contest._id}>
                                            <TableCell className="font-medium">{contest.title}</TableCell>
                                            <TableCell>
                                                {contest.city && Array.isArray(contest.city) ? (
                                                    contest.city.map(cityId => {
                                                        const cityObj = cities.find(c => c._id === cityId);
                                                        return cityObj ? (
                                                            <Badge key={cityId} variant="outline" className="mr-1">
                                                                {cityObj.name}
                                                            </Badge>
                                                        ) : null;
                                                    })
                                                ) : (
                                                    "No cities assigned"
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {contest?.vehicleType && Array.isArray(contest.vehicleType) ? (
                                                    contest.vehicleType.map(v => (
                                                        <Badge key={v} variant="outline" className="mr-1">
                                                            {v}
                                                        </Badge>
                                                    ))
                                                ) : (
                                                    "No vehicle type assigned"
                                                )}
                                            </TableCell>
                                            <TableCell>{formatDate(contest.startDate)}</TableCell>
                                            <TableCell>{formatDate(contest.endDate)}</TableCell>
                                            <TableCell>
                                                <Badge variant={statusVariants[contest.status]}>
                                                    {contest.status || "na"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {Object.keys(contest.rewardList || {}).length} rewards
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="ghost" size="icon" onClick={() => navigate(`/contests/view/${contest._id}`)}>
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => navigate(`/contests/edit/${contest._id}`)}>
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(contest._id)}>
                                                        <Trash className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default ContestsList;