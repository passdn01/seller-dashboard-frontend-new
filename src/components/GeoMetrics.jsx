import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, ZoomControl, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat/dist/leaflet-heat.js';
import axios from 'axios';
import { io } from 'socket.io-client';
import PropTypes from 'prop-types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { SELLER_URL_LOCAL } from '@/lib/utils';

// Import vehicle icons
import autoIcon from '@/assets/Vehicles/auto_icon.png';
import cabIcon from '@/assets/Vehicles/cab_icon.png';
import sedanIcon from '@/assets/Vehicles/cabelite_icon.png';

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_SELLER_URL_LOCAL,
});

// Custom vehicle icons
const vehicleIcons = {
    AUTO: new L.Icon({
        iconUrl: autoIcon,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    HATCHBACK: new L.Icon({
        iconUrl: cabIcon,
        iconSize: [24, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    SEDAN: new L.Icon({
        iconUrl: sedanIcon,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    }),
    DEFAULT: new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    })
};

// Function to get the appropriate icon based on category
const getVehicleIcon = (category) => {
    return vehicleIcons[category] || vehicleIcons.DEFAULT;
};

// Memoized HeatmapLayer Component
const HeatmapLayer = React.memo(({ data }) => {
    const map = useMap();

    useEffect(() => {
        if (!data?.length) return;

        const existingHeatmapLayer = Object.values(map._layers).find(
            layer => layer instanceof L.HeatLayer
        );

        if (existingHeatmapLayer) {
            map.removeLayer(existingHeatmapLayer);
        }

        const heatLayer = L.heatLayer(data, {
            radius: 20,
            blur: 35,
            maxZoom: 15,
            minOpacity: 0.4,
            gradient: {
                0.4: 'blue',
                0.6: 'cyan',
                0.8: 'lime',
                1.0: 'red'
            }
        });

        heatLayer.addTo(map);
        return () => map.removeLayer(heatLayer);
    }, [data, map]);

    return null;
});

HeatmapLayer.displayName = 'HeatmapLayer';

HeatmapLayer.propTypes = {
    data: PropTypes.arrayOf(PropTypes.array).isRequired,
};

// Memoized HeatmapLegend Component
const HeatmapLegend = React.memo(({ type }) => {
    const heatmapColors = useMemo(() =>
        type === 'completed'
            ? ['#4575b4', '#91bfdb', '#e0f3f8', '#fee090', '#fc8d59', '#d73027']
            : ['#313695', '#4575b4', '#74add1', '#fdae61', '#f46d43', '#a50026'],
        [type]
    );

    return (
        <div className="legend-box">
            <h4>{type === 'completed' ? 'Completed Rides Heatmap' : 'Cancelled Rides Heatmap'}</h4>
            <div className="legend-range">
                <div className="color-range">
                    {heatmapColors.map((color, index) => (
                        <div key={index} className="color-box" style={{ backgroundColor: color }}></div>
                    ))}
                </div>
                <div className="range-labels">
                    <span>Very Low</span>
                    <span>Moderate</span>
                    <span>Very High</span>
                </div>
            </div>
        </div>
    );
});

HeatmapLegend.displayName = 'HeatmapLegend';

HeatmapLegend.propTypes = {
    type: PropTypes.string.isRequired,
};

// Vehicle Legend Component
const VehicleLegend = () => {
    return (
        <div className="legend-box mt-4">
            <h4>Vehicle Types</h4>
            <div className="flex flex-col space-y-2 mt-2">
                <div className="flex items-center space-x-2">
                    <img src={autoIcon} alt="Auto" className="w-6 h-6" />
                    <span>Auto</span>
                </div>
                <div className="flex items-center space-x-2">
                    <img src={cabIcon} alt="Cab" className="w-6 h-6" />
                    <span>Cab</span>
                </div>
                <div className="flex items-center space-x-2">
                    <img src={sedanIcon} alt="Sedan" className="w-6 h-6" />
                    <span>Elite</span>
                </div>
            </div>
        </div>
    );
};

const GeoMetrics = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [circlemapData, setCirclemapData] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [viewMode, setViewMode] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [rideType, setRideType] = useState('completed');
    const [mapLoading, setMapLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [optionLoading, setOptionLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [varient, setVarient] = useState('ALL');
    const [type, setType] = useState('all');

    // Format date utility function
    const formatDate = useCallback((dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    }, []);

    // Memoized API calls
    const fetchRideDistribution = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get('/dashboard/api/seller/ride-distribution', { headers: { Authorization: `Bearer ${token}` } });
            const data = response.data.map(cluster => [
                cluster.center.lat,
                cluster.center.lng,
                cluster.numRides,
            ]);
            setHeatmapData(data);
            setAnalysis('This heatmap represents the distribution of completed rides. Areas with higher ride counts are shown in more intense colors.');
        } catch (error) {
            console.error('Error fetching ride distribution:', error);
            setAnalysis('Error fetching ride distribution data.');
        } finally {
            setOptionLoading(false);
        }
    }, []);

    const fetchCancelledRideDistribution = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            const response = await api.get('/dashboard/api/seller/cancelled-distribution', { headers: { Authorization: `Bearer ${token}` } });
            const data = response.data.map(cluster => [
                cluster.center.lat,
                cluster.center.lng,
                cluster.numRides,
            ]);
            setHeatmapData(data);
            setAnalysis('This heatmap represents the distribution of cancelled rides. Areas with higher cancellation counts are shown in more intense colors.');
        } catch (error) {
            console.error('Error fetching cancelled ride distribution:', error);
            setAnalysis('Error fetching ride distribution data.');
        } finally {
            setOptionLoading(false);
        }
    }, []);

    const fetchDateRides = useCallback(async () => {
        if (!startDate || !endDate) return;

        try {
            setOptionLoading(true);
            const requestData = {
                startDate: formatDate(startDate),
                endDate: formatDate(endDate || startDate), // Use startDate as endDate if endDate is not provided
                ...(startTime && { startTime }),
                ...(endTime && { endTime }),
                ...(varient !== 'ALL' && { varient }),
                ...(type !== 'all' && { type })
            };

            const token = localStorage.getItem("token");
            const response = await api.post('/dashboard/api/seller/start-ride-clustering', requestData, { headers: { Authorization: `Bearer ${token}` } });

            // Process the response to separate start and end clusters
            const clusters = response.data.map(cluster => ({
                center: [cluster.center.lat, cluster.center.lng],
                count: cluster.numRides,
                type: cluster.type // 'start' or 'end'
            }));

            setCirclemapData(clusters);

            const dateRange = startDate === endDate || !endDate
                ? `on ${formatDate(startDate)}`
                : `from ${formatDate(startDate)} to ${formatDate(endDate)}`;

            setAnalysis(`Ride clustering ${dateRange}`);
        } catch (error) {
            console.error('Error fetching ride data:', error);
            setAnalysis('Error fetching ride clustering data.');
        } finally {
            setOptionLoading(false);
        }
    }, [formatDate, startDate, endDate, startTime, endTime, varient, type]);

    // Auto-set endDate to match startDate when startDate changes
    useEffect(() => {
        if (startDate && !endDate) {
            setEndDate(startDate);
        }
    }, [startDate]);

    // Socket connection effect
    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_SELLER_URL_LOCAL, {
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            reconnectionAttempts: 5
        });

        setSocket(newSocket);

        if (viewMode === "drivers") {
            newSocket.emit("getOnlineDrivers");
            
            // Set default filter to ALL when first loading drivers view
            setVarient('ALL');
        }

        const handleOnlineDrivers = (response) => {
            if (response?.drivers) {
                const validDrivers = response.drivers.filter(
                    driver => driver?.driverLiveLocation
                );
                setDrivers(validDrivers);
                const autoCount = validDrivers.filter(d => d.category === 'AUTO').length;
                const cabCount = validDrivers.filter(d => d.category === 'HATCHBACK').length;
                const eliteCount = validDrivers.filter(d => d.category === 'SEDAN').length;
                
                setAnalysis(`This map shows the locations of active drivers (${validDrivers.length} total). Distribution: ${autoCount} Auto, ${cabCount} Cab, ${eliteCount} Elite. Click on a marker for more information.`);
                // console.log("Drivers received:", validDrivers);
            }
        };

        const handleError = (error) => {
            console.error("WebSocket error:", error);
            setAnalysis("Error fetching driver locations.");
        };

        newSocket.on("onlineDrivers", handleOnlineDrivers);
        newSocket.on("error", handleError);

        return () => {
            newSocket.off("onlineDrivers", handleOnlineDrivers);
            newSocket.off("error", handleError);
            newSocket.close();
        };
    }, [viewMode]);

    // Loading timer effect
    useEffect(() => {
        const timer = setTimeout(() => setMapLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    // Data fetching effect
    useEffect(() => {
        if (!viewMode) return;

        setOptionLoading(true);

        if (viewMode === 'heatmap') {
            if (rideType === 'completed') {
                fetchRideDistribution();
            } else {
                fetchCancelledRideDistribution();
            }
        } else if (viewMode === 'ride24hrs' && startDate) {
            fetchDateRides();
        } else if (viewMode === 'drivers') {
            // When drivers view is selected or vehicle filter changes, update the analysis text
            if (drivers.length > 0) {
                const filteredDrivers = varient === 'ALL' 
                    ? drivers 
                    : drivers.filter(d => d.category === varient);
                
                const autoCount = drivers.filter(d => d.category === 'AUTO').length;
                const cabCount = drivers.filter(d => d.category === 'HATCHBACK').length;
                const eliteCount = drivers.filter(d => d.category === 'SEDAN').length;
                
                if (varient === 'ALL') {
                    setAnalysis(`This map shows the locations of active drivers (${drivers.length} total). Distribution: ${autoCount} Auto, ${cabCount} Cab, ${eliteCount} Elite. Click on a marker for more information.`);
                } else {
                    const typeLabel = varient === 'AUTO' ? 'Auto' : varient === 'HATCHBACK' ? 'Cab' : 'Elite';
                    setAnalysis(`Showing ${filteredDrivers.length} ${typeLabel} drivers out of ${drivers.length} total drivers.`);
                }
            }
            setOptionLoading(false);
        }
    }, [viewMode, rideType, startDate, endDate, varient, drivers, fetchRideDistribution, fetchCancelledRideDistribution, fetchDateRides]);

    // Reset function for form fields
    const resetFields = () => {
        setStartTime('');
        setEndTime('');
        setEndDate(startDate); // Reset endDate to match startDate
    };

    // Memoized circle event handlers
    const createCircleEventHandlers = useCallback((cluster) => ({
        mouseover: (e) => {
            const popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(`<b>Number of Rides:</b> ${cluster.count}<br><b>Type:</b> ${cluster.type === 'start' ? 'Start Point' : 'End Point'}`)
                .openOn(e.target._map);
            e.target._popup = popup;
        },
        mouseout: (e) => {
            if (e.target._popup) {
                e.target._map.closePopup(e.target._popup);
            }
        },
    }), []);

    return (
        <div className="flex h-screen">
            <div className="flex-1 relative">
                {(mapLoading || optionLoading) ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-white/80">
                        <div className="flex items-center space-x-2">
                            <Loader2 className="h-6 w-6 animate-spin" />
                            <span>Loading map data...</span>
                        </div>
                    </div>
                ) : (
                    <MapContainer
                        className="h-screen w-full"
                        center={[23.031129, 72.529016]}
                        zoom={10}
                        zoomControl={false}
                        preferCanvas={true}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="Map data © OpenStreetMap contributors"
                        />
                        <ZoomControl position="topright" />

                        {viewMode === 'heatmap' && <HeatmapLayer data={heatmapData} />}

                        {viewMode === 'drivers' && drivers
                            .filter(driver => varient === 'ALL' || driver.category === varient)
                            .map(driver => (
                                <Marker
                                    key={driver.driverId}
                                    position={[
                                        driver.driverLiveLocation.latitude,
                                        driver.driverLiveLocation.longitude,
                                    ]}
                                    icon={getVehicleIcon(driver.category)}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <p className="font-semibold">{driver.driverName}</p>
                                            <p className="text-sm">Phone: {driver.phone}</p>
                                            <p className="text-sm">Vehicle Type: {
                                                driver.category === 'AUTO' ? 'Auto' : 
                                                driver.category === 'HATCHBACK' ? 'Cab' : 
                                                driver.category === 'SEDAN' ? 'Elite' : 'Unknown'
                                            }</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}

                        {viewMode === 'ride24hrs' && circlemapData.map((cluster, index) => {
                            const color = cluster.type === 'start' ? '#3b82f6' : '#22c55e';
                            if (type === 'all' || type === cluster.type) {
                                return (
                                    <Circle
                                        key={`${cluster.type}-${index}`}
                                        center={cluster.center}
                                        radius={cluster.count * 50}
                                        color={color}
                                        fillOpacity={0.5}
                                        eventHandlers={createCircleEventHandlers(cluster)}
                                    />
                                );
                            }
                            return null;
                        })}
                    </MapContainer>
                )}
            </div>

            <Card className="w-80 h-screen rounded-none flex flex-col border-r">
                <CardHeader className="bg-background border-b">
                    <CardTitle>Map View Options</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label>View Mode</Label>
                            <Select value={viewMode} onValueChange={setViewMode}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a view" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="heatmap">Rides Heatmap</SelectItem>
                                    <SelectItem value="drivers">All Drivers Location</SelectItem>
                                    <SelectItem value="ride24hrs">Ride 24 Hrs</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {viewMode === 'heatmap' && (
                            <div>
                                <Label>Ride Type</Label>
                                <Select value={rideType} onValueChange={setRideType}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="completed">Completed Rides</SelectItem>
                                        <SelectItem value="cancelled">Cancelled Rides</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {viewMode === 'drivers' && (
                            <div>
                                <Label>Vehicle Type</Label>
                                <Select value={varient} onValueChange={setVarient}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All</SelectItem>
                                        <SelectItem value="AUTO">Auto</SelectItem>
                                        <SelectItem value="HATCHBACK">Cab</SelectItem>
                                        <SelectItem value="SEDAN">Elite</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {viewMode === 'ride24hrs' && (
                            <div className="space-y-4">
                                <div>
                                    <Label className="mb-2 block">Date Range</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full text-sm"
                                                placeholder="Start Date"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full text-sm"
                                                placeholder="End Date"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-2 block">Time Range</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <Input
                                                type="time"
                                                value={startTime}
                                                onChange={(e) => setStartTime(e.target.value)}
                                                className="w-full text-sm"
                                                placeholder="Start Time"
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                type="time"
                                                value={endTime}
                                                onChange={(e) => setEndTime(e.target.value)}
                                                className="w-full text-sm"
                                                placeholder="End Time"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Button
                                    variant="outline"
                                    onClick={resetFields}
                                    className="w-full border border-gray-200"
                                >
                                    Reset Fields
                                </Button>

                                <div>
                                    <Label>Variant</Label>
                                    <Select value={varient} onValueChange={setVarient}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ALL">All</SelectItem>
                                            <SelectItem value="AUTO">Auto</SelectItem>
                                            <SelectItem value="HATCHBACK">Cab</SelectItem>
                                            <SelectItem value="SEDAN">Elite</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div>
                                    <Label>Type</Label>
                                    <Select value={type} onValueChange={setType}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All</SelectItem>
                                            <SelectItem value="start">Start</SelectItem>
                                            <SelectItem value="end">End</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold">Analysis</h3>
                        <p className="text-sm text-gray-600">{analysis}</p>
                        {viewMode === 'heatmap' && <HeatmapLegend type={rideType} />}
                        {viewMode === 'drivers' && (
                            <>
                                <div className="bg-blue-200 p-3 rounded-md mt-2 mb-3">
                                    <div className="flex-1 justify-between items-center">
                                        <h4 className="text-lg font-medium">Driver Count</h4>
                                        <span className="text-xl font-bold">{
                                            varient === 'ALL' 
                                                ? drivers.length 
                                                : drivers.filter(d => d.category === varient).length
                                        }</span>
                                    </div>
                                </div>
                                <VehicleLegend />
                            </>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default GeoMetrics;