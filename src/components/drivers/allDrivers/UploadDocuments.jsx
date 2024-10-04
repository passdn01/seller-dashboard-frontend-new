// src/components/UploadDocuments.js

import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Label } from "@/components/ui/label"; // ShadCN label component
import { Input } from "@/components/ui/input"; // ShadCN input component
import { Button } from "@/components/ui/button"; // ShadCN button component

const UploadDocuments = ({ id }) => {
    const [drivingLicense, setDrivingLicense] = useState(null);
    const [registrationCertificate, setRegistrationCertificate] = useState(null);

    const handleDrivingLicenseChange = (e) => {
        setDrivingLicense(e.target.files[0]);
    };

    const handleRegistrationCertificateChange = (e) => {
        setRegistrationCertificate(e.target.files[0]);
    };

    const uploadDrivingLicense = async () => {
        if (!drivingLicense) {
            alert("Please select a Driving License file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', drivingLicense);

        try {
            const response = await axios.post(`https://f6vfh6rc-2003.inc1.devtunnels.ms/dashboard/api/${id}/edit-dl`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert(response.data.message); // Alert on success
        } catch (error) {
            console.error("Error uploading Driving License:", error);
            alert(error.response?.data?.message || "Error uploading Driving License"); // Alert on error
        } finally {
            // Reset the state after upload
            setDrivingLicense(null);
        }
    };

    const uploadRegistrationCertificate = async () => {
        if (!registrationCertificate) {
            alert("Please select a Registration Certificate file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', registrationCertificate);

        try {
            const response = await axios.post(`https://f6vfh6rc-2003.inc1.devtunnels.ms/dashboard/api/${id}/edit-rc`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert(response.data.message); // Alert on success
        } catch (error) {
            console.error("Error uploading Registration Certificate:", error);
            alert(error.response?.data?.message || "Error uploading Registration Certificate"); // Alert on error
        } finally {
            // Reset the state after upload
            setRegistrationCertificate(null);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Upload Documents</h2>
            
            <div className="space-y-4">
                <div className='flex items-center space-x-2'>
                    {/* <Label className="block" htmlFor="driving-license">Upload Driving License:</Label> */}
                    <Input
                        type="file"
                        id="driving-license"
                        onChange={handleDrivingLicenseChange}
                        accept="image/*"
                    />
                    <Button onClick={uploadDrivingLicense} className="">Upload Driving License</Button>
                </div>

                <div className='flex items-center space-x-2'>
                    {/* <Label className="block" htmlFor="registration-certificate">Upload Registration Certificate:</Label> */}
                    <Input
                        type="file"
                        id="registration-certificate"
                        onChange={handleRegistrationCertificateChange}
                        accept="image/*"
                    />
                    <Button onClick={uploadRegistrationCertificate} className="">Upload Registration Certificate</Button>
                </div>
            </div>
        </div>
    );
};

UploadDocuments.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default UploadDocuments;
