import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import SideNavbar from '../../SideNavbar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import backArrow from '../../../assets/backArrow.svg'
import DriverCard from './DriverCard.jsx';
import DriverLicense from './DriverLicense';
import DriverRC from './DriverRC';
import Performance from './Performance.jsx'
import Subscription from './Subscription';
import Header from './Header';
function Driver() {
    const { id } = useParams();
    const [data, setData] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`https://bhk8mp0s-2011.inc1.devtunnels.ms/dashboard/api/${id}`)
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
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }


    return (

        <div className='flex'>

            <SideNavbar />
            <div className='flex-1 ml-[250px]'>
                <Header className='w-full' title='ALL DRIVERS' />
                <div className='overflow-auto mx-8'>
                    <div className='p-4 my-4 justify-between flex'>
                        <Button variant='outline' className='shadow' onClick={() => {

                            navigate('/drivers/allDrivers', { state: { fromBackButton: true } });
                        }}><img src={backArrow} alt="" /></Button>
                        <Button variant='outline' className='shadow text-blue-500' onClick={() => { return window.location.reload(); }}>REFRESH</Button>
                    </div>
                    <div className='flex flex-row items-center justify-between'>
                        <Breadcrumb className='px-4'>
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/drivers/allDrivers" className='text-blue-500' >AllDrivers</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink >DriverDetail</BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                        <div className='mr-4'>
                            Edit
                        </div>
                    </div>
                    <div>
                        <div>
                            <DriverCard data={data}></DriverCard>
                        </div>
                        <div className="flex flex-col md:flex-row gap-4 p-4">
                            <DriverLicense data={data} />
                            <DriverRC data={data} />
                        </div>
                        <div>
                            <Performance data={data}></Performance>
                        </div>

                        <div className=''>

                            <Subscription data={data}></Subscription>
                        </div>
                    </div>
                </div>
            </div>

        </div>

    );
}

export default Driver;
