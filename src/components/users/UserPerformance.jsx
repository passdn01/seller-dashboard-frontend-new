import React, { useEffect, useState } from 'react';
import axios from 'axios';

// Example imports of your SVGs as components
import TotalRideIcon from '../../assets/driverPerformance/totalrides.svg';
import RatingIcon from '../../assets/driverPerformance/rating.svg';
import ReferralIcon from '../../assets/driverPerformance/referral.svg';
import EarningsIcon from '../../assets/driverPerformance/totalearning.svg';

const UserPerformance = ({ userData }) => {
    const [pdata, setPdata] = useState({});
    const userId = userData?.id;

    useEffect(() => {
        const fetchPerformance = async () => {
            try {
                const response = await axios.post(
                    "https://55kqzrxn-6000.inc1.devtunnels.ms/dashboard/api/users/performance",
                    { userId }
                );

                if (response.data.success) {
                    setPdata(response.data.data);
                } else {
                    window.alert(response.data.message);
                }
            } catch (error) {
                console.error("Error fetching performance data:", error);
            }
        };

        if (userId) {
            fetchPerformance();
        }
    }, [userId]);

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
