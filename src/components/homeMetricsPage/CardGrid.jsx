import React from 'react'
import { sellerSocket } from "@/sellerSocket";
import { useState, useEffect } from 'react';
import { buyerSocket } from '@/buyerSocket';
import MetricCard from './MetricCardComponent';
import { MeterChart } from '@carbon/charts-react'

//icon imports
import auto from '../../assets/CardGridIcons/auto.png'
import bike from '../../assets/CardGridIcons/bike.png'
import cab from '../../assets/CardGridIcons/cab.png'
import cancel from '../../assets/CardGridIcons/cancel.png'
import coinsdistributed from '../../assets/CardGridIcons/coinsdistributed.png'
import completed from '../../assets/CardGridIcons/completed.png'
import driverearning from '../../assets/CardGridIcons/driverearning.png'
import drivers from '../../assets/CardGridIcons/drivers.png'
import driverwalletadd from '../../assets/CardGridIcons/driverwalletadd.png'
import fake from '../../assets/CardGridIcons/fake.png'
import kms from '../../assets/CardGridIcons/kms.png'
import savecommission from '../../assets/CardGridIcons/savecommission.png'
import search from '../../assets/CardGridIcons/search.png'
import subscriptiontrans from '../../assets/CardGridIcons/subscriptiontrans.png'
import totalsubscription from '../../assets/CardGridIcons/totalsubscription.png'
import user from '../../assets/CardGridIcons/user.png'
import userredeem from '../../assets/CardGridIcons/userredeem.png'

function CardGrid() {
    const [todayMetrics, setTodayMetrics] = useState({})
    const [allTimeMetrics, setAllTimeMetrics] = useState({})
    const [lastHourMetrics, setLastHourMetrics] = useState({})

    const [allTimeIncrease, setAllTimeIncrease] = useState({})
    const [lastHourIncrease, setLastHourIncrease] = useState({})
    const calculateCommission = (earnings) => {
        return typeof earnings === 'number' ? earnings * 0.25 : 0;
    };

    const formatNumber = (num) => {
        if (!num && num !== 0) return "0"; // Handle undefined or null gracefully
        if (num >= 10000000) return `${(num / 10000000).toFixed(2)}CR`;
        if (num >= 100000) return `${(num / 100000).toFixed(2)}L`;
        if (num >= 1000) return `${(num / 1000).toFixed(2)}k`;
        return num.toFixed(2); // Two decimal places for small numbers
    };

    const d = [{
        group: 'Search/Completed Ride Ratio',
        value: allTimeMetrics.SearchRides / allTimeMetrics.completedRides || 0
    }]

    const op = {
        title: "Conversion Rate",
        meter: {
            peak: 70
        },
        height: '100px'
    }


    useEffect(() => {
        const handleMetrics = (data) => {
            setAllTimeMetrics((prevData) => ({
                ...prevData,
                ...data.allTimeMetrics,
            }));
            setTodayMetrics((prevData) => ({
                ...prevData,
                ...data.todayMetrics,
            }));
            setLastHourMetrics((prevData) => ({
                ...prevData,
                ...data.lastHourMetrics,
            }));
            setAllTimeIncrease((prevData) => ({
                ...prevData,
                ...data.allTimeIncrease,
            }));
            setLastHourIncrease((prevData) => ({
                ...prevData,
                ...data.lastHourIncrease,
            }));
        };

        sellerSocket.on("rideMetrics", handleMetrics);
        sellerSocket.on("driverMetrics", handleMetrics);

        buyerSocket.on("userMetrics", handleMetrics);
        buyerSocket.on("rideBuyerMetrics", handleMetrics);
        buyerSocket.on("coinTransactionMetrics", handleMetrics);

        return () => {
            sellerSocket.off("rideMetrics", handleMetrics);
            sellerSocket.off("driverMetrics", handleMetrics);
            buyerSocket.off("userMetrics", handleMetrics);
            buyerSocket.off("rideBuyerMetrics", handleMetrics);
            buyerSocket.off("coinTransactionMetrics", handleMetrics);
        };
    }, []);


    const todayTabData = [
        {
            icon: search,
            number: formatNumber(todayMetrics.SearchRides || 0),
            title: "Search Rides",
            increase: lastHourMetrics.SearchRides,
        },
        {
            icon: completed,
            number: formatNumber(todayMetrics.completedRides || 0),
            title: "Complete Rides",
            increase: lastHourMetrics.completedRides,
        },
        {
            icon: driverearning,
            number: formatNumber(todayMetrics.driversEarnings || 0),
            title: "Driver's Earnings",
            increase: lastHourMetrics.driversEarnings,
        },
        {
            icon: savecommission,
            number: formatNumber(calculateCommission(todayMetrics.driversEarnings) || 0),
            title: "Save Commission",
            increase: calculateCommission(lastHourMetrics.driversEarnings),
        },
        {
            icon: user,
            number: formatNumber(todayMetrics.Users || 0),
            title: "User Registered",
            increase: lastHourMetrics.Users,
        },
        {
            icon: drivers,
            number: formatNumber(todayMetrics.driversRegistered || 0),
            title: "Driver Registered",
            increase: lastHourMetrics.driversRegistered,
        },
        {
            icon: driverwalletadd,
            number: formatNumber(todayMetrics.walletCredits || 0),
            title: "Driver Wallet Add",
            increase: lastHourMetrics.walletCredits,
        },
        {
            icon: subscriptiontrans,
            number: formatNumber(todayMetrics.subscriptionTransactions || 0),
            title: "Subscription Transactions",
            increase: lastHourMetrics.subscriptionTransactions,
        },
        {
            icon: totalsubscription,
            number: formatNumber(todayMetrics.subscriptionAmount || 0),
            title: "Total Subscription Amount",
            increase: lastHourMetrics.subscriptionAmount,
        },
        {
            icon: coinsdistributed,
            number: formatNumber(todayMetrics.coinsDistributed || 0),
            title: "Coins Distributed",
            increase: lastHourMetrics.coinsDistributed,
        },
        {
            icon: userredeem,
            number: formatNumber(todayMetrics.userRedeemMoney || 0),
            title: "User Redeem Money",
            increase: lastHourMetrics.userRedeemMoney,
        },
        {
            icon: kms,

            number: formatNumber(todayMetrics.kmServed || 0),
            title: "KM We Serve",
            increase: lastHourMetrics.kmServed,
        },
        {
            icon: bike,

            number: formatNumber(todayMetrics.BikeRides || 0),
            title: "Bike Taxi",
            increase: lastHourMetrics.BikeRides,
        },
        {
            icon: auto,

            number: formatNumber(todayMetrics.totalVerifiedAuto || 0),
            title: "Auto Rickshaw",
            increase: lastHourMetrics.totalVerifiedAuto,
        },
        {
            icon: cab,

            number: formatNumber(todayMetrics.totalVerifiedCab || 0),
            title: "Cab",
            increase: lastHourMetrics.totalVerifiedCab,
        },
        {
            icon: fake,

            number: formatNumber(todayMetrics.FakeRides || 0),
            title: "Fake Rides",
            increase: lastHourMetrics.FakeRides,
        },
        {
            icon: cancel,

            number: formatNumber(todayMetrics.cancelledRides || 0),
            title: "Cancel Rides",
            increase: lastHourMetrics.cancelledRides,
        },
    ];


    const allTimeTabData = [
        {
            icon: search,
            number: formatNumber(allTimeMetrics.SearchRides || 0),
            title: "Search Rides",
            increase: todayMetrics.SearchRides,
            hover: true,
            hoverData: {
                title: "Number of Ride Search",
                todayNumber: todayMetrics.SearchRides,
                todayNumberLine: "Today's Search ride",
                lastHourNumber: lastHourMetrics.SearchRides,
                lastHourNumberLine: "Last hour's Search",
            },
        },
        {
            icon: completed,
            number: formatNumber(allTimeMetrics.completedRides || 0),
            title: "Complete Rides",
            increase: todayMetrics.completedRides,
            hover: true,
            hoverData: {
                title: "Number of Completed Rides",
                todayNumber: todayMetrics.completedRides,
                todayNumberLine: "Today's Completed ride",
                lastHourNumber: lastHourMetrics.completedRides,
                lastHourNumberLine: "Last hour's Completed ride",
            },
        },
        {
            icon: driverearning,
            number: formatNumber(allTimeMetrics.driversEarnings || 0),
            title: "Driver's Earnings",
            increase: todayMetrics.driversEarnings,
            hover: true,
            hoverData: {
                title: "Driver's Earnings",
                todayNumber: todayMetrics.driversEarnings,
                todayNumberLine: "Today's Earnings",
                lastHourNumber: lastHourMetrics.driversEarnings,
                lastHourNumberLine: "Last hour's Earnings",
            },
        },
        {
            icon: savecommission,
            number: formatNumber(calculateCommission(allTimeMetrics.driversEarnings) || 0),
            title: "Save Commission",
            increase: calculateCommission(todayMetrics.driversEarnings),
            hover: true,
            hoverData: {
                title: "Saved Commissions",
                todayNumber: calculateCommission(todayMetrics.driversEarnings),
                todayNumberLine: "Today's Saved Commission",
                lastHourNumber: calculateCommission(lastHourMetrics.driversEarnings),
                lastHourNumberLine: "Last hour's Saved Commission",
            },
        },
        {
            icon: user,
            number: formatNumber(allTimeMetrics.Users || 0),
            title: "User Registered",
            increase: todayMetrics.Users,
            hover: true,
            hoverData: {
                title: "Number of Registered Users",
                todayNumber: todayMetrics.Users,
                todayNumberLine: "Today's Registered Users",
                lastHourNumber: lastHourMetrics.Users,
                lastHourNumberLine: "Last hour's Registered Users",
            },
        },
        {
            icon: drivers,
            number: formatNumber(allTimeMetrics.driversRegistered || 0),
            title: "Driver Registered",
            increase: todayMetrics.driversRegistered,
            hover: true,
            hoverData: {
                title: "Number of Driver Registrations",
                todayNumber: todayMetrics.driversRegistered,
                todayNumberLine: "Today's Driver Registrations",
                lastHourNumber: lastHourMetrics.driversRegistered,
                lastHourNumberLine: "Last hour's Driver Registrations",
            },
        },
        {
            icon: driverwalletadd,
            number: formatNumber(allTimeMetrics.walletCredits || 0),
            title: "Driver Wallet Add",
            increase: todayMetrics.walletCredits,
            hover: true,
            hoverData: {
                title: "Driver Wallet Additions",
                todayNumber: todayMetrics.walletCredits,
                todayNumberLine: "Today's Wallet Additions",
                lastHourNumber: lastHourMetrics.walletCredits,
                lastHourNumberLine: "Last hour's Wallet Additions",
            },
        },
        {
            icon: subscriptiontrans,
            number: formatNumber(allTimeMetrics.subscriptionTransactions || 0),
            title: "Subscription Transactions",
            increase: todayMetrics.subscriptionTransactions,
            hover: true,
            hoverData: {
                title: "Subscription Transactions",
                todayNumber: todayMetrics.subscriptionTransactions,
                todayNumberLine: "Today's Subscription Transactions",
                lastHourNumber: lastHourMetrics.subscriptionTransactions,
                lastHourNumberLine: "Last hour's Subscription Transactions",
            },
        },
        {
            icon: totalsubscription,
            number: formatNumber(allTimeMetrics.subscriptionAmount || 0),
            title: "Total Subscription Amount",
            increase: todayMetrics.subscriptionAmount,
            hover: true,
            hoverData: {
                title: "Total Subscription Amount",
                todayNumber: todayMetrics.subscriptionAmount,
                todayNumberLine: "Today's Subscription Amount",
                lastHourNumber: lastHourMetrics.subscriptionAmount,
                lastHourNumberLine: "Last hour's Subscription Amount",
            },
        },
        {
            icon: coinsdistributed,
            number: formatNumber(allTimeMetrics.coinsDistributed || 0),
            title: "Coins Distributed",
            increase: todayMetrics.coinsDistributed,
            hover: true,
            hoverData: {
                title: "Coins Distributed",
                todayNumber: todayMetrics.coinsDistributed,
                todayNumberLine: "Today's Coins Distributed",
                lastHourNumber: lastHourMetrics.coinsDistributed,
                lastHourNumberLine: "Last hour's Coins Distributed",
            },
        },
        {
            icon: userredeem,
            number: formatNumber(allTimeMetrics.userRedeemMoney || 0),
            title: "User Redeem Money",
            increase: todayMetrics.userRedeemMoney,
            hover: true,
            hoverData: {
                title: "User Redeemed Money",
                todayNumber: todayMetrics.userRedeemMoney,
                todayNumberLine: "Today's Redeemed Money",
                lastHourNumber: lastHourMetrics.userRedeemMoney,
                lastHourNumberLine: "Last hour's Redeemed Money",
            },
        },
        {
            icon: kms,
            number: formatNumber(allTimeMetrics.kmServed || 0),
            title: "KM We Serve",
            increase: todayMetrics.kmServed,
            hover: true,
            hoverData: {
                title: "Kilometers Served",
                todayNumber: todayMetrics.kmServed,
                todayNumberLine: "Today's Kilometers Served",
                lastHourNumber: lastHourMetrics.kmServed,
                lastHourNumberLine: "Last hour's Kilometers Served",
            },
        },
        {
            icon: bike,
            number: formatNumber(allTimeMetrics.BikeRides || 0),
            title: "Bike Taxi",
            increase: todayMetrics.BikeRides,
            hover: true,
            hoverData: {
                title: "Number of Bike Rides",
                todayNumber: todayMetrics.BikeRides,
                todayNumberLine: "Today's Bike Rides",
                lastHourNumber: lastHourMetrics.BikeRides,
                lastHourNumberLine: "Last hour's Bike Rides",
            },
        },
        {
            icon: auto,
            number: formatNumber(allTimeMetrics.totalVerifiedAuto || 0),
            title: "Auto Rickshaw",
            increase: todayMetrics.totalVerifiedAuto,
            hover: true,
            hoverData: {
                title: "Number of Auto Rickshaw Rides",
                todayNumber: todayMetrics.totalVerifiedAuto,
                todayNumberLine: "Today's Auto Rickshaw Rides",
                lastHourNumber: lastHourMetrics.totalVerifiedAuto,
                lastHourNumberLine: "Last hour's Auto Rickshaw Rides",
            },
        },
        {
            icon: cab,
            number: formatNumber(allTimeMetrics.totalVerifiedCab || 0),
            title: "Cab",
            increase: todayMetrics.totalVerifiedCab,
            hover: true,
            hoverData: {
                title: "Number of Cab Rides",
                todayNumber: todayMetrics.totalVerifiedCab,
                todayNumberLine: "Today's Cab Rides",
                lastHourNumber: lastHourMetrics.totalVerifiedCab,
                lastHourNumberLine: "Last hour's Cab Rides",
            },
        },
        {
            icon: fake,
            number: formatNumber(allTimeMetrics.FakeRides || 0),
            title: "Fake Rides",
            increase: todayMetrics.FakeRides,
            hover: true,
            hoverData: {
                title: "Number of Fake Rides",
                todayNumber: todayMetrics.FakeRides,
                todayNumberLine: "Today's Fake Rides",
                lastHourNumber: lastHourMetrics.FakeRides,
                lastHourNumberLine: "Last hour's Fake Rides",
            },
        },
        {
            icon: cancel,
            number: formatNumber(allTimeMetrics.cancelledRides || 0),
            title: "Cancel Rides",
            increase: todayMetrics.cancelledRides,
            hover: true,
            hoverData: {
                title: "Number of Cancelled Rides",
                todayNumber: todayMetrics.cancelledRides,
                todayNumberLine: "Today's Cancelled Rides",
                lastHourNumber: lastHourMetrics.cancelledRides,
                lastHourNumberLine: "Last hour's Cancelled Rides",
            },
        },
    ];

    const [activeTab, setActiveTab] = useState('today');

    return (
        <>
            <div className="p-6">
                {/* Tab Switcher */}
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-sm text-gray-500">This data show for ...</span>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                        <button
                            className={`px-4 py-2 rounded-md text-sm transition-colors ${activeTab === 'today'
                                ? 'bg-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('today')}
                        >
                            Today
                        </button>
                        <button
                            className={`px-4 py-2 rounded-md text-sm transition-colors ${activeTab === 'allTime'
                                ? 'bg-blue-500 text-white shadow-sm'
                                : 'text-gray-500 hover:text-gray-700'
                                }`}
                            onClick={() => setActiveTab('allTime')}
                        >
                            All Time
                        </button>
                    </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {(activeTab === 'today' ? todayTabData : allTimeTabData).map((metric, index) => (
                        <MetricCard
                            key={`${metric.title}-${index}`}
                            icon={metric.icon}
                            title={metric.title}
                            number={metric.number}
                            increase={metric.increase}
                            hover={metric.hover}
                            hoverData={metric.hoverData}
                        />
                    ))}
                </div>
            </div>
            <div className='p-2 border-2 border-gray-100 m-6 rounded '><MeterChart data={d} options={op}></MeterChart></div>

        </>
    )
}

export default CardGrid