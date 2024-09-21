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


import Header from './Header';

function Driver() {
    const { id } = useParams();  // Destructure the id param
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
                    <div>
                        <div>
                            <DriverCard data={data}></DriverCard>
                        </div>
                        <div className='flex'>
                            rc and driving license <div></div>
                            <div></div>
                        </div>
                        <div>
                            performance
                        </div>
                        <div>
                            charts
                        </div>
                        <div>
                            subscription
                        </div>
                    </div>




                </div>
            </div>
        </div>
    );
}

export default Driver;
