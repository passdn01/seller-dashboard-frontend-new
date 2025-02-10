import React, { useEffect, useState } from 'react'
import SideNavbar from '../SideNavbar'
import AllUserTable from './AllUserTable'
import Header from '../drivers/allDrivers/Header'
import axios from 'axios'
import { BUYER_URL_LOCAL } from '@/lib/utils'
function AllUserPage() {
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState([])
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${BUYER_URL_LOCAL}/dashboard/api/allUserTable`);
                console.log(response, "reesdsds")
                if (response.data.success) {
                    setData(response.data.data);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch data');
                }
            } catch (e) {
                console.error(e.message)
            }

        }
        fetchData();
    }, [])
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