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
    const dates = otherInfo[0]?.rideDates.map((el) => { return new Date(el) })

    return (
        <div className='flex flex-row gap-x-4 m-6 justify-center'>
            <Calendar
                mode="single"
                selected={dates}
                className="rounded-md border"

            />
            <div>
                <Card className='p-6 m-4 min-w-[600px]'>

                    <CardDescription>
                        <img src={subscriptionpay} alt="" className='w-6 h-6' /> <span className='text-[1rem]'>Total Subscription Pay</span></CardDescription>
                    <span className='font-bold text-xl text-left'>{(dates?.length || 0) * 20}</span>
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