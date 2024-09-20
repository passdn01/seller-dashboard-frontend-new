import React from 'react'
import Header from './Header'
import SideNavbar from '../../../components/SideNavbar.jsx'

function AllDrivers() {
    return (
        <div className='flex items-start'>
            <SideNavbar />
            <div>
                <Header></Header>

            </div>
        </div>
    )
}

export default AllDrivers