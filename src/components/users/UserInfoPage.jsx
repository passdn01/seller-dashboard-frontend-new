import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    // BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import UserProfileCard from './UserProfileCard';
import SideNavbar from '../SideNavbar';
import Header from '../drivers/allDrivers/Header';
import backArrow from '../../assets/backArrow.svg'
import UserInfoCard from './UserInfoCard';
import UserBankCard from './UserBankCard';
import UserPerformance from './UserPerformance';
import UserRideChart from './UserRideChart';
import UserCashStatement from './UserCashStatement';
import UserLastRides from './UserLastRides';
function UserInfoPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [completeStatus, setCompleteStatus] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, [id]);

    const fetchUserData = async () => {
        try {
            const response = await axios.post(`https://8qklrvxb-6000.inc1.devtunnels.ms/dashboard/api/users/${id}`);
            if (response.data.success) {
                setData(response.data.data);
                setCompleteStatus(response.data.data.isComplete || false);
            } else {
                throw new Error(response.data.message || 'Failed to fetch data');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };



    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    if (error) {
        return <div className="flex justify-center items-center h-screen text-red-500">Error: {error}</div>;
    }

    return (
        <div className="flex">
            <SideNavbar />
            <div className="flex-1 ml-[250px]">
                <Header className="w-full" title="USER INFO" />
                <div className="overflow-auto mx-8">
                    <div className="p-4 my-4 justify-between flex">
                        <Button
                            variant="outline"
                            className="shadow"
                            onClick={() => navigate('/users', { state: { fromBackButton: true } })}
                        >
                            <img src={backArrow} alt="Back" />
                        </Button>
                        <div className="justify-end gap-5 flex">
                            <Button
                                variant="outline"
                                className="shadow text-blue-500"
                                onClick={() => window.location.reload()}
                            >
                                REFRESH
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-row items-center justify-between">
                        <Breadcrumb className="px-4">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="/users" className="text-blue-500">
                                        Users
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink>Profile</BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        {/* <div className="justify-end">
                            <Dialog>
                                <DialogTrigger className="pr-4">
                                    <span className="text-blue-600 hover:underline text-sm border-2 p-1">
                                        Edit
                                    </span>
                                </DialogTrigger>
                                <DialogContent className="mt-[10px] mb-[10px]">
                                    <DrivingLicenseForm data={data} id={id} />
                                    <UploadDocuments id={id} />
                                </DialogContent>
                            </Dialog>


                        </div> */}
                    </div>

                    {/* {data && <UserProfileCard userData={data} />} */}

                    {/* <div className="flex flex-col md:flex-row gap-12 p-4 justify-evenly">
                        <UserInfoCard data={data}></UserInfoCard>
                        <UserBankCard data={data} />

                    </div> */}
                    <UserPerformance userData={data} />
                    {/* <UserRideChart userId={id}></UserRideChart>
                    <UserLastRides userId={id}></UserLastRides>
                    <UserCashStatement userId={id}></UserCashStatement> */}
                </div>
            </div>
        </div>
    );
}

export default UserInfoPage;