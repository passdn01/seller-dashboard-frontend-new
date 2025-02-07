import { React, useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";

import { Button } from "../../ui/button";

import { Input } from "../../ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "../../ui/select";

import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import UploadDocuments from './UploadDocuments';

import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
const DriverDetails = ({ driver }) => {
    const [formData, setFormData] = useState({
        licenseNumber: driver?.licenseNumber || "",
        name: driver?.name || "",
        dob: driver?.dob || "",
        gender: driver?.gender || "Male",
        address: driver?.driverAddress || "",
        licenseType: driver?.drivingLicenseCategory || "",
        licenseValidUpTo: driver?.drivingLicenseValidUpto || "",
        vehicleNumber: driver?.vehicleNumber || "",
        rcValidUpTo: driver?.rcValidUpto || "",
        category: driver?.category || "",
        vehicleModel: driver?.vehicleMakerModel || "",
        fuelType: driver?.vehicleFuelType || "",
        upiId: driver?.upiID || "",
        balance: driver?.balance || "",
        status: driver?.status || "",
        isVerify: driver?.isVerify || false,
    });

    const [imageUrls, setImageUrls] = useState({
        profileUrl: driver?.profileUrl || "",
        drivingLicense: driver?.drivingLicense || "",
        drivingLicenseBack: driver?.drivingLicenseBack || "",
        registrationCertificate: driver?.registrationCertificate || "",
        registrationCertificateBack: driver?.registrationCertificateBack || "",
    });

    const [selectedImage, setSelectedImage] = useState(null); // Track selected image
    const [isDialogOpen, setIsDialogOpen] = useState(false); // Control dialog visibility

    useEffect(() => {
        const fetchImageUrls = async () => {
            const keys = Object.keys(imageUrls);
            const promises = keys.map((key) =>
                imageUrls[key]
                    ? axios
                        .post("http://13.126.106.41:2011/api/getImage", {
                            unsignedUrl: imageUrls[key],
                        })
                        .then((res) => ({ [key]: res.data.publicUrl }))
                        .catch((err) => {
                            console.error(`Failed to fetch ${key}`, err);
                            return { [key]: imageUrls[key] }; // Keep the original URL if API fails
                        })
                    : Promise.resolve({ [key]: "" })
            );

            const results = await Promise.all(promises);
            const updatedUrls = results.reduce((acc, item) => ({ ...acc, ...item }), {});
            setImageUrls(updatedUrls);
        };

        fetchImageUrls();
    }, [driver]);

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl); // Set the selected image
        setIsDialogOpen(true); // Open the dialog
    };

    const handleChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        const payload = {
            ...formData,
            imageUrls,
            id: driver._id
        };

        try {
            const response = await fetch("https://8qklrvxb-5000.inc1.devtunnels.ms/dashboard/api/driverTableEdit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.ok) {
                const result = await response.json();
                window.alert("Data saved.")
                console.log("Data saved successfully:", result);
            } else {
                console.error("Failed to save data:", response.statusText);
            }
        } catch (error) {
            console.error("Error during POST request:", error);
        }
    };

    return (
        <div className="w-full max-w-5xl mx-auto p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Driver Details</h2>
                <div className="flex items-center gap-4">
                    <Button onClick={handleSave}>Save</Button>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-3 gap-6">
                {/* Left Column - Images */}
                <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                        <Avatar className="w-32 h-32">
                            <AvatarImage src={imageUrls.profileUrl} alt="Profile" />
                            <AvatarFallback>DP</AvatarFallback>
                        </Avatar>
                    </div>
                    {["drivingLicense", "drivingLicenseBack", "registrationCertificate", "registrationCertificateBack"].map((key) => (
                        <img
                            key={key}
                            src={imageUrls[key]}
                            alt={key.replace(/([A-Z])/g, " $1")}
                            className="w-full h-48 object-cover rounded-lg border cursor-pointer"
                            onClick={() => handleImageClick(imageUrls[key])} // Open dialog on click
                        />
                    ))}
                </div>

                {/* Middle and Right Columns - Form Fields */}
                <div className="col-span-2 grid grid-cols-2 gap-4">
                    {/* Form Fields */}
                    <div className="space-y-4">
                        <LabelField label="License Number" value={formData.licenseNumber} onChange={(val) => handleChange("licenseNumber", val)} />
                        <LabelField label="DOB" type="date" value={formData.dob} onChange={(val) => handleChange("dob", val)} />
                        <LabelField label="Address" value={formData.address} onChange={(val) => handleChange("address", val)} />
                        <LabelField label="Vehicle Number" value={formData.vehicleNumber} onChange={(val) => handleChange("vehicleNumber", val)} />
                        <LabelField label="RC Valid Upto" type="date" value={formData.rcValidUpTo} onChange={(val) => handleChange("rcValidUpto", val)} />
                        <LabelField label="UPI ID" value={formData.upiId} onChange={(val) => handleChange("upiId", val)} />
                        <LabelField label="Balance" type="number" value={formData.balance} onChange={(val) => handleChange("balance", val)} />
                        <DropdownField
                            label="Status"
                            value={formData.status}
                            options={[
                                { label: "Offline", value: "OFFLINE" },
                                { label: "Available", value: "AVAILABLE" },
                                { label: "ON_TRIP", value: "ON_TRIP" },
                                { label: "LOW_BALANCE", value: "LOW_BALANCE" },
                                { label: "REJECTED", value: "REJECTED" },
                                { label: "ACCEPTED", value: "ACCEPTED" },
                            ]}
                            onChange={(val) => handleChange("status", val)}
                        />
                    </div>

                    <div className="space-y-4">
                        <DropdownField
                            label="Verification Status"
                            value={formData.isVerify}
                            options={[
                                { label: "Verified", value: true },
                                { label: "Not Verified", value: false },
                            ]}
                            onChange={(val) => handleChange("isVerify", val)}
                        />
                        <LabelField label="Driver Name" value={formData.name} onChange={(val) => handleChange("name", val)} />
                        <DropdownField label='Gender' value={formData.gender} options={[
                            { label: "Male", value: "Male" },
                            { label: "Female", value: "Female" },
                        ]} />
                        <DropdownField
                            label="License Type"
                            value={formData.licenseType}
                            options={[
                                { label: "LMV", value: "LMV" },
                                { label: "MCWG", value: "MCWG" },
                                { label: "3WNT", value: "3WNT" },
                                { label: "HANDICAP", value: "HANDICAP" },
                            ]}
                            onChange={(val) => handleChange("licenseType", val)}
                        />
                        <LabelField
                            label="License Valid Upto"
                            type="date"
                            value={formData.licenseValidUpTo}
                            onChange={(val) => handleChange("licenseValidUpTo", val)}
                        />
                        <DropdownField
                            label="Category"
                            value={formData.category}
                            options={[
                                { label: "AUTO", value: "AUTO" },
                                { label: "CAB", value: "HATCHBACK" },
                                { label: "ELITE", value: "SEDAN" }
                            ]}
                            onChange={(val) => handleChange("category", val)}
                        />
                        <LabelField label="Vehicle Model" value={formData.vehicleModel} onChange={(val) => handleChange("vehicleModel", val)} />


                        {/* //reject reasons to be added later */}
                        {/* <DropdownField
                            label="Reject reasons"
                            value=''
                            options={[
                                { label: "License not clear", value: "license not clear" },
                                { label: "License expired", value: "license expired" },
                                { label: "License for bike", value: "license for Bike" },
                                { label: "RC of bike", value: "rc of bike" },
                                { label: "RC Number different", value: "rc number different" },
                                { label: "License name is different than submitted", value: "license name is different than submitted" },
                            ]}
                            onChange={(val) => handleChange("category", val)}
                        /> */}
                        <DropdownField
                            label="Fuel Type"
                            value={formData.fuelType}
                            options={[
                                { label: "CNG", value: "CNG" },
                                { label: "PETROL", value: "PETROL" },
                                { label: "DIESEL", value: "DIESEL" },
                                { label: "ELECTRIC", value: "ELECTRIC" }
                            ]}
                            onChange={(val) => handleChange("fuelType", val)}
                        />

                    </div>

                </div>

            </div>

            <div className='w-full border-t-2 border-gray-200 my-2 p-2'>
                <UploadDocuments id={driver._id}></UploadDocuments>
            </div>

            {/* Image Dialog */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-lg overflow-auto">
                    {selectedImage && <img src={selectedImage} alt="Full view" className=" h-auto rounded-lg " />}

                </DialogContent>
            </Dialog>
        </div>
    );
};

const LabelField = ({ label, type = "text", value, onChange }) => (
    <div>
        <Label>{label}</Label>
        <Input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
);

const DropdownField = ({ label, value, options, onChange }) => (

    <div>
        <Label>{label}</Label>
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger>
                <SelectValue placeholder={value} />
            </SelectTrigger>
            <SelectContent>
                {options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    </div>
);



export default DriverDetails