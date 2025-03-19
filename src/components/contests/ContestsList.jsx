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
    const navigate = useNavigate();

    useEffect(() => {
        fetchContests();
        fetchCities();
    }, []);

    useEffect(() => {
        if (contests.length > 0 && cities.length > 0) {
            const updatedContests = contests.map(contest => {
                const city = cities.find(city => city._id === contest.city);
                console.log(new Date(contest.endDate), "date in contest end")
                console.log(new Date(), "date now")
                const isActive = new Date(contest.endDate) >= new Date();
                return {
                    ...contest,
                    cityName: city?.name || "Unknown",
                    isActive
                };
            });
            setContests(updatedContests);
            setFilteredContests(updatedContests);
        }
    }, [cities]);

    // Filter contests by city
    useEffect(() => {
        if (selectedCity) {
            const filtered = contests.filter(contest => contest.city === selectedCity);
            setFilteredContests(filtered);
        } else {
            setFilteredContests(contests);
        }
    }, [selectedCity, contests]);

    const fetchContests = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://3n8qx2vb-8055.inc1.devtunnels.ms/api/contest');
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
                                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                            {selectedCity
                                                ? `No contests found for ${getCityName(selectedCity)}`
                                                : 'No contests found.'}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredContests.map((contest) => (
                                        <TableRow key={contest._id}>
                                            <TableCell className="font-medium">{contest.title}</TableCell>
                                            <TableCell>
                                                {contest.cityName}
                                            </TableCell>
                                            <TableCell>{formatDate(contest.startDate)}</TableCell>
                                            <TableCell>{formatDate(contest.endDate)}</TableCell>
                                            <TableCell>
                                                <Badge variant={contest.isActive ? "success" : "destructive"}>
                                                    {contest.isActive ? "Active" : "Inactive"}
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