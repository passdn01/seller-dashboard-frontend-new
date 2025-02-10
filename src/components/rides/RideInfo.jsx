import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import RideDetail from './RideDetail'
import SideNavbar from '../SideNavbar'
import axios from 'axios'
import Header from '../drivers/allDrivers/Header'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    // BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import backArrow from '../../assets/backArrow.svg'
import RideInfoCard from './RideInfoCard'
import { SELLER_URL_LOCAL } from '@/lib/utils'
function RideInfo() {
    const { id } = useParams();

    const [transactionId, setTransactionId] = useState(null);
    const [distance, setDistance] = useState(null);
    const [userInfo, setUserInfo] = useState(null);
    const navigate = useNavigate()
    useEffect(() => {
        const fetchRideInfo = async () => {
            const response = await axios.post(`${SELLER_URL_LOCAL}/dashboard/api/getRide`, { id: id })
            console.log(response.data, "response in rideinfo")
            if (response?.data?.success) {
                setTransactionId(response.data.data.transactionId)
                setDistance(response.data.data.distance)
                setUserInfo(response.data.data.userInfo)
            }
        }
        fetchRideInfo()

    }, [id])
    return (
        <div className='flex'>
            <SideNavbar></SideNavbar>
            <div className='flex-1 ml-[250px]'>
                <Header className="w-full" title="RIDE INFO" />
                <div className="overflow-auto mx-8">
                    <div className="p-4 my-4 justify-between flex">
                        <Button
                            variant="outline"
                            className="shadow"
                            onClick={() => navigate('/rides/allRides', { state: { fromBackButton: true } })}
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
                                        Rides
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink>Ride Info</BreadcrumbLink>
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

                    <div className='flex flex-row items-center justify-between m-8 border rounded-md shadow '>
                        <RideDetail transactionId={transactionId} distance={distance}></RideDetail>
                    </div>

                    <div className='flex flex-row items-center justify-between m-8 border rounded-md shadow '>
                        <RideInfoCard userInfo={userInfo} />

                    </div>
                </div>
            </div>
        </div>
    )
}

export default RideInfo