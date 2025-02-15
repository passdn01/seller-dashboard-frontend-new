import { React, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import UploadDocuments from './UploadDocuments';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

const DriverDetails = ({ data }) => {
    const driverId = data?._id;

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isImagesFetched, setIsImagesFetched] = useState(false);

    const initialFormState = {
        licenseNumber: "",
        name: "",
        dob: "",
        gender: "Male",
        address: "",
        licenseType: "",
        licenseValidUpTo: "",
        vehicleNumber: "",
        rcValidUpTo: "",
        category: "",
        vehicleModel: "",
        fuelType: "",
        upiId: "",
        balance: "",
        status: "",
        rejectReason: "NA"
    };

    const initialImageState = {
        profileUrl: "",
        drivingLicense: "",
        drivingLicenseBack: "",
        registrationCertificate: "",
        registrationCertificateBack: "",
    };

    const [formData, setFormData] = useState(initialFormState);
    const [imageUrls, setImageUrls] = useState(initialImageState);

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setIsDialogOpen(true);
    };

    // Fetch signed URLs for images
    const fetchSignedUrls = useCallback(async (urls) => {
        // if (!urls || isImagesFetched) return urls;

        const updatedUrls = { ...urls };
        const fetchPromises = Object.entries(urls)
            .filter(([_, url]) => url) // Only process non-empty URLs
            .map(async ([key, url]) => {
                try {

                    const response = await axios.post("http://13.126.106.41:2011/api/getImage", {
                        unsignedUrl: url,
                    });
                    updatedUrls[key] = response.data.publicUrl || url;

                } catch (err) {
                    console.error(`Failed to fetch ${key}`, err);
                    updatedUrls[key] = url; // Keep original URL on error
                }
            });

        await Promise.all(fetchPromises);
        setIsImagesFetched(true);
        return updatedUrls;
    }, [isImagesFetched]);

    // Fetch driver details
    useEffect(() => {
        const fetchDriverDetails = async () => {
            if (!driverId) return;

            setIsLoading(true);
            try {
                const response = await axios.post(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driverDetail`, {
                    id: driverId
                });

                if (response.data) {
                    const driver = response.data;

                    setFormData({
                        licenseNumber: driver.licenseNumber || "",
                        name: driver.name || "",
                        dob: driver.dob || "",
                        gender: driver.gender || "Male",
                        address: driver.driverAddress || "",
                        licenseType: driver.drivingLicenseCategory || "",
                        licenseValidUpTo: driver.drivingLicenseValidUpto || "",
                        vehicleNumber: driver.vehicleNumber || "",
                        rcValidUpTo: driver.rcValidUpto || "",
                        category: driver.category || "",
                        vehicleModel: driver.vehicleMakerModel || "",
                        fuelType: driver.vehicleFuelType || "",
                        upiId: driver.upiID || "",
                        balance: driver.balance || "",
                        status: driver.status || "",
                        rejectReason: driver.rejectReason || "NA"
                    });

                    const initialUrls = {
                        profileUrl: driver.profileUrl || "",
                        drivingLicense: driver.drivingLicense || "",
                        drivingLicenseBack: driver.drivingLicenseBack || "",
                        registrationCertificate: driver.registrationCertificate || "",
                        registrationCertificateBack: driver.registrationCertificateBack || "",
                    };

                    console.log("initial urls", initialUrls)

                    // Fetch signed URLs immediately after getting initial data
                    const signedUrls = await fetchSignedUrls(initialUrls);
                    console.log("signed urls", signedUrls)
                    setImageUrls(signedUrls);
                }
            } catch (err) {
                setError("Error fetching driver details");
                console.error("Error fetching driver details:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDriverDetails();
    }, [driverId, fetchSignedUrls]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleSave = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driverTableEdit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...formData,
                    imageUrls,
                    id: driverId
                }),
            });

            if (response.ok) {
                await response.json();
                window.alert("Data saved successfully");
            } else {
                throw new Error(response.statusText);
            }
        } catch (error) {
            console.error("Error saving data:", error);
            window.alert("Failed to save data");
        }
    };

    if (!driverId) {
        return <div className="p-4 text-red-500">Error: Driver ID not provided</div>;
    }

    if (isLoading) {
        return <div className="p-4">Loading driver details...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">{error}</div>;
    }

    console.log("Image urls", imageUrls)

    return (
        <div className="w-full max-w-5xl mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Driver Details</h2>
                <Button onClick={handleSave}>Save</Button>
            </div>

            <div className="grid grid-cols-3 gap-6">
                <div className="space-y-4">
                    <div className="flex justify-center mb-6">
                        <Avatar className="w-32 h-32">
                            <AvatarImage
                                src={imageUrls.profileUrl}
                                alt="Profile"
                                onClick={() => handleImageClick(imageUrls.profileUrl)}
                                className="cursor-pointer"
                            />
                            <AvatarFallback>{formData.name?.charAt(0) || 'DP'}</AvatarFallback>
                        </Avatar>
                    </div>
                    {Object.entries(imageUrls)
                        .filter(([key]) => key !== 'profileUrl')
                        .map(([key, url]) => (
                            <div key={key} className="relative">

                                <img
                                    src={url || '/placeholder-image.jpg'}
                                    alt={key.replace(/([A-Z])/g, " $1").trim()}
                                    className="w-full h-48 object-cover rounded-lg border cursor-pointer hover:opacity-90 transition-opacity"
                                    onClick={() => handleImageClick(url)}
                                />
                                <span className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
                                    {key.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                            </div>
                        ))}
                </div>

                <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <LabelField label="License Number" value={formData.licenseNumber} onChange={(val) => handleChange("licenseNumber", val)} />
                        <LabelField label="DOB" type="date" value={formData.dob} onChange={(val) => handleChange("dob", val)} />
                        <LabelField label="Address" value={formData.address} onChange={(val) => handleChange("address", val)} />
                        <LabelField label="Vehicle Number" value={formData.vehicleNumber} onChange={(val) => handleChange("vehicleNumber", val)} />
                        <LabelField label="RC Valid Upto" type="date" value={formData.rcValidUpTo} onChange={(val) => handleChange("rcValidUpTo", val)} />
                        <LabelField label="UPI ID" value={formData.upiId} onChange={(val) => handleChange("upiId", val)} />
                        <LabelField label="Balance" type="number" value={formData.balance} onChange={(val) => handleChange("balance", val)} />
                        <DropdownField
                            label="Status"
                            value={formData.status}
                            options={[
                                { label: "Offline", value: "OFFLINE" },
                                { label: "Available", value: "AVAILABLE" },
                                { label: "On Trip", value: "ON_TRIP" },
                                { label: "Low Balance", value: "LOW_BALANCE" },
                                { label: "Rejected", value: "REJECTED" },
                                { label: "Accepted", value: "ACCEPTED" },
                            ]}
                            onChange={(val) => handleChange("status", val)}
                        />
                    </div>

                    <div className="space-y-4">
                        <LabelField label="Driver Name" value={formData.name} onChange={(val) => handleChange("name", val)} />
                        <DropdownField
                            label="Gender"
                            value={formData.gender}
                            options={[
                                { label: "Male", value: "Male" },
                                { label: "Female", value: "Female" },
                            ]}
                            onChange={(val) => handleChange("gender", val)}
                        />
                        <DropdownField
                            label="License Type"
                            value={formData.licenseType}
                            options={[
                                { label: "LMV", value: "LMV" },
                                { label: "MCWG", value: "MCWG" },
                                { label: "3WNT", value: "3WNT" },
                                { label: "Handicap", value: "HANDICAP" },
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
                                { label: "Auto", value: "AUTO" },
                                { label: "Cab", value: "HATCHBACK" },
                                { label: "Elite", value: "SEDAN" }
                            ]}
                            onChange={(val) => handleChange("category", val)}
                        />
                        <LabelField
                            label="Vehicle Model"
                            value={formData.vehicleModel}
                            onChange={(val) => handleChange("vehicleModel", val)}
                        />
                        <DropdownField
                            label="Reject Reason"
                            value={formData.rejectReason}
                            options={[
                                { label: "License not clear", value: "license not clear" },
                                { label: "License expired", value: "license expired" },
                                { label: "License for bike", value: "license for Bike" },
                                { label: "RC of bike", value: "rc of bike" },
                                { label: "RC Number different", value: "rc number different" },
                                { label: "License name is different", value: "license name is different than submitted" },
                                { label: "Not Applicable", value: "NA" },
                            ]}
                            onChange={(val) => handleChange("rejectReason", val)}
                        />
                        <DropdownField
                            label="Fuel Type"
                            value={formData.fuelType}
                            options={[
                                { label: "CNG", value: "CNG" },
                                { label: "Petrol", value: "PETROL" },
                                { label: "Diesel", value: "DIESEL" },
                                { label: "Electric", value: "ELECTRIC" }
                            ]}
                            onChange={(val) => handleChange("fuelType", val)}
                        />
                    </div>
                </div>
            </div>

            <div className="w-full border-t-2 border-gray-200 my-2 p-2">
                <UploadDocuments id={driverId} />
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                    {selectedImage && (
                        <img
                            src={selectedImage}
                            alt="Full view"
                            className="w-full h-auto rounded-lg"
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

const LabelField = ({ label, type = "text", value, onChange }) => (
    <div>
        <Label>{label}</Label>
        <Input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="mt-1"
        />
    </div>
);

const DropdownField = ({ label, value, options, onChange }) => (
    <div>
        <Label>{label}</Label>
        <Select value={value} onValueChange={onChange}>
            <SelectTrigger className="mt-1">
                <SelectValue placeholder={`Select ${label}`} />
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

export default DriverDetails;