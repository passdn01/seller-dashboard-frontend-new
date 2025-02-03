import React, { useState, useEffect } from 'react';
import { SimpleBarChart } from '@carbon/charts-react'
import '@carbon/charts/styles.css';
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const DriverInfoCharts = ({ data }) => {
    const { driverInfo } = data;

    const [type, setType] = useState('day');
    const [infoData, setInfoData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const driverId = driverInfo?._id;

    useEffect(() => {
        const fetchDriverData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await fetch(`https://adminsellerbackend.onrender.com/dashboard/api/driverInfoCharts`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        driverId,
                        type,
                    }),
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch data');
                }

                const responseData = await response.json();
                console.log("response data", responseData)
                setInfoData(responseData.data);
            } catch (err) {
                setError('Failed to load driver stats. Please try again later.');
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDriverData();
    }, [driverId, type]);



    const getTimeFormat = () => {
        switch (type) {
            case 'day':
                return '%H:00';
            case 'month':
                return '%Y-%m-%d';
            case 'year':
                return '%Y-%m';
            default:
                return '%Y-%m-%d';
        }
    };

    const chartOptions = {
        axes: {
            bottom: {
                title: type === 'day' ? 'Time (Hours)' : 'Date',
                mapsTo: 'date',
                scaleType: 'time',
                ticks: {
                    format: getTimeFormat(),
                },
            },
            left: {
                mapsTo: 'value',
                title: 'Metrics',
                scaleType: 'linear',
            },
        },
        height: '400px',
        grid: {
            x: {
                enabled: true,
            },
            y: {
                enabled: true,
            },
        },
        color: {
            scale: {
                rides: '#5356FF',
                earning: '#5356FF',
            },
        },
    };


    const TimeframeButton = ({ value, label }) => (
        <button
            className={`px-6 py-2 rounded-lg transition-colors ${type === value
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-gray-100'
                }`}
            onClick={() => setType(value)}
        >
            {label}
        </button>
    );

    const filterDataByGroup = (group) => {
        return infoData.filter(item => item.group === group) || []
    };

    if (error) {
        return (
            <div className="flex items-center justify-center h-96 text-red-600">
                <p>{error}</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }


    return (
        <div className="p-6">
            <div className="flex gap-2 mb-6 border rounded-lg p-1 w-fit">
                <TimeframeButton value="day" label="Today" />
                <TimeframeButton value="month" label="Month" />
                <TimeframeButton value="year" label="Year" />
            </div>

            {/* Bar Chart for Rides */}
            <div className='flex gap-x-4'>
                <Card className="p-4 mb-6 w-full">
                    <h3 className="text-xl font-semibold mb-4">Rides</h3>
                    {filterDataByGroup('rides').length > 0 ? (
                        <SimpleBarChart
                            data={filterDataByGroup('rides')}
                            options={{
                                ...chartOptions,
                                title: 'Driver Rides',
                            }}
                        />
                    ) : (
                        <p>No ride data available for this time frame.</p>
                    )}
                </Card>

                {/* Bar Chart for Total Fare */}
                <Card className="p-4 mb-6 w-full">
                    <h3 className="text-xl font-semibold mb-4">Total Fare</h3>
                    {filterDataByGroup('earning').length > 0 ? (
                        <SimpleBarChart
                            data={filterDataByGroup('earning')}
                            options={{
                                ...chartOptions,
                                title: 'Total Fare Stats',

                            }}
                        />
                    ) : (
                        <p>No earnings data available for this time frame.</p>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default DriverInfoCharts;
