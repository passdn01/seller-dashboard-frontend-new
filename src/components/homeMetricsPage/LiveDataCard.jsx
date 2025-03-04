import React, { useEffect, useState } from "react";
import { sellerSocket } from "@/sellerSocket";
import availabledrivers from '../../assets/liveDataCard/availabledrivers.png'
import cities from '../../assets/liveDataCard/cities.png'
import ongoing from '../../assets/liveDataCard/ongoing.png'
const LiveDataComponent = () => {
    const [data, setData] = useState({
        availableDrivers: 0,
        ongoingRides: 0,
        city: "00",
    });

    useEffect(() => {
        sellerSocket.on("connect", () => {
            console.log("Connected to the socket server!");
        });


        sellerSocket.on("disconnect", () => {
            console.log("Disconnected from the socket server!");
        });
        sellerSocket.on("liveDataCard", (newData) => {
            setData(newData);
        });


    }, []);



    return (
        <div className="p-4">
            <div className="flex items-center space-x-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                {/* Live Data Label */}
                <span className="text-red-500 font-semibold text-sm">Live Data</span>

                {/* Available Drivers */}
                <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-md">
                    <img src={availabledrivers}
                    />

                    <div className="text-sm text-gray-600">
                        <span>Available Drivers</span>{" "}
                        <span className="font-bold text-blue-500">{data.availableDrivers}</span>
                    </div>
                </div>

                {/* Ongoing Rides */}
                <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-md">
                    <img src={ongoing}
                    />
                    <div className="text-sm text-gray-600">
                        <span>On Going Rides</span>{" "}
                        <span className="font-bold text-blue-500">{data.ongoingRides}</span>
                    </div>
                </div>

                {/* City */}
                <div className="flex items-center space-x-2 bg-blue-50 border border-blue-200 px-4 py-2 rounded-md">
                    <img src={cities}
                    />
                    <div className="text-sm text-gray-600">
                        <span>City</span>{" "}
                        <span className="font-bold text-blue-500">1</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveDataComponent;
