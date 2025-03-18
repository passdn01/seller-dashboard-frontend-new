import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Edit, Eye, Trash } from "lucide-react";
import { Badge } from '../ui/badge';

const ContestsList = () => {
    const [contests, setContests] = useState([]);
    const [cities, setCities] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchContests();
        fetchCities();
    }, []);
    useEffect(() => {
        if (contests.length > 0 && cities.length > 0) {
            const updatedContests = contests.map(contest => {
                const city = cities.find(city => city._id === contest.city);
                const isActive = new Date(contest.endDate) >= new Date();
                return {
                    ...contest,
                    cityName: city?.name || "Unkown",
                    isActive
                };
            });
            setContests(updatedContests);
        }
    }, [cities]);

    const fetchContests = async () => {
        try {
            setLoading(true);
            const response = await axios.get('https://3n8qx2vb-8055.inc1.devtunnels.ms/api/contest');
            setContests(response.data.data);
            console.log(response.data, "get contests");
        } catch (error) {
            console.error('Error fetching contests:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchCities = async () => {
        try {
            const response = await axios.get('https://3n8qx2vb-8055.inc1.devtunnels.ms/admin/city'); //api
            setCities(response.data);
            console.log(response.data, "get cities");
        } catch (error) {
            console.error('Error fetching cities:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this contest?')) {
            try {
                await axios.delete(`https://3n8qx2vb-8055.inc1.devtunnels.ms/api/contest/${id}`); //api
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

    return (
        <div className="container mx-auto py-6">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Driver Contests</CardTitle>
                    <Button onClick={() => navigate('/contests/new')} size="sm">
                        <Plus className="mr-2 h-4 w-4" />
                        Add New Contest
                    </Button>
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
                                {contests?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                            No contests found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    contests.map((contest) => (
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