import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Example imports of your SVGs as components
import TotalRideIcon from '../../assets/driverPerformance/totalrides.svg';
import RatingIcon from '../../assets/driverPerformance/rating.svg';
import ReferralIcon from '../../assets/driverPerformance/referral.svg';
import EarningsIcon from '../../assets/driverPerformance/totalearning.svg';
import { SELLER_URL_LOCAL } from '@/lib/utils';

const UserPerformance = ({ userData }) => {
    console.log("user data in performance is", userData)
    const [pdata, setPdata] = useState({});
    const userId = userData?._id;
    console.log("id", userId);
    useEffect(() => {


        if (userId) {
            fetchPerformance();
        }
    }, [userId]);

    const fetchPerformance = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/coinTransactionNumber`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: userId
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const dt = await response.json(); // Extract JSON response
            console.log("Parsed response:", dt);
            setPdata(dt.data)

            console.log("response that came is ", response);


        } catch (error) {
            console.error("Error fetching performance data:", error);
        }
    };

    console.log("pdata", pdata);

    const dataList = [
        { icon: TotalRideIcon, label: 'Total ride', value: userData?.rideCreated?.length || 0 },
        { icon: ReferralIcon, label: 'Coin transactions', value: pdata?.totalTransactions || 0 },
        { icon: EarningsIcon, label: 'Total Cashback', value: pdata?.totalCashback || 0 }
    ];

    return (
        <div className="p-6 border rounded-md mx-4">
            <h2 className="text-lg font-medium mb-4">Performance Indicator</h2>
            <div className="grid grid-cols-3 gap-6 text-center">
                {dataList.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <img src={item.icon} alt={item.label} className="text-2xl mb-2" />
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xl font-bold">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UserPerformance;
