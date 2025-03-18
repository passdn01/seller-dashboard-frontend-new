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

    // Separate useEffect for city that runs when contest changes
    useEffect(() => {
        if (contest?.city) {
            fetchCity(contest.city);
        }
    }, [contest]);

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

    const fetchCity = async (cityId) => {
        try {
            setCityLoading(true);
            const response = await axios.get(`https://3n8qx2vb-8055.inc1.devtunnels.ms/admin/city/${cityId}`);
            setCity(response.data.name);
            console.log(response.data, "city");
        } catch (error) {
            console.error('Error fetching city:', error);
            setCity(null); // Reset city on error
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
                                <p className="text-sm text-muted-foreground">City</p>
                                <p className="font-medium">
                                    {cityLoading ? (
                                        <Loader2 className="h-4 w-4 inline animate-spin mr-2" />
                                    ) : (
                                        city || 'N/A'
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Created</p>
                                <p className="font-medium">{formatDate(contest.createdAt)}</p>
                            </div>
                        </div>
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