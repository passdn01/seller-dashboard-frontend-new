import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl, Marker, useMap } from 'react-leaflet';
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

// Heatmap Legend for the Analysis Section
const HeatmapLegend = ({ type }) => {
    const heatmapColors = type === 'completed'
        ? ['#4575b4', '#91bfdb', '#e0f3f8', '#fee090', '#fc8d59', '#d73027']
        : ['#313695', '#4575b4', '#74add1', '#fdae61', '#f46d43', '#a50026'];

    return (
        <div className="legend-box">
            <h4>{type === 'completed' ? 'Completed Rides Heatmap' : 'Cancelled Rides Heatmap'}</h4>
            {/* Container for the continuous color bar */}
            <div className="legend-range">
                {/* Display all the colors connected */}
                <div className="color-range">
                    {heatmapColors.map((color, index) => (
                        <div key={index} className="color-box" style={{ backgroundColor: color }}></div>
                    ))}
                </div>
                {/* Labels for the range */}
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

// Add PropTypes validation
HeatmapLayer.propTypes = {
    data: PropTypes.arrayOf(PropTypes.array).isRequired // Validating that 'data' is an array of arrays
};

const GeoMetrics = () => {
    const [heatmapData, setHeatmapData] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [viewMode, setViewMode] = useState(''); // State to control map view
    const [analysis, setAnalysis] = useState(''); // State to control analysis text
    const [rideType, setRideType] = useState('completed'); // State to control ride type selection
    const [mapLoading, setMapLoading] = useState(true); // Loading state for the map
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Simulate loading for the map
        const timer = setTimeout(() => {
            setMapLoading(false); // Set loading to false after 1 second (or adjust as needed)
        }, 1000);

        return () => clearTimeout(timer); // Clear timeout on unmount
    }, []);

    const fetchRideDistribution = () => {
        axios.get('https://55kqzrxn-2003.inc1.devtunnels.ms/dashboard/api/ride-distribution')
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
    };

    const fetchCancelledRideDistribution = () => {
        axios.get('https://55kqzrxn-2003.inc1.devtunnels.ms/dashboard/api/cancelled-ride-distribution')
            .then(response => {
                const data = response.data.map(cluster => [
                    cluster.center.lat,
                    cluster.center.lng,
                    cluster.numRides
                ]);
                setHeatmapData(data);
                setAnalysis('This heatmap represents the distribution of cancelled rides. Areas with higher ride counts are shown in more intense colors.');
            })
            .catch(error => {
                console.error('Error fetching ride distribution:', error);
                setAnalysis('Error fetching ride distribution data.');
            });
    };


    useEffect(() => {
      // Establish WebSocket connection
      const newSocket = io('https://55kqzrxn-2003.inc1.devtunnels.ms'); // Replace with your WebSocket server URL
      setSocket(newSocket);
  
      // Fetch driver locations if in 'drivers' view mode
      if (viewMode === 'drivers') {
        newSocket.emit('getOnlineDrivers'); // Request online drivers
      }
  
      // Listen for driver data
      newSocket.on('onlineDrivers', (response) => {
        if (response && response.drivers) {
          const allDrivers = response.drivers.flat(); // Flatten nested arrays if any
          const validDrivers = allDrivers
            .filter(driver => driver && driver.driverLiveLocation) // Ensure driver and location exist
            .map(driver => {
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
          setDrivers(validDrivers);
          setAnalysis('This map shows the locations of all active drivers. Click on a marker for more information.');
        }
      });
  
      newSocket.on('error', (error) => {
        console.error('Error fetching driver locations:', error);
        setAnalysis('Error fetching driver locations.');
      });
  
      // Cleanup WebSocket connection on unmount
      return () => newSocket.close();
    }, [viewMode]);
  
    // Refresh data every 2 seconds
    useEffect(() => {
      const interval = setInterval(() => {
        if (viewMode === 'heatmap') {
          if (rideType === 'completed') {
            fetchRideDistribution(); // You might need to implement WebSocket-based heatmap fetching as well
          } else {
            fetchCancelledRideDistribution();
          }
        } else if (viewMode === 'drivers') {
          if (socket) {
            socket.emit('getOnlineDrivers'); // Request updated driver locations
          }
        }
      }, 2000);
  
      return () => clearInterval(interval); // Clear interval on unmount
    }, [viewMode, rideType, socket]);

    return (
        <div className="geo-container">
            {/* Sidebar Section */}
            <div className="geo-sidebar">
                <h2 className="geo-sidebar-title">Map View Options</h2>
                <div className="select-container">
                    <select id="viewMode" value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                        <option value="">Select a view</option>
                        <option value="heatmap">Rides Heatmap</option>
                        <option value="drivers">All Drivers Location</option>
                    </select>
                </div>

                {/* Conditionally show ride type selector when heatmap is selected */}
                {viewMode === 'heatmap' && (
                    <div className="select-container">
                        <select id="rideType" value={rideType} onChange={(e) => setRideType(e.target.value)}>
                            <option value="completed">Completed Rides</option>
                            <option value="cancelled">Cancelled Rides</option>
                        </select>
                    </div>
                )}

                {/* Analysis and Heatmap Legend based on the selected view */}
                <div className="analysis-section">
                    <h3>Analysis</h3>
                    <p>{analysis}</p>
                    {viewMode === 'heatmap' && <HeatmapLegend type={rideType} />}
                </div>
            </div>

            {/* Map Section */}
            <div className="geo-map">
                {mapLoading ? (
                    <div className="loading-indicator">Loading Map...</div>
                ) : (
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
                            />
                        ))}
                    </MapContainer>
                )}
            </div>
        </div>
    );
};

export default GeoMetrics;
