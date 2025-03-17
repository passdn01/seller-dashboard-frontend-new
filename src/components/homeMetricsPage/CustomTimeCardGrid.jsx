import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MetricCard from './MetricCardComponent';
import { MeterChart } from '@carbon/charts-react';
import auto from '../../assets/CardGridIcons/auto.png';
import bike from '../../assets/CardGridIcons/bike.png';
import cab from '../../assets/CardGridIcons/cab.png';
import cancel from '../../assets/CardGridIcons/cancel.png';
import coinsdistributed from '../../assets/CardGridIcons/coinsdistributed.png';
import completed from '../../assets/CardGridIcons/completed.png';
import driverearning from '../../assets/CardGridIcons/driverearning.png';
import drivers from '../../assets/CardGridIcons/drivers.png';
import driverwalletadd from '../../assets/CardGridIcons/driverwalletadd.png';
import fake from '../../assets/CardGridIcons/fake.png';
import kms from '../../assets/CardGridIcons/kms.png';
import savecommission from '../../assets/CardGridIcons/savecommission.png';
import search from '../../assets/CardGridIcons/search.png';
import subscriptiontrans from '../../assets/CardGridIcons/subscriptiontrans.png';
import totalsubscription from '../../assets/CardGridIcons/totalsubscription.png';
import user from '../../assets/CardGridIcons/user.png';
import userredeem from '../../assets/CardGridIcons/userredeem.png';

function CustomTimeCardGrid({ customButton }) {
    const [startDate, setStartDate] = useState('');
    const [startTime, setStartTime] = useState('00:00');
    const [endDate, setEndDate] = useState('');
    const [endTime, setEndTime] = useState('23:59');
    const [customMetrics, setCustomMetrics] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [showData, setShowData] = useState(false);
    const [error, setError] = useState('');

    const formatNumber = (num) => {
        if (num === undefined || num === null) return "0";
        if (num >= 10000000) return `${(num / 10000000).toFixed(2)}CR`;
        if (num >= 100000) return `${(num / 100000).toFixed(2)}L`;
        if (num >= 1000) return `${(num / 1000).toFixed(2)}k`;
        return num.toFixed(2);
    };

    const calculateCommission = (earnings) => {
        return typeof earnings === 'number' ? earnings * 0.25 : 0;
    };

    const fetchCustomMetrics = async () => {
        if (!startDate || !endDate) {
            setError('Please select both start and end dates');
            return;
        }

        setIsLoading(true);
        setError('');
        setShowData(false);

        try {
            // Format dates with time for API request
            const fullStartDate = `${startDate}T${startTime}:00`;
            const fullEndDate = `${endDate}T${endTime}:00`;

            // Make API call with the formatted dates
            const token = localStorage.getItem('token')
            const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/api/customMetricData`, {
                params: {
                    startDate: fullStartDate,
                    endDate: fullEndDate
                },
                headers: {
                    "Authorization": `Bearer ${token}`
                }

            });
            console.log(response.data)
            if (response.data && response.data.data) {
                setCustomMetrics(response.data.data);
                setShowData(true);
            } else {
                setError('Invalid data format received from server');
            }
        } catch (error) {
            console.error('Error fetching custom metrics:', error);
            setError(`Failed to fetch data: ${error.response?.data?.message || error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    // On initial mount, set default dates to last 7 days
    useEffect(() => {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);

        setEndDate(today.toISOString().split('T')[0]);
        setStartDate(sevenDaysAgo.toISOString().split('T')[0]);
    }, []);

    // Calculate conversion rate
    const conversionRate = customMetrics?.SearchRides && customMetrics.SearchRides > 0
        ? (customMetrics.completedRides * 100 / customMetrics.SearchRides).toFixed(2)
        : 0;

    const meterData = [{
        group: 'Search/Completed Ride Ratio',
        value: parseFloat(conversionRate)
    }];

    const meterOptions = {
        title: "Conversion Rate",
        meter: {
            peak: 100,
            status: {
                ranges: [
                    { range: [0, 30], status: 'danger' },
                    { range: [30, 60], status: 'warning' },
                    { range: [60, 100], status: 'success' }
                ]
            }
        },
        height: '100px'
    };

    const customTabData = [
        {
            icon: search,
            number: formatNumber(customMetrics?.SearchRides || 0),
            title: "Search Rides",
            hover: false,
        },
        {
            icon: completed,
            number: formatNumber(customMetrics?.completedRides || 0),
            title: "Complete Rides",
            hover: false,
        },
        {
            icon: driverearning,
            number: `₹${formatNumber(customMetrics?.driversEarnings || 0)}`,
            title: "Driver's Earnings",
            hover: false,
        },
        {
            icon: savecommission,
            number: `₹${formatNumber(calculateCommission(customMetrics?.driversEarnings) || 0)}`,
            title: "Save Commission",
            hover: false,
        },
        {
            icon: user,
            number: formatNumber(customMetrics?.Users || 0),
            title: "User Registered",
            hover: false,
        },
        {
            icon: drivers,
            number: formatNumber(customMetrics?.driversRegistered || 0),
            title: "Driver Registered",
            hover: false,
        },
        {
            icon: driverwalletadd,
            number: `₹${formatNumber(customMetrics?.walletCredits || 0)}`,
            title: "Driver Wallet Add",
            hover: false,
        },
        {
            icon: subscriptiontrans,
            number: formatNumber(customMetrics?.subscriptionTransactions || 0),
            title: "Subscription Transactions",
            hover: false,
        },
        {
            icon: totalsubscription,
            number: `₹${formatNumber(customMetrics?.subscriptionAmount || 0)}`,
            title: "Total Subscription Amount",
            hover: false,
        },
        {
            icon: coinsdistributed,
            number: formatNumber(customMetrics?.coinsDistributed || 0),
            title: "Coins Distributed",
            hover: false,
        },
        {
            icon: userredeem,
            number: `₹${formatNumber(customMetrics?.userRedeemMoney || 0)}`,
            title: "User Redeem Money",
            hover: false,
        },
        {
            icon: kms,
            number: formatNumber(customMetrics?.kmServed || 0),
            title: "KM We Serve",
            hover: false,
        },
        {
            icon: bike,
            number: formatNumber(customMetrics?.BikeRides || 0),
            title: "Bike Taxi",
            hover: false,
        },
        {
            icon: auto,
            number: formatNumber(customMetrics?.totalVerifiedAuto || 0),
            title: "Auto Rickshaw",
            hover: false,
        },
        {
            icon: cab,
            number: formatNumber(customMetrics?.totalVerifiedCab || 0),
            title: "Cab",
            hover: false,
        },
        {
            icon: fake,
            number: formatNumber(customMetrics?.FakeRides || 0),
            title: "Fake Rides",
            hover: false,
        },
        {
            icon: cancel,
            number: formatNumber(customMetrics?.cancelledRides || 0),
            title: "Cancel Rides",
            hover: false,
        },
        {
            icon: drivers,
            number: formatNumber(customMetrics?.verifiedDrivers || 0),
            title: "Verified Drivers",
            hover: false,
        },
    ];

    return (
        customButton && (
            <div className="mx-16 p-16 border-2 border-gray-200">
                <h2 className="text-xl font-semibold mb-4">Custom Date Range Metrics</h2>

                <div className="flex flex-wrap gap-4 mb-6 items-end">
                    <div>
                        <label className="block text-sm text-gray-500 mb-1">Start Date</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                className="px-4 py-2 border border-gray-300 rounded-md"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                max={endDate}
                            />
                            <input
                                type="time"
                                className="px-4 py-2 border border-gray-300 rounded-md"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-500 mb-1">End Date</label>
                        <div className="flex gap-2">
                            <input
                                type="date"
                                className="px-4 py-2 border border-gray-300 rounded-md"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                min={startDate}
                            />
                            <input
                                type="time"
                                className="px-4 py-2 border border-gray-300 rounded-md"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                        onClick={fetchCustomMetrics}
                        disabled={isLoading}
                    >
                        {isLoading ? 'Loading...' : 'Fetch Data'}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {isLoading && (
                    <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                    </div>
                )}

                {showData && !isLoading && (
                    <>
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded mb-4">
                            Showing data from {startDate} {startTime} to {endDate} {endTime}
                        </div>

                        {/* Metrics Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {customTabData.map((metric, index) => (
                                <MetricCard
                                    key={`${metric.title}-${index}`}
                                    icon={metric.icon}
                                    title={metric.title}
                                    number={metric.number}
                                    hover={metric.hover}
                                />
                            ))}
                        </div>

                        <div className='p-2 border-2 border-gray-100 m-6 rounded'>
                            <MeterChart data={meterData} options={meterOptions}></MeterChart>
                        </div>
                    </>
                )}
            </div>
        )
    );
}

export default CustomTimeCardGrid;