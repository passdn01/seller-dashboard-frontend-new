import Header from '../drivers/allDrivers/Header'
import SideNavbar from '../SideNavbar'
import RideTableNew from './AllRidesNew'


function AllRides() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='ALL RIDES' />
                <div className='overflow-auto'>
                    <RideTableNew />
                </div>
            </div>
        </div>
    )
}

export default AllRides
