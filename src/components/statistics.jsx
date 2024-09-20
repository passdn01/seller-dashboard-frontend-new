import { useState, useEffect } from 'react';
import { Chart } from 'react-google-charts';
import axios from 'axios';
import moment from 'moment';
import './statistics.css';

const RideStatistics = () => {
    const [period, setPeriod] = useState('monthly'); // Default period
    const [rideData, setRideData] = useState([]);
    const [driverData, setDriverData] = useState([]);
    const [cancelledRidesData, setCancelledRidesData] = useState([]);
    const [earningsData, setEarningsData] = useState([]);
    const [riderFareAcceptanceData, setRiderFareAcceptanceData] = useState([]);
    const [driverQuoteAcceptanceData, setDriverQuoteAcceptanceData] = useState([]);
    const [bookingCancellationRateData, setBookingCancellationRateData] = useState([]);
    const [conversionRateData, setConversionRateData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Function to reduce x-axis labels based on selected period
    const filterXAxisLabels = (data) => {
        const filteredData = [data[0]]; // Start with the header

        const intervals = {
            'yesterday': 1,
            'weekly': 1, // Weekly interval
            'monthly': 1, // Monthly
            'yearly': 1, // Quarterly
            'all time': 1, // All time
        };

        const interval = intervals[period] || 1;

        for (let i = 1; i < data.length; i += interval) {
            filteredData.push(data[i]);
        }

        return filteredData;
    };

    // Fetch data for both total rides, drivers, cancelled rides, and earnings
    const fetchData = async () => {
        try {
            const response = await axios.post('https://55kqzrxn-2011.inc1.devtunnels.ms/dashboard/api/total-completed-rides', { period });
            const result = response.data;

            const formattedRideData = [
                ['Date', 'Total Completed Rides'],
                ...result.map(item => [
                    moment(item.date).format('YYYY-MM-DD'),
                    item.totalCompletedRides
                ])
            ];

            const formattedDriverData = [
                ['Date', 'Total New Drivers'],
                ...result.map(item => [
                    moment(item.date).format('YYYY-MM-DD'),
                    item.totalNewDrivers
                ])
            ];

            const formattedCancelledRidesData = [
                ['Date', 'Total Cancelled Rides'],
                ...result.map(item => [
                    moment(item.date).format('YYYY-MM-DD'),
                    item.totalCancelledRides
                ])
            ];

            const formattedEarningsData = [
                ['Date', 'Total Drivers Earnings'],
                ...result.map(item => [
                    moment(item.date).format('YYYY-MM-DD'),
                    item.totalDriversEarnings
                ])
            ];

            // Add new metric mappings here
            const formattedRiderFareAcceptanceData = [
                ['Date', 'Rider Fare Acceptance Rate'],
                ...result.map(item => [
                    moment(item.date).format('YYYY-MM-DD'),
                    item.riderFareAcceptanceRate
                ])
            ];

            const formattedDriverQuoteAcceptanceData = [
                ['Date', 'Driver Quote Acceptance Rate'],
                ...result.map(item => [
                    moment(item.date).format('YYYY-MM-DD'),
                    item.driverQuoteAcceptanceRate
                ])
            ];

            const formattedBookingCancellationRateData = [
                ['Date', 'Booking Cancellation Rate'],
                ...result.map(item => [
                    moment(item.date).format('YYYY-MM-DD'),
                    item.bookingCancellationRate
                ])
            ];

            const formattedConversionRateData = [
                ['Date', 'Conversion Rate'],
                ...result.map(item => [
                    moment(item.date).format('YYYY-MM-DD'),
                    item.conversionRate
                ])
            ];

            // Filter data to reduce x-axis labels
            const filteredRideData = filterXAxisLabels(formattedRideData);
            const filteredDriverData = filterXAxisLabels(formattedDriverData);
            const filteredCancelledRidesData = filterXAxisLabels(formattedCancelledRidesData);
            const filteredEarningsData = filterXAxisLabels(formattedEarningsData);
            const filteredRiderFareAcceptanceData = filterXAxisLabels(formattedRiderFareAcceptanceData);
            const filteredDriverQuoteAcceptanceData = filterXAxisLabels(formattedDriverQuoteAcceptanceData);
            const filteredBookingCancellationRateData = filterXAxisLabels(formattedBookingCancellationRateData);
            const filteredConversionRateData = filterXAxisLabels(formattedConversionRateData);

            setRideData(filteredRideData);
            setDriverData(filteredDriverData);
            setCancelledRidesData(filteredCancelledRidesData);
            setEarningsData(filteredEarningsData);
            setRiderFareAcceptanceData(filteredRiderFareAcceptanceData);
            setDriverQuoteAcceptanceData(filteredDriverQuoteAcceptanceData);
            setBookingCancellationRateData(filteredBookingCancellationRateData);
            setConversionRateData(filteredConversionRateData);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    useEffect(() => {
        fetchData();
    }, [period]);

    const handlePeriodChange = (e) => {
        setPeriod(e.target.value);
    };

    if (loading) {
        return <p>Loading charts...</p>;
    }

    const getXAxisOptions = (period) => {
        const minDate = new Date(Math.min(...rideData.slice(1).map(item => new Date(item[0]))));
        const maxDate = new Date(Math.max(...rideData.slice(1).map(item => new Date(item[0]))));

        let format;
        let ticks;

        switch (period) {
            case 'weekly':
            case 'monthly':
                format = 'd MMM'; // Day and abbreviated month
                ticks = [];
                for (let date = new Date(minDate); date <= maxDate; date.setDate(date.getDate() + 1)) {
                    ticks.push(new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
                }
                break;
            case 'yearly':
            case 'all time':
                format = 'MMM yyyy'; // Month and Year
                ticks = [];
                for (let date = new Date(minDate.getFullYear(), 0, 1); date <= maxDate; date.setMonth(date.getMonth() + 1)) {
                    ticks.push(new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }));
                }
                break;
            default:
                format = 'MMM dd, yyyy'; // Default format
                ticks = [];
                for (let date = new Date(minDate); date <= maxDate; date.setDate(date.getDate() + 1)) {
                    ticks.push(new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }));
                }
                break;
        }

        return {
            hAxis: {
                title: 'Date',
                format: format,
                ticks: ticks,
                slantedText: true, // Rotate labels if they overlap
                slantedTextAngle: 45, // Adjust angle if necessary
            },
            vAxis: { title: 'Count' },
            curveType: 'function',
            legend: { position: 'bottom' }
        };
    };

    const calculateTotal = (data) => {
        return data.slice(1).reduce((total, item) => {
            const value = item[1];
            return total + (typeof value === 'number' && !isNaN(value) ? value : 0); // Ensure value is a number
        }, 0); // Skip the header row and sum up the second column
    };

    const calculateAveragePercentage = (data) => {
        const total = data.slice(1).reduce((sum, item) => {
            const value = item[1];
            return sum + (typeof value === 'number' && !isNaN(value) ? value : 0);
        }, 0);

        return data.length > 1 ? (total / (data.length - 1)) : 0; // Subtract 1 to account for the header row
    };


    // Get totals for each dataset (check if the dataset has more than just the header)
    const totalCompletedRides = rideData.length > 1 ? calculateTotal(rideData) : 0;
    const totalNewDrivers = driverData.length > 1 ? calculateTotal(driverData) : 0;
    const totalCancelledRides = cancelledRidesData.length > 1 ? calculateTotal(cancelledRidesData) : 0;
    const totalEarnings = earningsData.length > 1 ? calculateTotal(earningsData) : 0;
    const averageRiderFareAcceptanceRate = riderFareAcceptanceData.length > 1 ? calculateAveragePercentage(riderFareAcceptanceData).toFixed(2) : '0.00';
    const averageDriverQuoteAcceptanceRate = driverQuoteAcceptanceData.length > 1 ? calculateAveragePercentage(driverQuoteAcceptanceData).toFixed(2) : '0.00';
    const averageBookingCancellationRate = bookingCancellationRateData.length > 1 ? calculateAveragePercentage(bookingCancellationRateData).toFixed(2) : '0.00';
    const averageConversionRate = conversionRateData.length > 1 ? calculateAveragePercentage(conversionRateData).toFixed(2) : '0.00';



    // In your component
    const options = getXAxisOptions(period);

    return (
        <div className='statistics-container'>
            <div className="period-select">
                <label htmlFor="period">Select Period: </label>
                <select id="period" value={period} onChange={handlePeriodChange}>
                    <option value="yesterday">Yesterday</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="all time">All Time</option>
                </select>
            </div>
            <div className="graphs-wrapper">

                <div className="ride-statistics-container">
                    <h1 className="chart-title">Completed Rides</h1>
                    <h3>{totalCompletedRides}</h3> {/* Display total */}
                    <div className="chart-container">
                        <Chart
                            chartType="LineChart"
                            data={rideData}
                            options={{ ...options, title: `Completed Rides over ${period}` }}
                            width="100%"
                            height="100%"
                        />
                    </div>
                </div>

                <div className="ride-statistics-container">
                    <h1 className="chart-title">New Drivers</h1>
                    <h3>{totalNewDrivers}</h3> {/* Display total */}
                    <div className="chart-container">
                        <Chart
                            chartType="LineChart"
                            data={driverData}
                            options={{ ...options, title: `New Drivers over ${period}` }}
                            width="100%"
                            height="100%"
                        />
                    </div>
                </div>

                <div className="ride-statistics-container">
                    <h1 className="chart-title">Cancelled Rides</h1>
                    <h3>{totalCancelledRides}</h3> {/* Display total */}
                    <div className="chart-container">
                        <Chart
                            chartType="LineChart"
                            data={cancelledRidesData}
                            options={{ ...options, title: `Cancelled Rides over ${period}` }}
                            width="100%"
                            height="100%"
                        />
                    </div>
                </div>

                <div className="ride-statistics-container">
                    <h1 className="chart-title">Drivers Earnings</h1>
                    <h3>{totalEarnings}</h3> {/* Display total */}
                    <div className="chart-container">
                        <Chart
                            chartType="LineChart"
                            data={earningsData}
                            options={{ ...options, title: `Drivers Earnings over ${period}` }}
                            width="100%"
                            height="100%"
                        />
                    </div>
                </div>

                <div className="ride-statistics-container">
                    <h1 className="chart-title">Rider Fare Acceptance Rate</h1>
                    <h3>{averageRiderFareAcceptanceRate} %</h3>
                    <div className="chart-container">
                        <Chart
                            chartType="LineChart"
                            data={riderFareAcceptanceData}
                            options={{ ...options, title: `Rider Fare Acceptance Rate over ${period}` }}
                            width="100%"
                            height="100%"
                        />
                    </div>
                </div>

                <div className="ride-statistics-container">
                    <h1 className="chart-title">Driver Quote Acceptance Rate</h1>
                    <h3>{averageDriverQuoteAcceptanceRate} %</h3>
                    <div className="chart-container">
                        <Chart
                            chartType="LineChart"
                            data={driverQuoteAcceptanceData}
                            options={{ ...options, title: `Rider Fare Acceptance Rate over ${period}` }}
                            width="100%"
                            height="100%"
                        />
                    </div>
                </div>

                <div className="ride-statistics-container">
                    <h1 className="chart-title">Booking Cancellation Rate</h1>
                    <h3>{averageBookingCancellationRate} %</h3>
                    <div className="chart-container">
                        <Chart
                            chartType="LineChart"
                            data={bookingCancellationRateData}
                            options={{ ...options, title: `Rider Fare Acceptance Rate over ${period}` }}
                            width="100%"
                            height="100%"
                        />
                    </div>
                </div>

                <div className="ride-statistics-container">
                    <h1 className="chart-title">Conversion Rate</h1>
                    <h3>{averageConversionRate} %</h3>
                    <div className="chart-container">
                        <Chart
                            chartType="LineChart"
                            data={conversionRateData}
                            options={{ ...options, title: `Rider Fare Acceptance Rate over ${period}` }}
                            width="100%"
                            height="100%"
                        />
                    </div>
                </div>






            </div>
        </div>
    );
};

export default RideStatistics;
