import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import axios from 'axios';
import startPoint from '../../assets/startPointImg.png';
import endPoint from '../../assets/endPointImg.png';
import { SELLER_URL_LOCAL } from '@/lib/utils';

const RideCard = ({ data }) => {
    const { ride, driverInfo } = data;
    console.log("data ride", data);

    const [startAddress, setStartAddress] = useState('Fetching location...');
    const [destinationAddress, setDestinationAddress] = useState('Fetching location...');

    const getAddressFromBackend = async (lat, lon, setAddress) => {
        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/gpsToAddress`, { lat, lon }, { headers: { Authorization: `Bearer ${token}` } });
            const address = response.data.address || 'Unknown Location';
            setAddress(address);
        } catch (error) {
            console.error('Error fetching address:', error);
            setAddress('Error fetching address');
        }
    };

    useEffect(() => {
        const fromLat = ride.location.fromLocation.latitude;
        const fromLon = ride.location.fromLocation.longitude;
        const toLat = ride.location.toLocation.latitude;
        const toLon = ride.location.toLocation.longitude;

        getAddressFromBackend(fromLat, fromLon, setStartAddress);
        getAddressFromBackend(toLat, toLon, setDestinationAddress);
    }, [ride]);

    return (
        <div className="flex flex-col gap-y-2 p-4 my-6 mx-4 bg-white shadow-lg rounded-lg border max-w-full">
            <CardHeader className="flex flex-row justify-between pb-4">
                <div>
                    <CardTitle className="text-xl font-semibold text-gray-800">Ride Details</CardTitle>
                    <CardDescription className="text-lg text-gray-600">
                        Joined: {new Date(ride.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                        })}
                    </CardDescription>
                </div>
                <div className='text-2xl'>{ride.status}</div>
            </CardHeader>

            {/* Location Details */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="flex-grow-1 md:w-1/2">
                    <Card className="flex-1 p-6 bg-gray-50 border shadow-sm rounded-sm mt-4 mb-2">
                        <span className="text-lg font-semibold text-gray-800">User Info</span>
                        <div className="text-md text-gray-700 mt-2 space-y-1">
                            <p>User Name: {ride.userInfo.name}</p>
                            <p>User Phone: {ride.userInfo.phone}</p>
                        </div>
                    </Card>
                    <Card className="flex-1 p-6 bg-gray-50 border shadow-sm rounded-sm">
                        <span className="text-lg font-semibold text-gray-800">Driver Info</span>
                        {driverInfo ? (
                            <div className="text-md text-gray-700 mt-2 space-y-1">
                                <p>Driver Name: {driverInfo.name}</p>
                                <p>Phone: {driverInfo.phone}</p>
                                <p>Vehicle Number: {driverInfo.vehicleNumber}</p>
                                <p>Category: {driverInfo.category}</p>
                                <p>License Number: {driverInfo.licenseNumber}</p>
                            </div>
                        ) : (
                            <p className="text-red-500 mt-2">Driver info unavailable</p>
                        )}
                    </Card>
                </div>
                <div className="flex-grow-1 md:w-1/2">
                    <div className="flex p-4 mb-2 gap-4">
                        <img src={startPoint} alt="Start Point" className="w-5 h-5" />
                        <div className="text-md text-gray-700">
                            <p>{startAddress}</p>
                        </div>
                    </div>

                    <div className="flex p-4 gap-4">
                        <img src={endPoint} alt="End Point" className="w-5 h-5" />
                        <div className="text-md text-gray-700">
                            <p>{destinationAddress}</p>
                        </div>
                    </div>

                    <div className="flex p-2 gap-4">
                        <Card className="p-4 gap-4 md:w-1/2">
                            <span className="text-gray-700">Pick Up</span>
                            <div className="text-2xl">
                                <p>0.05</p>
                            </div>
                        </Card>
                        <Card className="p-4 gap-4 md:w-1/2">
                            <span className="text-gray-700">Waiting Charge</span>
                            <div className="text-2xl">
                                <p>0.00</p>
                            </div>
                        </Card>
                    </div>

                    <div className="flex p-2 gap-4">
                        <Card className="p-4 gap-4 md:w-1/2">
                            <span className="text-gray-700">Fare</span>
                            <div className="text-2xl">
                                <p>{ride.fare}</p>
                            </div>
                        </Card>
                        <Card className="p-4 gap-4 md:w-1/2">
                            <span className="text-gray-700">Distance</span>
                            <div className="text-2xl">
                                <p>{ride.distance}</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <Card className="flex-1 p-4 bg-gray-50 border shadow-sm rounded-lg">
                    <span className="text-lg font-semibold text-gray-800">Driver Info</span>
                    {driverInfo ? (
                        <div className="text-md text-gray-700 mt-2 space-y-1">
                            <p>Driver Name: {driverInfo.name}</p>
                            <p>Vehicle Number: {driverInfo.vehicleNumber}</p>
                            <p>Phone: {driverInfo.phone}</p>
                            <p>Vehicle Type: {driverInfo.vehicleType}</p>
                        </div>
                    ) : (
                        <p className="text-red-500 mt-2">Driver info unavailable</p>
                    )}
                </Card>

                <Card className="flex-1 p-4 bg-gray-50 border shadow-sm rounded-lg">
                    <span className="text-lg font-semibold text-gray-800">User Info</span>
                    <div className="text-md text-gray-700 mt-2 space-y-1">
                        <p>User Name: {ride.userInfo.name}</p>
                        <p>User Phone: {ride.userInfo.phone}</p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default RideCard;
