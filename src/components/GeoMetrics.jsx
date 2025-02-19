import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, ZoomControl, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat/dist/leaflet-heat.js';
import axios from 'axios';
import './MapComponent.css';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';
import { SELLER_URL_LOCAL } from '@/lib/utils';

// Create axios instance with default config
const api = axios.create({
    baseURL: import.meta.env.VITE_SELLER_URL_LOCAL,
});

// Default icon configuration
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});


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
    const [selectedDate, setSelectedDate] = useState('');
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
            const response = await api.get('/dashboard/api/seller/ride-distribution');
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
            const response = await api.get('/dashboard/api/seller/cancelled-distribution');
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

    const fetchDateRides = useCallback(async (date) => {
        if (!date) return;

        try {
            setOptionLoading(true);
            const requestData = {
                date: formatDate(date),
                ...(startTime && { startTime }),
                ...(endTime && { endTime }),
                ...(varient !== 'ALL' && { varient }),
                ...(type !== 'all' && { type })
            };

            const response = await api.post('/dashboard/api/seller/start-ride-clustering', requestData);
            const clusters = response.data.map(cluster => ({
                center: [cluster.center.lat, cluster.center.lng],
                count: cluster.numRides,
            }));
            
            setCirclemapData(clusters);
            setAnalysis(`Ride clustering for ${formatDate(date)}`);
        } catch (error) {
            console.error('Error fetching ride data:', error);
            setAnalysis('Error fetching ride clustering data.');
        } finally {
            setOptionLoading(false);
        }
    }, [formatDate, startTime, endTime, varient, type]);

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
        }

        const handleOnlineDrivers = (response) => {
            if (response?.drivers) {
                const validDrivers = response.drivers.filter(
                    driver => driver?.driverLiveLocation
                );
                setDrivers(validDrivers);
                setAnalysis("This map shows the locations of all active drivers. Click on a marker for more information.");
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
        } else if (viewMode === 'ride24hrs' && selectedDate) {
            fetchDateRides(selectedDate);
        } else if (viewMode === 'drivers') {
            setOptionLoading(false);
        }
    }, [viewMode, rideType, selectedDate, fetchRideDistribution, fetchCancelledRideDistribution, fetchDateRides]);

    // Memoized circle event handlers
    const createCircleEventHandlers = useCallback((cluster) => ({
        mouseover: (e) => {
            const popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(`<b>Number of Rides:</b> ${cluster.count}`)
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
        <div className="geo-container">
            <div className="geo-sidebar">
                <h2 className="geo-sidebar-title">Map View Options</h2>
                <div className="select-container">
                    <select
                        id="viewMode"
                        value={viewMode}
                        onChange={(e) => setViewMode(e.target.value)}
                    >
                        <option value="">Select a view</option>
                        <option value="heatmap">Rides Heatmap</option>
                        <option value="drivers">All Drivers Location</option>
                        <option value="ride24hrs">Ride 24 Hrs</option>
                    </select>
                </div>

                {viewMode === 'heatmap' && (
                    <div className="select-container">
                        <select
                            id="rideType"
                            value={rideType}
                            onChange={(e) => setRideType(e.target.value)}
                        >
                            <option value="completed">Completed Rides</option>
                            <option value="cancelled">Cancelled Rides</option>
                        </select>
                    </div>
                )}

                {viewMode === 'ride24hrs' && (
                    <>
                        <div className="select-container">
                            <label>Select Date:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                            />
                        </div>
                        <div className="select-container">
                            <label>Start Time:</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div className="select-container">
                            <label>End Time:</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                        <div>
                            <button onClick={() => { setStartTime(''); setEndTime(''); }}>
                                Reset
                            </button>
                        </div>
                        <div className="select-container">
                            <label>Varient:</label>
                            <select
                                value={varient}
                                onChange={(e) => setVarient(e.target.value)}
                            >
                                <option value="ALL">ALL</option>
                                <option value="AUTO">AUTO</option>
                                <option value="CAB">CAB</option>
                                <option value="SEDAN">SEDAN</option>
                            </select>
                        </div>
                        <div className="select-container">
                            <label>Type:</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                            >
                                <option value="all">ALL</option>
                                <option value="start">START</option>
                                <option value="end">END</option>
                            </select>
                        </div>
                    </>
                )}

                <div className="analysis-section">
                    <h3>Analysis</h3>
                    <p>{analysis}</p>
                    {viewMode === 'heatmap' && <HeatmapLegend type={rideType} />}
                </div>
            </div>

            <div className="geo-map">
                {mapLoading || optionLoading ? (
                    <div className="loading-indicator">Loading...</div>
                ) : (
                    <MapContainer
                        style={{ height: '100vh', width: '100%' }}
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
                        
                        {viewMode === 'drivers' && drivers.map(driver => (
                            <Marker
                                key={driver.driverId}
                                position={[
                                    driver.driverLiveLocation.latitude,
                                    driver.driverLiveLocation.longitude,
                                ]}
                                icon={defaultIcon}
                            >
                                <Popup>
                                    <div>
                                        <strong>{driver.driverName}</strong>
                                        <br />
                                        Phone: {driver.phone}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                        
                        {viewMode === 'ride24hrs' && (
                            <>
                                {/* Render start circles if type is 'start' or 'all' */}
                                {circlemapData.map((cluster, index) => {
                                    if (type === 'start' || type === 'all') {
                                        return (
                                            <Circle
                                                key={`start-${index}`}
                                                center={[
                                                    cluster.center[0] + (index % 2 === 0 ? 0.0001 : -0.0001),
                                                    cluster.center[1]
                                                ]}
                                                radius={cluster.count * 50}
                                                color="blue"
                                                fillOpacity={0.5}
                                                eventHandlers={createCircleEventHandlers(cluster)}
                                            />
                                        );
                                    }
                                    return null;
                                })}

                                {/* Render end circles if type is 'end' or 'all' */}
                                {circlemapData.map((cluster, index) => {
                                    if (type === 'end' || type === 'all') {
                                        return (
                                            <Circle
                                                key={`end-${index}`}
                                                center={[
                                                    cluster.center[0] + (index % 2 === 0 ? -0.0001 : 0.0001),
                                                    cluster.center[1]
                                                ]}
                                                radius={cluster.count * 50}
                                                color="green"
                                                fillOpacity={0.5}
                                                eventHandlers={createCircleEventHandlers(cluster)}
                                            />
                                        );
                                    }
                                    return null;
                                })}
                            </>
                        )}
                    </MapContainer>
                )}
            </div>
        </div>
    );
};

export default GeoMetrics;