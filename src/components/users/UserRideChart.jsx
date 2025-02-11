import React, { useEffect, useState } from 'react';
import '@carbon/charts-react/styles.css';
import { SimpleBarChart } from '@carbon/charts-react';
import { BUYER_URL_LOCAL } from '@/lib/utils';

function UserRideChart({ userId }) {
    const [chartData, setChartData] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (userId) {
            fetchRides();
        }
    }, [userId]);

    const options = {
        title: 'Rides',
        axes: {
            left: {
                mapsTo: 'value',
                ticks: {
                    formatter: (value) => typeof value === "number"
                        ? value.toLocaleString("en-US")
                        : String(value)
                }
            },
            bottom: {
                mapsTo: 'date',
                scaleType: 'time',
                ticks: {
                    formatter: (date) => date instanceof Date
                        ? date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                        : String(date)
                }
            }
        },
        tooltip: {
            valueFormatter: (value, type) => {
                if (type === "x-value" && value instanceof Date) {
                    return value.toLocaleDateString("en-US", { month: "long", day: "numeric" });
                }
                if (type === "y-value" && typeof value === "number") {
                    return value.toLocaleString("en-US");
                }
                return String(value);
            }
        },
        bars: {
            maxWidth: 200
        },
        height: '400px'
    };

    const fetchRides = async () => {
        try {
            const response = await fetch(`${BUYER_URL_LOCAL}/dashboard/api/getUserRideChart`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: userId }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Fetched ride chart data:", data);

            const processedData = data.map(d => ({
                ...d,
                date: new Date(d.date)
            }));

            setChartData(processedData);
            setError(null);

        } catch (error) {
            console.error("Error fetching ride chart data:", error);
            setError(error.message);
        }
    };

    if (error) {
        return <div>Error loading chart: {error}</div>;
    }

    return (
        <div>
            <SimpleBarChart
                data={chartData}
                options={options}
            />
        </div>
    );
}

export default UserRideChart;