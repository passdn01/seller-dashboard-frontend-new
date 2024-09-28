import { useEffect, useState } from 'react';
import axios from 'axios';
import { Chart } from 'react-google-charts';

const DriverChart = () => {
    const [ridesData, setRidesData] = useState([]);  // Holds rides data for the week
    const [earningsData, setEarningsData] = useState([]); // Holds earnings data for the week
    const [weeks, setWeeks] = useState([]);  // Holds all weeks data
    const [selectedWeek, setSelectedWeek] = useState('');  // Current selected week
    const [loading, setLoading] = useState(true);  // Loader flag

    const driverId = "66c62b55d9b28e8cd5939253";

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const response = await axios.post('https://f6vfh6rc-2003.inc1.devtunnels.ms/dashboard/api/rides-by-driver', { driverId });
                const { data } = response.data;

                setWeeks(data);

                if (data.length === 0) {
                    setLoading(false);
                    return;
                }

                setSelectedWeek(data[0].week);
                updateRideData(data[0]);

            } catch (error) {
                console.error("Error fetching rides:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRides();
    }, [driverId]);

    const updateRideData = (weekData) => {
        const weeklyRides = Array(7).fill(0); // For Mon-Sun
        const weeklyEarnings = Array(7).fill(0); // For Mon-Sun

        weekData.rides.forEach((ride, index) => {
            if (ride && Object.keys(ride).length !== 0) {
                weeklyRides[index] += 1;
                if (ride.status === 'COMPLETED') {
                    weeklyEarnings[index] += ride.fare;
                }
            }
        });

        setRidesData(weeklyRides);
        setEarningsData(weeklyEarnings);
    };

    const handleWeekChange = (event) => {
        const selected = event.target.value;
        setSelectedWeek(selected);
        const weekData = weeks.find(week => week.week === selected);
        updateRideData(weekData);
    };

    const createChartData = (label, data) => {
        const chartData = [['Day', label]];
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        days.forEach((day, index) => {
            chartData.push([day, data[index]]);
        });

        return chartData;
    };

    return (
        <div className="flex flex-col items-center">
            {loading ? (
                <p className="text-gray-500 text-lg">Loading...</p>
            ) : (
                <div className="w-full">
                    <div className="mb-4">
                        <label htmlFor="weekSelect" className="mr-2 font-medium">Select Week:</label>
                        <select
                            id="weekSelect"
                            value={selectedWeek}
                            onChange={handleWeekChange}
                            className="border rounded-md p-2"
                        >
                            {weeks.map(week => (
                                <option key={week.week} value={week.week}>
                                    Week of {week.week}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex flex-wrap justify-between gap-8">
                        <div className="flex-1">
                            <h2 className="text-xl font-semibold mb-4">Driver Total Rides for the Week</h2>
                            <Chart
                                chartType="ColumnChart"
                                width="100%"
                                height="400px"
                                data={createChartData('Total Rides', ridesData)}
                                options={{
                                    legend: { position: 'none' },
                                    hAxis: {
                                        title: 'Days',
                                        ticks: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                                    },
                                    vAxis: { title: 'Number of Rides' },
                                    colors: ['#4CAF50']
                                }}
                            />
                        </div>

                        <div className="flex-1">
                            <h2 className="text-xl font-semibold mb-4">Driver Total Earnings for the Week</h2>
                            <Chart
                                chartType="ColumnChart"
                                width="100%"
                                height="400px"
                                data={createChartData('Total Earnings', earningsData)}
                                options={{
                                    legend: { position: 'none' },
                                    hAxis: {
                                        title: 'Days',
                                        ticks: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
                                    },
                                    vAxis: { title: 'Earnings ($)' },
                                    colors: ['#2196F3']
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DriverChart;
