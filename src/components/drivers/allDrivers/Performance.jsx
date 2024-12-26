import React from 'react';

// Example imports of your SVGs as components
import TotalRideIcon from '../../../assets/driverPerformance/totalrides.svg'
import RatingIcon from '../../../assets/driverPerformance/rating.svg'
import ReferralIcon from '../../../assets/driverPerformance/referral.svg'
import EarningsIcon from '../../../assets/driverPerformance/totalearning.svg'

const Performance = ({ data }) => {
    const { driverInfo, otherInfo, referrals } = data
 
    const dataList = [
        { icon: TotalRideIcon, label: 'Total ride', value: otherInfo[0]?.totalRides || 0 },
        { icon: RatingIcon, label: 'Rating', value: driverInfo?.rating },
        { icon: ReferralIcon, label: 'Referral', value: referrals },
        { icon: EarningsIcon, label: 'Total Earning', value: otherInfo[0]?.totalEarning || 0 }
    ];

    return (
        <div className="p-6 border rounded-md  mx-4">
            <h2 className="text-lg font-medium mb-4">Performance Indicator</h2>
            <div className="grid grid-cols-4 gap-6 text-center">
                {dataList.map((item, index) => (
                    <div key={index} className="flex flex-col items-center">
                        <img src={item.icon} className="text-2xl mb-2" />
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xl font-bold">{item.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Performance;
