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
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import backArrow from '../../assets/backArrow.svg'
import RideInfoCard from './RideInfoCard'

function RideInfo() {
    const { transaction_id } = useParams();
    console.log("transactrion id", transaction_id)
    const [data, setData] = useState({})
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        const fetchRideInfo = async () => {
            setLoading(true)
            try {
                // Use a safer way to access environment variables
                const baseUrl = import.meta.env.VITE_SELLER_URL_LOCAL || '';
                const token = localStorage.getItem("token");
                const response = await axios.post(`${baseUrl}/dashboard/api/seller/getRide`, { transaction_id: transaction_id }, { headers: { Authorization: `Bearer ${token}` } })

                if (response?.data?.success) {
                    setData(response.data.data)
                } else {
                    setError(response?.data?.message || "Failed to fetch ride information")
                }
            }
            catch (err) {
                console.error("Error fetching ride info:", err)
                setError("An error occurred while fetching ride data")
            } finally {
                setLoading(false)
            }
        }

        if (transaction_id) {
            fetchRideInfo()
        }
    }, [transaction_id])

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
                                    <BreadcrumbLink href="/rides/allRides" className="text-blue-500">
                                        Rides
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbLink>Ride Info</BreadcrumbLink>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    {loading ? (
                        <div className="flex justify-center items-center p-10">
                            <div className="text-lg">Loading ride information...</div>
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded m-8">
                            <p>{error}</p>
                        </div>
                    ) : (
                        <div>
                            <div className='flex flex-row items-center justify-between m-8 border rounded-md shadow'>
                                <RideDetail dataFromTable={data} />
                            </div>

                            <div className='flex flex-row items-center justify-between m-8 border rounded-md shadow'>
                                <RideInfoCard userInfo={data?.userDetails} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default RideInfo