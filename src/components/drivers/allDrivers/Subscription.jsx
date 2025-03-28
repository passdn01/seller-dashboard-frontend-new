import React, { useState } from 'react'
import { Calendar } from "@/components/ui/calendar"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

import subscriptionpay from '../../../assets/DriverSubscription/subscriptionpay.svg'
import wallet from '../../../assets/DriverSubscription/wallet.svg'

function Subscription({ data }) {
    const { otherInfo, driverInfo } = data;
    console.log(driverInfo, "driver info in subscription")
    const dates = otherInfo[0]?.rideDates.map((el) => { return new Date(el) })
    const frequencyMap = dates.reduce((acc, date) => {
        const key = date.toISOString().split('T')[0];
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    const subPayCount = Object.values(frequencyMap).filter(freq => freq > 2).length;
    const subscriptionDates = dates
        .map(date => date.toISOString().split('T')[0])
        .filter((date, index, self) => frequencyMap[date] >= 2 && self.indexOf(date) === index)

    return (
        <div className='flex flex-row gap-x-4 m-6 justify-center'>
            <Calendar
                mode="single"
                selected={subscriptionDates}
                className="rounded-md border"

            />
            <div>
                <Card className='p-6 m-4 min-w-[600px]'>

                    <CardDescription>
                        <img src={subscriptionpay} alt="" className='w-6 h-6' /> <span className='text-[1rem]'>Total Subscription Pay</span></CardDescription>
                    <span className='font-bold text-xl text-left'>{subPayCount * (driverInfo?.category === "AUTO" ? 20 : driverInfo?.category === "HATCHBACK" ? 50 : 70)}</span>
                </Card>
                <Card className='p-6 m-4 min-w-[600px'>

                    <CardDescription>
                        <img src={wallet} alt="" className='w-6 h-6' /><span className='text-[1rem]'>Total Wallet Balance</span></CardDescription>
                    <span className='font-bold text-xl text-left'>{driverInfo.balance}</span>
                </Card>
                <div className='flex gap-x-2 m-4 pl-1'>
                    <div className='w-6 h-6 bg-blue-600 rounded'></div> <span>Subcription Pay</span>
                </div>

            </div>
        </div>
    )

}

export default Subscription