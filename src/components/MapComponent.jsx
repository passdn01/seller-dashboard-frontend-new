import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import './MapComponent.css';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS

// Default icon for markers
const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const mapContainerStyle = {
  height: '100%',
  width: '100%',
};

const center = {
  lat: 23.031129,
  lng: 72.529016,
};

const MapComponent = ({ selectedDriver, onDriverSelect }) => {
  const [drivers, setDrivers] = useState([]);
  //   const [driverAddress, setDriverAddress] = useState('');

  // Fetch online drivers
  useEffect(() => {
    axios
      .get('https://55kqzrxn-2003.inc1.devtunnels.ms/dashboard/api/online-drivers')
      .then((response) => {
        const drivers = response.data.drivers.map((driver) => ({
          ...driver,
          driverLiveLocation: {
            latitude: parseFloat(driver.driverLiveLocation.latitude),
            longitude: parseFloat(driver.driverLiveLocation.longitude),
          },
        }));
        setDrivers(drivers);
      })
      .catch((error) => {
        console.error('Error fetching driver locations:', error);
      });
  }, []);


  return (
    <div className="map-container">
      <div className="map">
        <MapContainer
          style={mapContainerStyle}
          center={[center.lat, center.lng]}
          zoom={12}
          scrollWheelZoom={false}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
          />

          {drivers.map((driver) => {
            const { latitude, longitude } = driver.driverLiveLocation;

            // Check if lat/lng are valid
            const isValidLatLng = !isNaN(latitude) && !isNaN(longitude);

            return (
              <Marker
                key={driver.driverId}
                position={isValidLatLng ? [latitude, longitude] : [center.lat, center.lng]} // Fallback to center if lat/lng are NaN
                icon={defaultIcon}
                eventHandlers={{
                  click: () => {
                    onDriverSelect(driver);
                  },
                }}
              >
                <Popup>
                  <div>
                    <h4>{driver.driverName}</h4>
                    <p>
                      <strong>Phone:</strong> {driver.phone}
                    </p>
                    <p>
                      <strong>Latitude:</strong> {isValidLatLng ? latitude : 'N/A'}
                    </p>
                    <p>
                      <strong>Longitude:</strong> {isValidLatLng ? longitude : 'N/A'}
                    </p>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

      </div>

      <div className="driver-details">
        {selectedDriver ? (
          <>
            <h2>Driver Details</h2>
            <p>
              <strong>Name:</strong> {selectedDriver.driverName}
            </p>
            <p>
              <strong>Phone:</strong> {selectedDriver.phone}
            </p>
            <p>
              <strong>Latitude:</strong> {selectedDriver.driverLiveLocation.latitude}
            </p>
            <p>
              <strong>Longitude:</strong> {selectedDriver.driverLiveLocation.longitude}
            </p>
            <p>
              {/* <strong>Address:</strong> {driverAddress} */}
            </p>
            {selectedDriver.drivingLicense && (
              <div>
                <p>
                  <strong>Driving License:</strong>
                </p>
                <img
                  src={selectedDriver.drivingLicense}
                  alt="Driving License"
                  style={{ width: '100px', height: 'auto' }}
                />
              </div>
            )}
          </>
        ) : (
          <p>Select a driver to see details</p>
        )}
      </div>
    </div>
  );
};

// Add prop types validation
MapComponent.propTypes = {
  selectedDriver: PropTypes.shape({
    driverName: PropTypes.string,
    phone: PropTypes.string,
    driverLiveLocation: PropTypes.shape({
      latitude: PropTypes.number,
      longitude: PropTypes.number,
    }),
    drivingLicense: PropTypes.string,
  }),
  onDriverSelect: PropTypes.func.isRequired,
};

export default MapComponent;
