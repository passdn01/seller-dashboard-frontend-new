import SideNavbar from '../../../components/SideNavbar.jsx'
import MapComponent from '@/components/MapComponent'
import { useState } from 'react'
import LiveDriverTable from './LiveDataTable.jsx';
import Header from './Header.jsx';

function LiveDrivers() {

    const [selectedDriver, setSelectedDriver] = useState(null);

    const handleDriverSelect = (driver) => {
        setSelectedDriver(driver);

        // Scroll to the top of the page
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    return (
        <div className="flex items-start gap-x-2 bg-[#F4F4F4] h-auto">
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full bg-[#ffffff]' title='LIVE DRIVERS' />
                <MapComponent
                    selectedDriver={selectedDriver}
                    onDriverSelect={handleDriverSelect}
                />
                <div className='h-full'>
                    <LiveDriverTable onDriverSelect={handleDriverSelect} />
                </div>
            </div>
        </div>
    )
}

export default LiveDrivers
