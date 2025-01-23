import { useState } from 'react'
// import MapComponent from '@/components/MapComponent';
// import DriverTable from '@/components/DriverTable';
import GeoMetrics from '@/components/GeoMetrics';
import RideStatistics from '@/components/statistics';
import SideNavbar from '@/components/SideNavbar';
import NavStats from '../components/NavStats';
import Header from '@/components/drivers/allDrivers/Header';
function Home() {
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
        <div className="flex items-start gap-x-2 bg-[#F4F4F4]">
            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full bg-[#ffffff]' title='Home' />

                <GeoMetrics
                    selectedDriver={selectedDriver}
                    onDriverSelect={handleDriverSelect}
                />
                <RideStatistics />
            </div>
        </div>
    );
}


export default Home