import { useEffect, useState } from 'react';
import axios from 'axios';
import './NavStats.css';
import { io } from 'socket.io-client';

const NavStats = () => {
    const [allCompletedRides, setAllCompletedRides] = useState(0);
    const [allNewDrivers, setAllNewDrivers] = useState(0);
    const [allDriversEarning, setAllDriversEarning] = useState(0);
    const [onlineDriversCount, setOnlineDriversCount] = useState(0);
    const [ongoingRidesCount, setOngoingRidesCount] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Simulate loading for the map
        const timer = setTimeout(() => {
            setLoading(false); // Set loading to false after 1 second (or adjust as needed)
        }, 1000);

        return () => clearTimeout(timer); // Clear timeout on unmount
    }, []);

    const fetchTotalCompletedRides = async () => {
        try {
            const response = await axios.post('https://55kqzrxn-2003.inc1.devtunnels.ms/dashboard/api/totalStatsData', { period: 'all time' });
            const result = response.data;

            console.log(result); // Log the response to inspect the structure

            const totalCompletedRidesAllTime = result.reduce((acc, item) => acc + (item.totalCompletedRides || 0), 0);
            const totalNewDriversAllTime = result.reduce((acc, item) => acc + (item.totalNewDrivers || 0), 0);
            const totalDriversEarningsAllTime = result.reduce((acc, item) => acc + (item.totalDriversEarnings || 0), 0);

            setAllCompletedRides(totalCompletedRidesAllTime);
            setAllNewDrivers(totalNewDriversAllTime);
            setAllDriversEarning(totalDriversEarningsAllTime);
        } catch (error) {
            console.error('Error fetching total completed rides:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTotalCompletedRides();
    }, []);


    useEffect(() => {
        const newSocket = io('http://localhost:2003');
        setSocket(newSocket);

        // Request online drivers once connected
        newSocket.on('connect', () => {
        console.log('Connected to WebSocket server');
        newSocket.emit('getOnlineDrivers');
        });

        newSocket.on('onlineDrivers', (response) => {
        if (response && response.drivers) {
            const totalOnlineDrivers = response.drivers.length;
            setOnlineDriversCount(totalOnlineDrivers);
        }
        });

        newSocket.on('error', (err) => {
        console.error(err);
        setError('Failed to fetch online drivers');
        });

        return () => {
        newSocket.close();
        };

    }, []);

    const fetchOngoingRides = async () => {
        try {
            const response = await axios.get('https://55kqzrxn-2003.inc1.devtunnels.ms/dashboard/api/total-ongoing-rides');
            const totalOngoingRides = response.data.ongoingRides;
            console.log(totalOngoingRides);
            setOngoingRidesCount(totalOngoingRides);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch online drivers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOngoingRides();
    }, []);


    const animateValue = (value, setter) => {
        let start = 0;
        const duration = 3000; // 1 second
        const incrementTime = 50; // Update every 50ms
        const totalSteps = duration / incrementTime;
        const increment = Math.ceil(value / totalSteps);

        const interval = setInterval(() => {
            start += increment;
            if (start >= value) {
                start = value;
                clearInterval(interval);
            }
            setter(start);
        }, incrementTime);
    };

    useEffect(() => {
        if (!loading) {
            animateValue(allCompletedRides, setAllCompletedRides);
            animateValue(allNewDrivers, setAllNewDrivers);
            animateValue(allDriversEarning, setAllDriversEarning);
            animateValue(onlineDriversCount, setOnlineDriversCount);
            animateValue(ongoingRidesCount, setOngoingRidesCount);
        }
    }, [loading]);


    if (loading) {
        return <p>Loading total completed rides...</p>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div>
            <div className="live-container">
                <div className='live-container-info'>
                    <h1>Total Online Drivers</h1>
                    <h3>{onlineDriversCount}</h3>
                </div>
                <div className='live-container-info'>
                    <h1>Total Ongoing Rides</h1>
                    <h3>{ongoingRidesCount}</h3>
                </div>
            </div>
            <div className='all-ride-container'>
                <div className="ride-total-container">
                    <h3>{allCompletedRides}</h3>
                    <h1 className="ride-total-title">Completed Rides</h1>
                </div>

                <div className="ride-total-container">
                    <h3>{allNewDrivers}</h3>
                    <h1 className="ride-total-title">New Drivers</h1>
                </div>

                <div className="ride-total-container">
                    <h3>{allDriversEarning}</h3>
                    <h1 className="ride-total-title">Drivers Earnings</h1>
                </div>
            </div>
        </div>
    );
};

export default NavStats;
