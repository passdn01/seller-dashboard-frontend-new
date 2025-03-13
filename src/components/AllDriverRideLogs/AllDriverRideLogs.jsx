import React, { useState, useEffect } from 'react';
import axios from 'axios';
import moment from 'moment';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Oval } from 'react-loader-spinner';
import { Calendar, Search, Clock, Timer, Car, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AllDriverRideLogs = () => {
    const [rideLogsData, setRideLogsData] = useState(null);
    const [sessionData, setSessionData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dateRange, setDateRange] = useState('today');
    const [startDate, setStartDate] = useState(moment().format('YYYY-MM-DD'));
    const [endDate, setEndDate] = useState(moment().format('YYYY-MM-DD'));

    // Date formatter utility (format for backend)
    const formatDateForAPI = (date) => {
        return moment(date).format('DD-MM-YYYY'); // Expected format for the backend
    };

    // Fetch data based on current date range
    const fetchData = async () => {
        setLoading(true);
        setError(null);

        let formattedStartDate, formattedEndDate;

        // Set date range based on selection
        switch (dateRange) {
            case 'today':
                formattedStartDate = formatDateForAPI(new Date());
                formattedEndDate = formatDateForAPI(new Date());
                break;
            case 'last30':
                formattedStartDate = formatDateForAPI(moment().subtract(30, 'days').toDate());
                formattedEndDate = formatDateForAPI(new Date());
                break;
            case 'allTime':
                formattedStartDate = formatDateForAPI(moment().subtract(1, 'years').toDate());
                formattedEndDate = formatDateForAPI(new Date());
                break;
            case 'custom':
                formattedStartDate = formatDateForAPI(startDate);
                formattedEndDate = formatDateForAPI(endDate);
                break;
            default:
                formattedStartDate = formatDateForAPI(new Date());
                formattedEndDate = formatDateForAPI(new Date());
        }

        try {
            // Fetch ride logs
            const rideResponse = await axios.post(
                `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/allDriverRideLogs`,
                {
                    startDate: formattedStartDate,
                    endDate: formattedEndDate
                }
            );

            // Fetch session data
            const sessionResponse = await axios.post(
                `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/allDriverSession`,
                {
                    startDate: formattedStartDate,
                    endDate: formattedEndDate
                }
            );

            setRideLogsData(rideResponse.data);
            setSessionData(sessionResponse.data);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError(err.response?.data?.message || 'Failed to fetch data');
        } finally {
            setLoading(false);
        }
    };

    // Handle date range selection
    const handleDateRangeChange = (range) => {
        setDateRange(range);
        // Don't call fetchData() here to avoid using stale state
    };

    // Trigger search with current dates
    const handleSearch = () => {
        fetchData();
    };

    // Calculate acceptance rate
    const calculateAcceptanceRate = () => {
        const totalOffered = rideLogsData?.totalRideAccepted + rideLogsData?.totalRideRejected;
        if (!totalOffered) return 0;
        return ((rideLogsData.totalRideAccepted / totalOffered) * 100).toFixed(1);
    };

    // Calculate cancellation rate
    const calculateCancellationRate = () => {
        const totalAccepted = rideLogsData?.totalRideAccepted;
        if (!totalAccepted) return 0;
        return ((rideLogsData.totalRideCancelled / totalAccepted) * 100).toFixed(1);
    };

    useEffect(() => {
        fetchData(); // Fetch data when dateRange changes
    }, [dateRange]);

    return (
        <Card className="w-full border-none">
            <CardHeader className="pb-2">
                <div className='flex justify-between items-center'>
                    <CardTitle className="text-xl mb-4">All Drivers Ride Logs</CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button
                            size="sm"
                            variant={dateRange === 'today' ? 'default' : 'outline'}
                            onClick={() => handleDateRangeChange('today')}
                        >
                            Today
                        </Button>
                        <Button
                            size="sm"
                            variant={dateRange === 'last30' ? 'default' : 'outline'}
                            onClick={() => handleDateRangeChange('last30')}
                        >
                            Last 30 Days
                        </Button>
                        <Button
                            size="sm"
                            variant={dateRange === 'allTime' ? 'default' : 'outline'}
                            onClick={() => handleDateRangeChange('allTime')}
                        >
                            All Time
                        </Button>
                        <Button
                            size="sm"
                            variant={dateRange === 'custom' ? 'default' : 'outline'}
                            onClick={() => handleDateRangeChange('custom')}
                        >
                            Custom
                        </Button>
                        {dateRange === 'custom' && (
                            <div className="flex items-center gap-2">
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="border rounded px-2 py-1 pl-8 text-sm"
                                    />
                                    <Calendar className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
                                </div>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="border rounded px-2 py-1 pl-8 text-sm"
                                    />
                                    <Calendar className="absolute left-2 top-2 h-4 w-4 text-gray-500" />
                                </div>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={handleSearch}
                                    className="flex items-center gap-2"
                                >
                                    <Search className="h-4 w-4" />
                                    Search
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="flex justify-center p-8">
                        <Oval
                            height={40}
                            width={40}
                            color="#4fa94d"
                            visible={true}
                            ariaLabel='oval-loading'
                            secondaryColor="#4fa94d"
                            strokeWidth={2}
                            strokeWidthSecondary={2}
                        />
                    </div>
                ) : error ? (
                    <div className="text-center p-4 text-red-500">{error}</div>
                ) : !rideLogsData ? (
                    <div className="text-center p-4">No data available</div>
                ) : (
                    <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Car className="h-5 w-5 text-blue-700" />
                                    <h3 className="text-sm font-medium text-blue-700">Rides Arrived</h3>
                                </div>
                                <p className="text-2xl font-bold text-blue-900">{rideLogsData.totalRideArrived}</p>
                            </div>
                            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <CheckCircle className="h-5 w-5 text-green-700" />
                                    <h3 className="text-sm font-medium text-green-700">Rides Accepted</h3>
                                </div>
                                <p className="text-2xl font-bold text-green-900">{rideLogsData.totalRideAccepted}</p>
                            </div>
                            <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <XCircle className="h-5 w-5 text-red-700" />
                                    <h3 className="text-sm font-medium text-red-700">Rides Rejected</h3>
                                </div>
                                <p className="text-2xl font-bold text-red-900">{rideLogsData.totalRideRejected}</p>
                            </div>
                            <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <AlertTriangle className="h-5 w-5 text-orange-700" />
                                    <h3 className="text-sm font-medium text-orange-700">Rides Cancelled</h3>
                                </div>
                                <p className="text-2xl font-bold text-orange-900">{rideLogsData.totalRideCancelled}</p>
                            </div>
                            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="h-5 w-5 text-purple-700" />
                                    <h3 className="text-sm font-medium text-purple-700">Total Sessions</h3>
                                </div>
                                <p className="text-2xl font-bold text-purple-900">
                                    {sessionData?.sessionCount || 0}
                                </p>
                            </div>
                            <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-100">
                                <div className="flex items-center gap-2 mb-2">
                                    <Timer className="h-5 w-5 text-indigo-700" />
                                    <h3 className="text-sm font-medium text-indigo-700">Total Duration</h3>
                                </div>
                                <p className="text-2xl font-bold text-indigo-900">
                                    {sessionData?.totalDuration?.days > 0 && `${sessionData?.totalDuration?.days}d `}
                                    {sessionData?.totalDuration?.hours || 0}h {sessionData?.totalDuration?.minutes || 0}m
                                </p>
                                <p className="text-xs text-indigo-500">
                                    Avg:
                                    {sessionData?.averageDuration?.days > 0 && `${sessionData?.averageDuration?.days}d `}
                                    {sessionData?.averageDuration?.hours || 0}h {sessionData?.averageDuration?.minutes || 0}m
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg border">
                                <h3 className="text-md font-medium text-gray-700 mb-2">Acceptance Rate</h3>
                                <p className="text-2xl font-bold text-gray-900">{calculateAcceptanceRate()}%</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {rideLogsData.totalRideAccepted} accepted out of {rideLogsData.totalRideAccepted + rideLogsData.totalRideRejected} offered
                                </p>
                            </div>
                            <div className="p-4 rounded-lg border">
                                <h3 className="text-md font-medium text-gray-700 mb-2">Cancellation Rate</h3>
                                <p className="text-2xl font-bold text-gray-900">{calculateCancellationRate()}%</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {rideLogsData.totalRideCancelled} cancelled out of {rideLogsData.totalRideAccepted} accepted
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default AllDriverRideLogs;