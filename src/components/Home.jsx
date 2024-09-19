import React from 'react'
import SideNavbar from './SideNavbar'
function Home() {
    return (
        <div className='flex items-start gap-x-2'>
            <SideNavbar></SideNavbar>
            <div className=''>Home</div>
        </div>
    )
}

export default Home