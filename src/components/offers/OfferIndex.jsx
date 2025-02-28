import Header from "../drivers/allDrivers/Header"
import SideNavbar from "../SideNavbar"
import AllOffers from "./AllOffers"


function OfferIndex() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='OFFERS' />
                <div className="overflow-auto">
                    <AllOffers />
                </div>
            </div>
        </div>
    )
}

export default OfferIndex
