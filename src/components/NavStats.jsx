import { useEffect, useState } from 'react';
import axios from 'axios';
import './NavStats.css';

const NavStats = () => {
    const [allCompletedRides, setAllCompletedRides] = useState(0);
    const [allNewDrivers, setAllNewDrivers] = useState(0);
    const [allDriversEarning, setAllDriversEarning] = useState(0);
    const [onlineDriversCount, setOnlineDriversCount] = useState(0);
    const [ongoingRidesCount, setOngoingRidesCount] = useState(0);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTotalCompletedRides = async () => {
        try {
            const response = await axios.post('https://55kqzrxn-2011.inc1.devtunnels.ms/dashboard/api/total-completed-rides', { period: 'all time' });
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

    const fetchOnlineDrivers = async () => {
        try {
            const response = await axios.get('https://55kqzrxn-2011.inc1.devtunnels.ms/online-drivers');
            const totalOnlineDrivers = response.data.drivers.length;
            setOnlineDriversCount(totalOnlineDrivers);
        } catch (err) {
            console.error(err);
            setError('Failed to fetch online drivers');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOnlineDrivers();
    }, []);

    const fetchOngoingRides = async () => {
        try {
            const response = await axios.get('https://55kqzrxn-2011.inc1.devtunnels.ms/total-ongoing-rides');
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

    // const fetchOngoingRides = async () => {
    //     try {
    //         const response = await axios.get('https://55kqzrxn-2011.inc1.devtunnels.ms/online-drivers');
    //         if (response.data.success) {
    //             // Assuming the response contains a count or an array of online drivers
    //             // Adjust this according to your actual response structure
    //             const totalOnlineDrivers = response.data.data.length; // If data is an array
    //             setOngoingRidesCount(totalOnlineDrivers);
    //         } else {
    //             setError(response.data.msg);
    //         }
    //     } catch (err) {
    //         setError('Error fetching online drivers');
    //         console.error(err);
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchOngoingRides();
    // }, []);

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
                <div className='live-container-info'>Total Ongoing Rides: {ongoingRidesCount}</div>
            </div>
            <div className='all-ride-container'>   
                <div className="ride-total-container">
                    <h1 className="ride-total-title">Completed Rides</h1>
                    <h3>{allCompletedRides}</h3>
                </div>

                <div className="ride-total-container">
                    <h1 className="ride-total-title">New Drivers</h1>
                    <h3>{allNewDrivers}</h3>
                </div>

                <div className="ride-total-container">
                    <h1 className="ride-total-title">Drivers Earnings</h1>
                    <h3>{allDriversEarning}</h3>
                </div>
            </div>
        </div>
    );
};

export default NavStats;
