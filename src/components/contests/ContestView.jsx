import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft, Edit } from "lucide-react";

const ContestView = () => {
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [cityLoading, setCityLoading] = useState(false);
    const [city, setCity] = useState(null);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        fetchContest();
    }, [id]);



    const fetchContest = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://3n8qx2vb-8055.inc1.devtunnels.ms/api/contest/${id}`);
            setContest(response.data.data);
            console.log(response.data.data);
        } catch (error) {
            console.error('Error fetching contest:', error);
        } finally {
            setLoading(false);
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
                                <p className="text-sm text-muted-foreground">Created</p>
                                <p className="font-medium">{formatDate(contest.createdAt)}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <p className="text-sm text-muted-foreground">Description</p>
                        <p className="font-medium">{contest.description || "No description available"}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground">Rules</p>
                        <p className="font-medium">{contest.rules || "No rules specified"}</p>
                    </div>
                    <div>
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