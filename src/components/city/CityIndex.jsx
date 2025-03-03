import Header from "../drivers/allDrivers/Header"
import SideNavbar from "../SideNavbar"
import CityTable from "./CityTable"


function CityIndex() {
    return (
        <div className='flex'>
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='CITY' />
                <div className="overflow-auto">
                    <CityTable />  
                </div>
            </div>
        </div>
    )
}

export default CityIndex
