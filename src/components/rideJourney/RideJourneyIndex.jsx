import Header from "../drivers/allDrivers/Header"
import SideNavbar from "../SideNavbar"
import RideJourney from "./RideJourney"


function RideJourneyIndex() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='RIDE JOURNEY' />
                <div className="overflow-auto">

                    <RideJourney />
                </div>
            </div>
        </div>
    )
}

export default RideJourneyIndex
