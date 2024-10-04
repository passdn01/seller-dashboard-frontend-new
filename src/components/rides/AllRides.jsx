import Header from '../drivers/allDrivers/Header'
import SideNavbar from '../SideNavbar'
import RideTable from './RideTable'

function AllRides() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='ALL RIDES' />
                <div className='overflow-auto'>
                    <RideTable />
                </div>
            </div>
        </div>
    )
}

export default AllRides
