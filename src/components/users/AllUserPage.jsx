import React, { useEffect, useState } from 'react'
import SideNavbar from '../SideNavbar'
import AllUserTable from './AllUserTable'
import Header from '../drivers/allDrivers/Header'
import axios from 'axios'
function AllUserPage() {
    return (
        <>
            <div className="flex">
                <SideNavbar />
                <div className='pl-[250px] w-full'>
                    <Header title='Users'></Header>
                    <AllUserTable />
                </div>
            </div>
        </>
    )
}

export default AllUserPage