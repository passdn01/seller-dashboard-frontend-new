// src/components/UploadDocuments.js

import { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Label } from "@/components/ui/label"; // ShadCN label component
import { Input } from "@/components/ui/input"; // ShadCN input component
import { Button } from "@/components/ui/button"; // ShadCN button component
import { SELLER_URL_LOCAL } from '@/lib/utils';

const UploadDocuments = ({ id }) => {
    const [profileUrl, setProfileUrl] = useState(null);
    const [drivingLicense, setDrivingLicense] = useState(null);
    const [drivingLicenseBack, setDrivingLicenseBack] = useState(null);
    const [registrationCertificate, setRegistrationCertificate] = useState(null);
    const [RCBack, setRCBack] = useState(null)
    const [aadharCard, setAadharCard] = useState(null)
    const [aadharCardBack, setAadharCardBack] = useState(null)


    const handleAadharCardChange = (e) => {
        setAadharCard(e.target.files[0]);
    };


    const handleAadharCardBackChange = (e) => {
        setAadharCardBack(e.target.files[0]);
    };

    const handleProfileImageChange = (e) => {
        setProfileUrl(e.target.files[0]);
    };

    const handleDrivingLicenseChange = (e) => {
        setDrivingLicense(e.target.files[0]);
    };

    const handleDrivingLicenseBackChange = (e) => {
        setDrivingLicenseBack(e.target.files[0]);
    };

    const handleRegistrationCertificateChange = (e) => {
        setRegistrationCertificate(e.target.files[0]);
    };
    const handleRCbackChange = (e) => {
        setRCBack(e.target.files[0])
    }
    const uploadProfileImage = async () => {
        if (!profileUrl) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', profileUrl); // Attach the file

        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(
                `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driver/${id}/profile-image`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    },
                }
            );

            alert(response.data.message); // Alert on success
        } catch (error) {
            console.error("Error uploading Profile Image:", error);
            alert(error.response?.data?.message || "Error uploading Profile Image"); // Alert on error
        } finally {
            // Reset the state after upload
            setProfileUrl(null);
        }
    };


    const uploadDrivingLicense = async () => {
        if (!drivingLicense) {
            alert("Please select a Driving License file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', drivingLicense);

        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driver/${id}/edit-dl`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    "Authorization": `Bearer ${token}`
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

    const uploadDrivingLicenseBack = async () => {
        if (!drivingLicenseBack) {
            alert("Please select a Driving License Back file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', drivingLicenseBack);

        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driver/${id}/edit-dl-back`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });
            alert(response.data.message); // Alert on success
        } catch (error) {
            console.error("Error uploading Driving License Back:", error);
            alert(error.response?.data?.message || "Error uploading Driving License Back"); // Alert on error
        } finally {
            // Reset the state after upload
            setDrivingLicenseBack(null);
        }
    };

    const uploadRCBack = async () => {
        if (!RCBack) {
            alert("Please select a RC Back file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', RCBack);

        try {
            const token = localStorage.getItem('token')
            const response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driver/${id}/edit-rc-back`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });
            alert(response.data.message); // Alert on success
        } catch (error) {
            console.error("Error uploading RC Back:", error);
            alert(error.response?.data?.message || "Error uploading RC Back"); // Alert on error
        } finally {
            // Reset the state after upload
            setRCBack(null);
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
            const token = localStorage.getItem('token')
            const response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driver/${id}/edit-rc`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
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

    const uploadAadharCard = async () => {
        if (!aadharCard) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', aadharCard);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driver/${id}/edit-aadhar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                },
            });
            alert(response.data.message);
        } catch (error) {
            console.error("Error uploading Aadhar:", error);
            alert(error.response?.data?.message || "Error uploading Aadhar");
        } finally {

            setAadharCard(null);
        }
    };

    const uploadAadharCardBack = async () => {
        if (!aadharCardBack) {
            alert("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('file', aadharCardBack);

        try {
            const token = localStorage.getItem("token");
            const response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driver/${id}/edit-aadhar-back`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                },
            });
            alert(response.data.message);
        } catch (error) {
            console.error("Error uploading Aadhar Back:", error);
            alert(error.response?.data?.message || "Error uploading Aadhar Back:");
        } finally {

            setAadharCardBack(null);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Upload Documents</h2>

            <div className="grid grid-cols-2 gap-4">
                <div className='flex items-center space-x-2'>
                    {/* <Label className="block" htmlFor="driving-license">Upload Driving License:</Label> */}
                    <Input
                        type="file"
                        id="profile-image"
                        onChange={handleProfileImageChange}
                        accept="image/*"
                    />
                    <Button onClick={uploadProfileImage} className="">Upload Profile Image</Button>
                </div>
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
                    {/* <Label className="block" htmlFor="driving-license">Upload Driving License:</Label> */}
                    <Input
                        type="file"
                        id="driving-license-back"
                        onChange={handleDrivingLicenseBackChange}
                        accept="image/*"
                    />
                    <Button onClick={uploadDrivingLicenseBack} className="">Upload Driving License Back</Button>
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
                <div className='flex items-center space-x-2'>
                    {/* <Label className="block" htmlFor="registration-certificate">Upload Registration Certificate:</Label> */}
                    <Input
                        type="file"
                        id="registration-certificate-back"
                        onChange={handleRCbackChange}
                        accept="image/*"
                    />
                    <Button onClick={uploadRCBack} className="">Upload RC Back</Button>
                </div>
                <div className='flex items-center space-x-2'>
                    {/* <Label className="block" htmlFor="registration-certificate">Upload Registration Certificate:</Label> */}
                    <Input
                        type="file"
                        id="aadhar-card"
                        onChange={handleAadharCardChange}
                        accept="image/*"
                    />
                    <Button onClick={uploadAadharCard} className="">Upload Aadhar Card</Button>
                </div>
                <div className='flex items-center space-x-2'>
                    {/* <Label className="block" htmlFor="registration-certificate">Upload Registration Certificate:</Label> */}
                    <Input
                        type="file"
                        id="registration-certificate-back"
                        onChange={handleAadharCardBackChange}
                        accept="image/*"
                    />
                    <Button onClick={uploadAadharCardBack} className="">Upload Aadhar Back</Button>
                </div>
            </div>
        </div>
    );
};

UploadDocuments.propTypes = {
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired
};

export default UploadDocuments;
