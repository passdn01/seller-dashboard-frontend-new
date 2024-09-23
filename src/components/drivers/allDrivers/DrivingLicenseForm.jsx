import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";

const DrivingLicenseForm = () => {
    const [formData, setFormData] = useState({
        // Driving License Details
        licenseNumber: '',
        name: '',
        dob: '',
        bloodGroup: '',
        validFrom: '',
        validTo: '',
        issueDate: '',
        issuingAuthority: '',
        lastEndorsed: '',
        bioMetricId: '',
        // RC Details
        rcNumber: '',
        registeredDate: '',
        vehicleNumber: '',
        vehicleClass: '',
        fuelType: '',
        makerModel: '',
        engineNumber: '',
        chassisNumber: '',
        insuranceUpto: '',
        fitnessUpto: '',
        pucUpto: '',
    });

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
            const response = await fetch('https://your-api-endpoint.com/driving-license-rc', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add any other headers your API requires, e.g., authorization
                    // 'Authorization': `Bearer ${yourAuthToken}`,
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

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">Edit Profile</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px]">

                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Driving License and RC Details</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-6 py-4">
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Driving License Details</h3>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="licenseNumber" className="text-right">License Number</Label>
                                <Input
                                    id="licenseNumber"
                                    name="licenseNumber"
                                    value={formData.licenseNumber}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Name</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
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
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="bloodGroup" className="text-right">Blood Group</Label>
                                <Select
                                    name="bloodGroup"
                                    onValueChange={(value) => handleSelectChange('bloodGroup', value)}
                                    defaultValue={formData.bloodGroup}
                                >
                                    <SelectTrigger className="col-span-2">
                                        <SelectValue placeholder="Select blood group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="validFrom" className="text-right">Valid From</Label>
                                <Input
                                    id="validFrom"
                                    name="validFrom"
                                    type="date"
                                    value={formData.validFrom}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
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
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="issueDate" className="text-right">Issue Date</Label>
                                <Input
                                    id="issueDate"
                                    name="issueDate"
                                    type="date"
                                    value={formData.issueDate}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="issuingAuthority" className="text-right">Issuing Authority</Label>
                                <Input
                                    id="issuingAuthority"
                                    name="issuingAuthority"
                                    value={formData.issuingAuthority}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="lastEndorsed" className="text-right">Last Endorsed</Label>
                                <Input
                                    id="lastEndorsed"
                                    name="lastEndorsed"
                                    type="date"
                                    value={formData.lastEndorsed}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="bioMetricId" className="text-right">Bio-Metric ID</Label>
                                <Input
                                    id="bioMetricId"
                                    name="bioMetricId"
                                    value={formData.bioMetricId}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">RC Details</h3>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="rcNumber" className="text-right">RC Number</Label>
                                <Input
                                    id="rcNumber"
                                    name="rcNumber"
                                    value={formData.rcNumber}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="registeredDate" className="text-right">Registered Date</Label>
                                <Input
                                    id="registeredDate"
                                    name="registeredDate"
                                    type="date"
                                    value={formData.registeredDate}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="vehicleNumber" className="text-right">Vehicle Number</Label>
                                <Input
                                    id="vehicleNumber"
                                    name="vehicleNumber"
                                    value={formData.vehicleNumber}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="vehicleClass" className="text-right">Vehicle Class</Label>
                                <Input
                                    id="vehicleClass"
                                    name="vehicleClass"
                                    value={formData.vehicleClass}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="fuelType" className="text-right">Fuel Type</Label>
                                <Select
                                    name="fuelType"
                                    onValueChange={(value) => handleSelectChange('fuelType', value)}
                                    defaultValue={formData.fuelType}
                                >
                                    <SelectTrigger className="col-span-2">
                                        <SelectValue placeholder="Select fuel type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Petrol">Petrol</SelectItem>
                                        <SelectItem value="Diesel">Diesel</SelectItem>
                                        <SelectItem value="Electric">Electric</SelectItem>
                                        <SelectItem value="Hybrid">Hybrid</SelectItem>
                                        <SelectItem value="CNG">CNG</SelectItem>
                                        <SelectItem value="LPG">LPG</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="makerModel" className="text-right">Maker Model</Label>
                                <Input
                                    id="makerModel"
                                    name="makerModel"
                                    value={formData.makerModel}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="engineNumber" className="text-right">Engine Number</Label>
                                <Input
                                    id="engineNumber"
                                    name="engineNumber"
                                    value={formData.engineNumber}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="chassisNumber" className="text-right">Chassis Number</Label>
                                <Input
                                    id="chassisNumber"
                                    name="chassisNumber"
                                    value={formData.chassisNumber}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="insuranceUpto" className="text-right">Insurance Upto</Label>
                                <Input
                                    id="insuranceUpto"
                                    name="insuranceUpto"
                                    type="date"
                                    value={formData.insuranceUpto}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="fitnessUpto" className="text-right">Fitness Upto</Label>
                                <Input
                                    id="fitnessUpto"
                                    name="fitnessUpto"
                                    type="date"
                                    value={formData.fitnessUpto}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                            <div className="grid grid-cols-3 items-center gap-4">
                                <Label htmlFor="pucUpto" className="text-right">PUC Upto</Label>
                                <Input
                                    id="pucUpto"
                                    name="pucUpto"
                                    type="date"
                                    value={formData.pucUpto}
                                    onChange={handleInputChange}
                                    className="col-span-2"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                    {submitStatus && (
                        <Alert className={`mt-4 ${submitStatus.type === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                            <AlertDescription>{submitStatus.message}</AlertDescription>
                        </Alert>
                    )}
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default DrivingLicenseForm;