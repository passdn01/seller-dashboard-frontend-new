import React, { useState, useEffect } from 'react';
import { AreaChart } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const HomeCharts = () => {
    const [type, setType] = useState('day');
    const [data, setData] = useState([]);
    const [buyerData, setBuyerData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const [rideResponse, buyerResponse] = await Promise.all([
                    fetch(`https://55kqzrxn-5000.inc1.devtunnels.ms/dashboard/api/homeCharts?type=${type}`),
                    fetch(`https://55kqzrxn-6000.inc1.devtunnels.ms/dashboard/api/homeCharts?type=${type}`)
                ]);

                if (!rideResponse.ok || !buyerResponse.ok) {
                    throw new Error('Failed to fetch data');
                }

                const [rideData, buyerDataResponse] = await Promise.all([
                    rideResponse.json(),
                    buyerResponse.json()
                ]);

                setData(formatData(rideData));
                setBuyerData(formatData(buyerDataResponse));
            } catch (err) {
                setError('Failed to load dashboard data. Please try again later.');
                console.error('Error fetching data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [type]);


    const formatData = (data) => {
        return data.map(item => ({
            ...item,
            date: new Date(item.date)
        }));
    };

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

    const chartOptions = (title, group) => ({
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} ${title}`,
        axes: {
            bottom: {
                title: type === 'day' ? 'Time (Hours)' : 'Date',
                mapsTo: 'date',
                scaleType: 'time',
                ticks: {
                    format: getTimeFormat()
                }
            },
            left: {
                mapsTo: 'value',
                title: group,
                scaleType: 'linear',
            },
        },
        curve: 'curveNatural',
        height: '400px',
        grid: {
            x: {
                enabled: true
            },
            y: {
                enabled: true
            }
        },
    });

    const ChartCard = ({ title, chartData, group }) => (

        <Card className="p-4 mb-6">
            <AreaChart
                data={chartData.filter(d => d.group === group)}
                options={chartOptions(title, group)}
            />
        </Card>


    );

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

    if (error) {
        return (
            <div className="flex items-center justify-center h-96 text-red-600">
                <p>{error}</p>
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

            {isLoading ? (
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="">
                    <ChartCard title="Completed Rides" chartData={data} group="Completed Rides" />
                    <ChartCard title="Drivers Registered" chartData={data} group="Drivers Registered" />
                    <ChartCard title="Total Searches" chartData={buyerData} group="Total Searches" />
                    <ChartCard title="Users Registered" chartData={buyerData} group="Users Registered" />
                </div>
            )}
        </div>
    );
};

export default HomeCharts;