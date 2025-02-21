import Header from "../drivers/allDrivers/Header"
import SideNavbar from "../SideNavbar"
import DriverJourney from "./DriverJourney"


function DriverJourneyIndex() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='DRIVER JOURNEY' />
                <div className="overflow-auto">

                    <DriverJourney />
                </div>
            </div>
        </div>
    )
}

export default DriverJourneyIndex
