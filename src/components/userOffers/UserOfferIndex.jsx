import Header from "../drivers/allDrivers/Header"
import SideNavbar from "../SideNavbar"
import AllUserOffers from "./AllUserOffers"


function UserOfferIndex() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='USER OFFERS' />
                <div className="overflow-auto">
                    <AllUserOffers />
                </div>
            </div>
        </div>
    )
}

export default UserOfferIndex
