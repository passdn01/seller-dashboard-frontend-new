import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import backArrow from '../../assets/backArrow.svg'
// import UserCard from './UserCard.jsx/index.js';
// import DriverLicense from './DriverLicense';
// import DriverRC from './DriverRC';
// import Performance from './Performance.jsx'
// import Subscription from './Subscription';
// import Header from './Header';
import {
    Dialog,
    // DialogContent,
    // DialogDescription,
    // DialogHeader,
    // DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import RideCard from './RideCard';
import SideNavbar from '../SideNavbar';
import Header from '../drivers/allDrivers/Header';
import { Oval } from 'react-loader-spinner';

function Ride() {
    const { id } = useParams();
    console.log(id);
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.post(`https://9tw16vkj-5000.inc1.devtunnels.ms/dashboard/api/ride/${id}`)
            .then((response) => {
                if (response.data.success) {
                    setData(response.data.data);
                } else {
                    throw new Error(response.data.message || 'Failed to fetch data');
                }
                setLoading(false);
            })
            .catch((error) => {
                setError(error.message);
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
        <Oval
            height={60}
            width={60}
            color="#4fa94d"
            visible={true}
            ariaLabel='oval-loading'
            secondaryColor="#4fa94d"
            strokeWidth={2}
            strokeWidthSecondary={2}
        />
    </div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }


    return (

        <div className='flex'>

            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='RIDE DETAILS' />
                <div className='overflow-auto mx-8'>
                    <div className='p-4 my-4 justify-between flex'>
                        <Button variant='outline' className='shadow' onClick={() => {

                            navigate('/rides/allRides', { state: { fromBackButton: true } });
                        }}><img src={backArrow} alt="" /></Button>
                        <Button variant='outline' className='shadow text-blue-500' onClick={() => { return window.location.reload(); }}>REFRESH</Button>
                    </div>
                    <div className='flex flex-row items-center justify-between'>
                        <Breadcrumb className='px-4'>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                <BreadcrumbLink href="/rides/allRides" className='text-blue-500' >AllRides</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink >RideDetail</BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <Dialog>
                            <DialogTrigger className='pr-4'>
                                <span className='text-blue-600 hover:underline text-sm border-2 p-1'>Edit</span>
                            </DialogTrigger>
                            {/* <DialogContent className="">
                                <DrivingLicenseForm data={data} id={id}></DrivingLicenseForm>
                            </DialogContent> */}
                        </Dialog>
                    </div>
                    <div>
                        <div>
                            <RideCard data={data}></RideCard>
                        </div>
                        {/* <div className="flex flex-col md:flex-row gap-4 p-4">
                            <DriverLicense data={data} />
                            <DriverRC data={data} />
                        </div> */}
                        {/* <div>
                            <Performance data={data}></Performance>
                        </div>

                        <div className=''>

                            <Subscription data={data}></Subscription>
                        </div> */}
                    </div>
                </div>
            </div>

        </div>

    );
}

export default Ride;
