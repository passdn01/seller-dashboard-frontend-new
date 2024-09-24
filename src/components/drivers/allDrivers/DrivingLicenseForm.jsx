import React, { useState } from 'react';
import { DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

const DrivingLicenseForm = ({ data, id }) => {
    const { driverInfo } = data;
    const [formData, setFormData] = useState({
        id: id,
        // Driving License Details
        licenseNumber: driverInfo.licenseNumber,
        name: driverInfo?.name,
        dob: driverInfo?.dob,
        address: driverInfo?.address,
        validTo: driverInfo?.drivingLicenseValidUpto,
        gender: driverInfo?.gender,
        licenseCategory: driverInfo?.drivingLicenseCategory,
        upiId: driverInfo?.upiID,
        balance: driverInfo?.balance,
        DL: driverInfo?.drivingLicense, // image upload
        // RC Details
        vehicleNumber: driverInfo.vehicleNumber,
        fuelType: driverInfo?.fuelType,
        makerModel: driverInfo?.vehicleMakerModel,
        vehicleType: driverInfo?.vehicleType,
        RC: driverInfo?.registrationCertificate
    });

    const [preview, setPreview] = useState(null); // Preview for image
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSelectChange = (name, value) => {
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            const response = await fetch(`https://bhk8mp0s-2011.inc1.devtunnels.ms/dashboard/api/${id}/edit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Success:', result);
            setSubmitStatus({ type: 'success', message: 'Form submitted successfully!' });
        } catch (error) {
            console.error('Error:', error);
            setSubmitStatus({ type: 'error', message: 'An error occurred while submitting the form. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setPreview(URL.createObjectURL(file));
            setFormData(prevState => ({
                ...prevState,
                DL: file.name // Set the file name
            }));
        }
    };

    return (
        <div className="max-h-[80vh] overflow-auto px-2 pr-4">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-6 py-4">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">Driving License Details</h3>
                        <div className="">
                            <Label htmlFor="licenseNumber" className="">License Number</Label> <br />
                            <Input
                                id="licenseNumber"
                                name="licenseNumber"
                                value={formData.licenseNumber}
                                onChange={handleInputChange}
                                className="col-span-2"
                            />
                        </div>
                        <div className="">
                            <Label htmlFor="dob" className="text-right">DOB</Label>
                            <Input
                                id="dob"
                                name="dob"
                                type="date"
                                value={formData.dob}
                                onChange={handleInputChange}
                                className="col-span-2"
                            />
                        </div>
                        <div className="">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                className="col-span-2"
                            />
                        </div>
                        <div>
                            <Label className="text-right">Address</Label>
                            <Textarea id="address" name="address" value={formData.address} onChange={handleInputChange} className="col-span-2" />
                        </div>
                        <div className="">
                            <Label htmlFor="validTo" className="text-right">Valid To</Label>
                            <Input
                                id="validTo"
                                name="validTo"
                                type="date"
                                value={formData.validTo}
                                onChange={handleInputChange}
                                className="col-span-2"
                            />
                        </div>
                        <div className="">
                            <Label htmlFor="gender" className="text-right">Gender</Label>
                            <Select
                                name="gender"
                                onValueChange={(value) => handleSelectChange('gender', value)}
                                defaultValue={formData.gender}
                            >
                                <SelectTrigger className="col-span-2">
                                    <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="">
                            <Label htmlFor="licenseCategory" className="text-right">License Category</Label>
                            <Select
                                name="licenseCategory"
                                onValueChange={(value) => handleSelectChange('licenseCategory', value)}
                                defaultValue={formData.licenseCategory}
                            >
                                <SelectTrigger className="col-span-2">
                                    <SelectValue placeholder="Select Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LMV">LMV</SelectItem>
                                    <SelectItem value="LMV TT">LMV TT</SelectItem>
                                    <SelectItem value="HGMV">HGMV</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="">
                            <Label htmlFor="upiId" className="text-right">UPI ID</Label>
                            <Input
                                id="upiId"
                                name="upiId"
                                value={formData.upiId}
                                onChange={handleInputChange}
                                className="col-span-2"
                            />
                        </div>
                        <div className="">
                            <Label htmlFor="balance" className="text-right">Balance</Label>
                            <Input
                                id="balance"
                                name="balance"
                                value={formData.balance}
                                onChange={handleInputChange}
                                className="col-span-2"
                            />
                        </div>
                        <div className="">
                            <Label htmlFor="DL" className="text-right">Driving License (DL)</Label>
                            <Input
                                id="DL"
                                name="DL"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="col-span-2"
                            />
                            {formData.DL && <p className="col-span-2 text-sm">{formData.DL}</p>} {/* Display file name */}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold">RC Details</h3>
                        <div className="">
                            <Label htmlFor="vehicleNumber" className="text-right">Vehicle Number</Label>
                            <Input
                                id="vehicleNumber"
                                name="vehicleNumber"
                                value={formData.vehicleNumber}
                                onChange={handleInputChange}
                                className="col-span-2"
                            />
                        </div>
                        <div className="">
                            <Label htmlFor="fuelType" className="text-right">Fuel Type</Label>
                            <Select
                                name="fuelType"
                                onValueChange={(value) => handleSelectChange('fuelType', value)}
                                defaultValue={formData.fuelType}
                            >
                                <SelectTrigger className="col-span-2">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="petrol">Petrol</SelectItem>
                                    <SelectItem value="diesel">Diesel</SelectItem>
                                    <SelectItem value="CNG">CNG</SelectItem>
                                    <SelectItem value="electrical">Electrical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="">
                            <Label htmlFor="makerModel" className="text-right">Maker Model</Label>
                            <Input
                                id="makerModel"
                                name="makerModel"
                                value={formData.makerModel}
                                onChange={handleInputChange}
                                className="col-span-2"
                            />
                        </div>
                        <div className="">
                            <Label htmlFor="vehicleType" className="text-right">Vehicle Type</Label>
                            <Select
                                name="vehicleType"
                                onValueChange={(value) => handleSelectChange('vehicleType', value)}
                                defaultValue={formData.vehicleType}
                            >
                                <SelectTrigger className="col-span-2">
                                    <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LMV">LMV</SelectItem>
                                    <SelectItem value="HMV">HMV</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="">
                            <Label htmlFor="RC" className="text-right">RC (Registration Certificate)</Label>
                            <Input
                                id="RC"
                                name="RC"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="col-span-2"
                            />
                            {formData.RC && <p className="col-span-2 text-sm">{formData.RC}</p>} {/* Display file name */}
                        </div>
                    </div>
                </div>

                <DialogFooter className="space-x-2">
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Submitting...' : 'Submit'}
                    </Button>
                    <Button type="reset" variant="outline">
                        Reset
                    </Button>
                </DialogFooter>
            </form>

            {submitStatus && (
                <Alert variant={submitStatus.type === 'success' ? 'success' : 'destructive'}>
                    <AlertDescription>
                        {submitStatus.message}
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
};

export default DrivingLicenseForm;


