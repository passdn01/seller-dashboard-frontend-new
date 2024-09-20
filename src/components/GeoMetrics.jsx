import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat/dist/leaflet-heat.js';
import axios from 'axios';
import './MapComponent.css';
import PropTypes from 'prop-types';

// Custom HeatmapLayer Component
const HeatmapLayer = ({ data }) => {
    const map = useMap();

    useEffect(() => {
        if (data.length > 0) {
            const existingHeatmapLayer = map._layers
                ? Object.values(map._layers).find(layer => layer instanceof L.HeatLayer)
                : null;
            if (existingHeatmapLayer) {
                map.removeLayer(existingHeatmapLayer);
            }

            L.heatLayer(data, { radius: 20, blur: 35, maxZoom: 15 }).addTo(map);
        }
    }, [data, map]);

    return null;
};

// Default icon for markers
const defaultIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Add PropTypes validation
HeatmapLayer.propTypes = {
    data: PropTypes.arrayOf(PropTypes.array).isRequired // Validating that 'data' is an array of arrays
};

const GeoMetrics = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [viewMode, setViewMode] = useState(''); // State to control map view
    const [analysis, setAnalysis] = useState(''); // State to control analysis text

    // Fetch ride clusters for heatmap
    useEffect(() => {
        if (viewMode === 'heatmap') {
            axios.get('https://bhk8mp0s-2011.inc1.devtunnels.ms/dashboard/api/ride-distribution')
                .then(response => {
                    const data = response.data.map(cluster => [
                        cluster.center.lat,
                        cluster.center.lng,
                        cluster.numRides
                    ]);
                    setHeatmapData(data);
                    setAnalysis('This heatmap represents the distribution of completed rides. Areas with higher ride counts are shown in more intense colors.');
                })
                .catch(error => {
                    console.error('Error fetching ride distribution:', error);
                    setAnalysis('Error fetching ride distribution data.');
                });
        }
    }, [viewMode]);

    // Fetch driver locations
    useEffect(() => {
        if (viewMode === 'drivers') {
            axios.get('https://bhk8mp0s-2011.inc1.devtunnels.ms/online-drivers')
                .then(response => {
                    const drivers = response.data.drivers.map(driver => {
                        const latitude = parseFloat(driver.driverLiveLocation.latitude);
                        const longitude = parseFloat(driver.driverLiveLocation.longitude);
                        return {
                            ...driver,
                            driverLiveLocation: {
                                latitude: isNaN(latitude) ? 0 : latitude, // Fallback to 0 if invalid
                                longitude: isNaN(longitude) ? 0 : longitude
                            }
                        };
                    });
                    setDrivers(drivers);
                    setAnalysis('This map shows the locations of all active drivers. Click on a marker for more information.');
                })
                .catch(error => {
                    console.error('Error fetching driver locations:', error);
                    setAnalysis('Error fetching driver locations.');
                });
        }
    }, [viewMode]);

    return (
        <div className="geo-container">
            {/* Sidebar Section */}
            <div className="geo-sidebar">
                <h2 className="geo-sidebar-title">Map View Options</h2>
                <div className="select-container">
                    <label htmlFor="viewMode">Select a view:</label>
                    <select id="viewMode" value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                        <option value="">Select a view</option>
                        <option value="heatmap">Rides Heatmap</option>
                        <option value="drivers">All Drivers Location</option>
                    </select>
                </div>
                {/* Analysis based on the selected view */}
                <div className="analysis-section">
                    <h3>Analysis</h3>
                    <p>{analysis}</p>
                </div>
            </div>

            {/* Map Section */}
            <div className="geo-map">
                <MapContainer style={{ height: '100vh', width: '100%' }} center={[23.031129, 72.529016]} zoom={10} zoomControl={false}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='Map data © OpenStreetMap contributors'
                    />
                    <ZoomControl position="topright" />

                    {/* Conditionally render heatmap layer */}
                    {viewMode === 'heatmap' && <HeatmapLayer data={heatmapData} />}

                    {/* Conditionally render driver markers */}
                    {viewMode === 'drivers' && drivers.map(driver => (
                        <Marker
                            key={driver.driverId}
                            position={[driver.driverLiveLocation.latitude, driver.driverLiveLocation.longitude]}
                            icon={defaultIcon}
                        >
                            {/* Popup can show basic driver info if needed */}
                        </Marker>
                    ))}
                </MapContainer>
            </div>
        </div>
    );
};




export default GeoMetrics;
