import React, { useState, useEffect } from 'react';
import { AreaChart } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import MonthlyDataRenderer from './MonthChartComponent';
import YearlyDataRenderer from './YearChartComponent';
import { SELLER_URL_LOCAL } from '@/lib/utils';

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
                const token = localStorage.getItem('token')
                const [rideResponse, buyerResponse] = await Promise.all([
                    fetch(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/homeCharts?type=${type}`, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    }),
                    fetch(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/homeCharts?type=${type}`, {
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }
                    })
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

    console.log(buyerData, "buyerData")

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
        }, toolbar: {
            enabled: true,
            numberOfIcons: 3,
            controls: [
                { type: 'Reset zoom' },
                { type: 'Export as CSV' },
                { type: 'Show as data-table' }

            ]
        },
        zoomBar: {
            top: {
                enabled: true
            }
        }

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

    const totalSearchesData = buyerData.filter(d => d.group === "Total Searches")
    const completedRidesData = data.filter(d => d.group === "Completed Rides")
    const driversRegisteredData = data.filter(d => d.group === "Drivers Registered")
    const usersRegisteredData = buyerData.filter(d => d.group === "Users Registered")
    console.log(usersRegisteredData, "user regist")



    return (
        <div >
            <div className="flex gap-2 mb-6 border rounded-lg p-1 w-fit m-6">
                < TimeframeButton value="day" label="Today" />
                <TimeframeButton value="month" label="Month" />
                <TimeframeButton value="year" label="Year" />
            </div >

            {type === "month" && (isLoading ? <div className="flex items-center justify-center h-96">
                < Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div > :
                <div>
                    <MonthlyDataRenderer mdata={completedRidesData} chartTitle="Completed Rides" chartData={data} group="Completed Rides" />
                    <MonthlyDataRenderer mdata={driversRegisteredData} chartTitle="Drivers Registered" chartData={data} group="Drivers Registered" />
                    <MonthlyDataRenderer mdata={totalSearchesData} chartTitle="Total Searches" group="Total Searches" />

                    <MonthlyDataRenderer mdata={usersRegisteredData} chartTitle="Users Registered" chartData={buyerData} group="Users Registered" />
                </div>)}



            {type === "day" && (isLoading ? (
                <div className="flex items-center justify-center h-96">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : (
                <div className="p-8 flex flex-col gap-12">
                    <ChartCard title="Completed Rides" chartData={data} group="Completed Rides" />
                    <ChartCard title="Drivers Registered" chartData={data} group="Drivers Registered" />
                    <ChartCard title="Total Searches" chartData={buyerData} group="Total Searches" />
                    <ChartCard title="Users Registered" chartData={buyerData} group="Users Registered" />
                </div>)
            )}


            {type === "year" && (isLoading ? <div className="flex items-center justify-center h-96">
                < Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div > :
                <div>
                    <YearlyDataRenderer mdata={completedRidesData} chartTitle="Completed Rides" chartData={data} group="Completed Rides" />
                    <YearlyDataRenderer mdata={driversRegisteredData} chartTitle="Drivers Registered" chartData={data} group="Drivers Registered" />
                    <YearlyDataRenderer mdata={totalSearchesData} chartTitle="Total Searches" group="Total Searches" />

                    <YearlyDataRenderer mdata={usersRegisteredData} chartTitle="Users Registered" chartData={buyerData} group="Users Registered" />
                </div>)}
        </div >
    );
};

export default HomeCharts;