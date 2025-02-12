import React from 'react'
import MetricCard from './MetricCardComponent'
import SideNavbar from '../SideNavbar'
import { TrendingUp } from 'lucide-react'
import { RideDashboard } from './RideDashboard'
import { useState } from 'react'

function HomeMetricPage() {

    return (
        <div className='flex w-full'>
            <SideNavbar></SideNavbar>
            <div className='pl-[250px] w-full'>
                <RideDashboard></RideDashboard>
            </div>
        </div>
    )
}

export default HomeMetricPage