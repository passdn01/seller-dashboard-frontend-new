import React, { useEffect, useState } from 'react'
import SideNavbar from '../SideNavbar'
import Header from '../drivers/allDrivers/Header'
import axios from 'axios'
import UserTable from './UserTable'
import AllUserTableNew from './AllUserTableNew'
function AllUserPage() {
    return (
        <>
            <div className="flex">
                <SideNavbar />
                <div className='pl-[250px] w-full'>
                    <Header title='Users'></Header>
                    <AllUserTableNew />
                </div>
            </div>
        </>
    )
}

export default AllUserPage