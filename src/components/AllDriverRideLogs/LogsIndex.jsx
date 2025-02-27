import Header from "../drivers/allDrivers/Header"
import SideNavbar from "../SideNavbar"
import AllDriverRideLogs from "./AllDriverRideLogs"


function LogsIndex() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='DRIVER RIDE LOGS' />
                <div className="overflow-auto">

                    <AllDriverRideLogs />
                </div>
            </div>
        </div>
    )
}

export default LogsIndex
