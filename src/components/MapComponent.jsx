import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';  // Import PropTypes
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import axios from 'axios';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import './MapComponent.css';

const mapContainerStyle = {
    height: '100%',
    width: '100%'
};

const center = {
    lat: 23.031129,
    lng: 72.529016
};

const MapComponent = ({ selectedDriver, onDriverSelect }) => {
    const [drivers, setDrivers] = useState([]);
    const [driverAddress, setDriverAddress] = useState('');
    const [infoWindowPosition, setInfoWindowPosition] = useState(null);

    // Fetch online drivers
    useEffect(() => {
        axios.get('https://55kqzrxn-2011.inc1.devtunnels.ms/online-drivers')
            .then(response => {
                const drivers = response.data.drivers.map(driver => ({
                    ...driver,
                    driverLiveLocation: {
                        latitude: parseFloat(driver.driverLiveLocation.latitude),
                        longitude: parseFloat(driver.driverLiveLocation.longitude)
                    }
                }));
                setDrivers(drivers);
            })
            .catch(error => {
                console.error('Error fetching driver locations:', error);
            });
    }, []);

    // Fetch driver's address based on selected driver's location
    useEffect(() => {
        if (selectedDriver) {
            const { latitude, longitude } = selectedDriver.driverLiveLocation;

            if (isNaN(latitude) || isNaN(longitude)) {
                console.error('Invalid latitude or longitude values');
                return;
            }

            axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY}`)
                .then(response => {
                    const results = response.data.results;
                    if (results && results.length > 0) {
                        setDriverAddress(results[0].formatted_address);
                    } else {
                        setDriverAddress('Address not found');
                    }
                })
                .catch(error => {
                    console.error('Error fetching address:', error);
                    setDriverAddress('Error fetching address');
                });

            setInfoWindowPosition({ lat: latitude, lng: longitude });
        }
    }, [selectedDriver]);

    return (
        <div className="flex h-screen w-full mt-2 overflow-hidden gap-2">
            <div className="map">
                <LoadScript googleMapsApiKey={import.meta.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={center}
                        zoom={12}
                        onLoad={(map) => {
                            // Create markers for clustering
                            const markers = drivers.map(driver => new window.google.maps.Marker({
                                position: {
                                    lat: driver.driverLiveLocation.latitude,
                                    lng: driver.driverLiveLocation.longitude
                                },
                                title: driver.driverName
                            }));
                            new MarkerClusterer({ map, markers });
                        }}
                    >
                        {drivers.map(driver => (
                            <Marker
                                key={driver.driverId}
                                position={{
                                    lat: driver.driverLiveLocation.latitude,
                                    lng: driver.driverLiveLocation.longitude
                                }}
                                onClick={() => onDriverSelect(driver)}
                            />
                        ))}

                        {infoWindowPosition && selectedDriver && (
                            <InfoWindow
                                position={infoWindowPosition}
                                onCloseClick={() => setInfoWindowPosition(null)}
                            >
                                <div>
                                    <h4>{selectedDriver.driverName}</h4>
                                    <p><strong>Phone:</strong> {selectedDriver.phone}</p>
                                    <p><strong>Latitude:</strong> {selectedDriver.driverLiveLocation.latitude}</p>
                                    <p><strong>Longitude:</strong> {selectedDriver.driverLiveLocation.longitude}</p>
                                    <p><strong>Address:</strong> {driverAddress}</p>
                                    {selectedDriver.drivingLicense && (
                                        <div>
                                            <p><strong>Driving License:</strong></p>
                                            <img
                                                src={selectedDriver.drivingLicense}
                                                alt="Driving License"
                                                style={{ width: '100px', height: 'auto' }}
                                            />
                                        </div>
                                    )}
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                </LoadScript>
            </div>

            <div className="driver-details">
                {selectedDriver ? (
                    <>
                        <h2>Driver Details</h2>
                        <p><strong>Name:</strong> {selectedDriver.driverName}</p>
                        <p><strong>Phone:</strong> {selectedDriver.phone}</p>
                        <p><strong>Latitude:</strong> {selectedDriver.driverLiveLocation.latitude}</p>
                        <p><strong>Longitude:</strong> {selectedDriver.driverLiveLocation.longitude}</p>
                        <p><strong>Address:</strong> {driverAddress}</p>
                        {selectedDriver.drivingLicense && (
                            <div>
                                <p><strong>Driving License:</strong></p>
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
            longitude: PropTypes.number
        }),
        drivingLicense: PropTypes.string,
    }),
    onDriverSelect: PropTypes.func.isRequired,
};

export default MapComponent;
