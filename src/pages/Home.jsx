import { useState } from 'react'
// import MapComponent from '@/components/MapComponent';
// import DriverTable from '@/components/DriverTable';
import GeoMetrics from '@/components/GeoMetrics';
import RideStatistics from '@/components/statistics';
import SideNavbar from '@/components/SideNavbar';
import NavStats from '@/components/navStats';
import DriverChart from '@/components/drivers/allDrivers/DriverCharts';
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
            <SideNavbar></SideNavbar>
            <div className='ml-[250px]'>
                <NavStats />
                <GeoMetrics
                    selectedDriver={selectedDriver}
                    onDriverSelect={handleDriverSelect}
                /> 
                <RideStatistics />
                <DriverChart />
            </div>
        </div>
    );
}


export default Home