import React from 'react'
import ContestsList from './ContestsList'
import Header from '../drivers/allDrivers/Header'
import SideNavbar from '../SideNavbar'
function AllContests() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='ALL CONTESTS' />
                <div className='overflow-auto px-8'>
                    <ContestsList />
                </div>
            </div>
        </div>
    )
}

export default AllContests