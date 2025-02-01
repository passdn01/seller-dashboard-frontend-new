import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl, Marker, Popup, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat/dist/leaflet-heat.js';
import axios from 'axios';
import './MapComponent.css';
import PropTypes from 'prop-types';
import { io } from 'socket.io-client';

// Custom HeatmapLayer Component
const HeatmapLayer = ({ data }) => {
    const map = useMap();

    useEffect(() => {
        if (data.length > 0) {
            const existingHeatmapLayer = Object.values(map._layers).find(layer => layer instanceof L.HeatLayer);
            if (existingHeatmapLayer) {
                map.removeLayer(existingHeatmapLayer);
            }

            L.heatLayer(data, { radius: 20, blur: 35, maxZoom: 15 }).addTo(map);
        }
    }, [data, map]);

    return null;
};

HeatmapLayer.propTypes = {
    data: PropTypes.arrayOf(PropTypes.array).isRequired,
};

// Default icon for markers
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

// Heatmap Legend for the Analysis Section
const HeatmapLegend = ({ type }) => {
    const heatmapColors = type === 'completed'
        ? ['#4575b4', '#91bfdb', '#e0f3f8', '#fee090', '#fc8d59', '#d73027']
        : ['#313695', '#4575b4', '#74add1', '#fdae61', '#f46d43', '#a50026'];

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
};

HeatmapLegend.propTypes = {
    type: PropTypes.string.isRequired,
};



const GeoMetrics = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [viewMode, setViewMode] = useState('');
    const [analysis, setAnalysis] = useState('');
    const [rideType, setRideType] = useState('completed');
    const [mapLoading, setMapLoading] = useState(true);
    const [socket, setSocket] = useState(null);
    const [optionLoading, setOptionLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState('');

    useEffect(() => {
        const timer = setTimeout(() => setMapLoading(false), 1000);
        return () => clearTimeout(timer);
    }, []);

    const fetchRideDistribution = async () => {
        try {
            const response = await axios.get('https://adminsellerbackend-1.onrender.com/dashboard/api/ride-distribution');
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
    };

    const fetchCancelledRideDistribution = async () => {
        try {
            const response = await axios.get('https://adminsellerbackend-1.onrender.com/dashboard/api/cancelled-distribution');
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
    };

    // Function to format date as DD-MM-YYYY
    const formatDate = (dateString) => {
        const [year, month, day] = dateString.split('-');
        return `${day}-${month}-${year}`;
    };

    const fetchDateRides = async (date) => {
        try {
            setOptionLoading(true);
            const formattedDate = formatDate(date); // Convert date to DD-MM-YYYY format
            const response = await axios.post('http://localhost:5000/dashboard/api/start-ride-clustering', { date: formattedDate });
            const clusters = response.data.map(cluster => ({
                center: [cluster.center.lat, cluster.center.lng],
                count: cluster.numRides,
            }));
            setHeatmapData(clusters);
            setAnalysis(`Ride clustering for ${formattedDate}`);
        } catch (error) {
            console.error('Error fetching ride data:', error);
            setAnalysis('Error fetching ride clustering data.');
        } finally {
            setOptionLoading(false);
        }
    };

    useEffect(() => {
        if (viewMode === 'ride24hrs' && selectedDate) {
            fetchDateRides(selectedDate);
        }
    }, [viewMode, selectedDate]);

    useEffect(() => {
        const newSocket = io('https://adminsellerbackend-1.onrender.com/');
        setSocket(newSocket);

        // Emit "getOnlineDrivers" to fetch the list of drivers when in "drivers" view
        if (viewMode === "drivers") {
            newSocket.emit("getOnlineDrivers");
        }

        newSocket.on("onlineDrivers", (response) => {
            if (response?.drivers) {
                const validDrivers = response.drivers.filter(driver => driver?.driverLiveLocation);
                setDrivers(validDrivers);
                setAnalysis("This map shows the locations of all active drivers. Click on a marker for more information.");
            }
        });

        newSocket.on("error", (error) => {
            console.error("WebSocket error:", error);
            setAnalysis("Error fetching driver locations.");
        });

        return () => newSocket.close();
    }, [viewMode]);
;

    useEffect(() => {
        if (viewMode === 'heatmap') {
            setOptionLoading(true);
            if (rideType === 'completed') {
                fetchRideDistribution();
            } else {
                fetchCancelledRideDistribution();
            }
        } else if (viewMode === 'drivers') {
            setOptionLoading(false);
        }
    }, [viewMode, rideType]);

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

                {/* Show date input field when "Ride by Date" is selected */}
                {viewMode === 'ride24hrs' && (
                    <div className="select-container">
                        <label>Select Date:</label>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                        />
                    </div>
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
                        {viewMode === 'ride24hrs' && heatmapData.map((cluster, index) => (
                            <Circle
                                key={index}
                                center={cluster.center}
                                radius={cluster.count * 50}
                                color="blue"
                                fillOpacity={0.5}
                                eventHandlers={{
                                    mouseover: (e) => {
                                        const popupContent = `<b>Number of Rides:</b> ${cluster.count}`;
                                        L.popup()
                                            .setLatLng(e.latlng)
                                            .setContent(popupContent)
                                            .openOn(e.target._map);
                                    },
                                    mouseout: () => {
                                        e.target._map.closePopup();
                                    }
                                }}
                            />
                        ))}

                    </MapContainer>
                )}
            </div>
        </div>
    );
};

export default GeoMetrics;
