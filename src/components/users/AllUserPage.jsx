import React, { useEffect, useState } from 'react'
import SideNavbar from '../SideNavbar'
import Header from '../drivers/allDrivers/Header'
import axios from 'axios'
import UserTable from './UserTable'
function AllUserPage() {
    return (
        <>
            <div className="flex">
                <SideNavbar />
                <div className='pl-[250px] w-full'>
                    <Header title='Users'></Header>
                    <UserTable />
                </div>
            </div>
        </>
    )
}

export default AllUserPage