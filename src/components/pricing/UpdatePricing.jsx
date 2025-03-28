import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import axios from "axios";
import {
    Car,
    Clock,
    DollarSign,
    Save,
    Moon,
    Route,
    Ruler,
    Calculator,
    Gauge,
    Bike,
    AlertCircle,
    Loader2,
    Plus,
    Trash2,
    X,
    Edit,
} from "lucide-react";

export default function UpdatePricing({ cityId, vehicleData, onCancel, onSuccess, cities }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        vehicleType: "",
        baseFare: "",
        minimumFare: "",
        baseDistance: "",
        maxPriceBuffer: "",
        isActive: true,
        cityId: cityId || "",
        nightCharges: {
            multiplier: "",
            startTime: "",
            endTime: ""
        },
        distanceRanges: [
            { minDistance: "", maxDistance: "", pricePerKm: "" }
        ]
    });

    // Initialize form with vehicle data
    useEffect(() => {
        if (vehicleData) {
            const distanceRanges = vehicleData.distanceRanges?.map(range => ({
                minDistance: range.minDistance.toString(),
                maxDistance: range.maxDistance.toString(),
                pricePerKm: range.pricePerKm.toString()
            })) || [{ minDistance: vehicleData.baseDistance.toString(), maxDistance: "", pricePerKm: "" }];
            
            // Ensure the first range starts with baseDistance
            if (distanceRanges.length > 0) {
                distanceRanges[0].minDistance = vehicleData.baseDistance.toString();
            }
            
            setFormData({
                vehicleType: vehicleData.vehicleType.toLowerCase(),
                baseFare: vehicleData.baseFare.toString(),
                minimumFare: vehicleData.minimumFare.toString(),
                baseDistance: vehicleData.baseDistance.toString(),
                maxPriceBuffer: vehicleData.maxPriceBuffer.toString(),
                isActive: vehicleData.isActive,
                cityId: cityId || "",
                nightCharges: {
                    multiplier: vehicleData.nightCharges?.multiplier?.toString() || "",
                    startTime: vehicleData.nightCharges?.startTime?.toString() || "",
                    endTime: vehicleData.nightCharges?.endTime?.toString() || ""
                },
                distanceRanges: distanceRanges
            });
        }
    }, [vehicleData, cityId]);

    // Update the first distance range when baseDistance changes
    const handleChange = (field, value) => {
        setFormData(prev => {
            const updatedData = {
                ...prev,
                [field]: value
            };
            
            // If baseDistance is changing, update the first distance range minDistance
            if (field === "baseDistance" && value !== "") {
                const updatedRanges = [...prev.distanceRanges];
                if (updatedRanges.length > 0) {
                    updatedRanges[0] = {
                        ...updatedRanges[0],
                        minDistance: value
                    };
                    
                    return {
                        ...updatedData,
                        distanceRanges: updatedRanges
                    };
                }
            }
            
            return updatedData;
        });
    };

    const handleNightChargeChange = (field, value) => {
        setFormData({
            ...formData,
            nightCharges: {
                ...formData.nightCharges,
                [field]: value
            }
        });
    };

    const handleDistanceRangeChange = (index, field, value) => {
        const updatedRanges = [...formData.distanceRanges];
        updatedRanges[index] = {
            ...updatedRanges[index],
            [field]: value
        };

        setFormData({
            ...formData,
            distanceRanges: updatedRanges
        });
    };

    const addDistanceRange = () => {
        const lastRange = formData.distanceRanges[formData.distanceRanges.length - 1];
        
        // Make sure the base distance is defined before adding a new range
        if (!formData.baseDistance || formData.baseDistance === "") {
            setError("Please set the base distance before adding distance ranges");
            return;
        }
        
        // Ensure last range has a max distance
        if (!lastRange.maxDistance || lastRange.maxDistance === "") {
            setError("Please set max distance for current range before adding a new range");
            return;
        }
        
        setFormData({
            ...formData,
            distanceRanges: [
                ...formData.distanceRanges,
                {
                    minDistance: lastRange.maxDistance,
                    maxDistance: "",
                    pricePerKm: ""
                }
            ]
        });
        
        // Clear any error that might be showing
        setError(null);
    };

    const removeDistanceRange = (index) => {
        if (formData.distanceRanges.length <= 1) return;
        
        const updatedRanges = formData.distanceRanges.filter((_, i) => i !== index);
        
        // Update min distance of next range if removing a middle range
        if (index < formData.distanceRanges.length - 1) {
            for (let i = index; i < updatedRanges.length; i++) {
                if (i === 0) {
                    updatedRanges[i].minDistance = formData.baseDistance;
                } else {
                    updatedRanges[i].minDistance = updatedRanges[i-1].maxDistance;
                }
            }
        }
        
        setFormData({
            ...formData,
            distanceRanges: updatedRanges
        });
    };

    const validateForm = () => {
        if (!formData.cityId) {
            setError("Please select a city");
            return false;
        }
        
        if (!formData.baseFare || !formData.minimumFare || !formData.baseDistance || !formData.maxPriceBuffer) {
            setError("Please fill all basic pricing fields");
            return false;
        }
        
        if (!formData.nightCharges.multiplier || !formData.nightCharges.startTime || !formData.nightCharges.endTime) {
            setError("Please fill all night charges fields");
            return false;
        }
        
        // Validate distance ranges
        for (let i = 0; i < formData.distanceRanges.length; i++) {
            const range = formData.distanceRanges[i];
            if (!range.minDistance || !range.maxDistance || !range.pricePerKm) {
                setError(`Please fill all fields in distance range ${i + 1}`);
                return false;
            }
            
            // Check if first range starts with baseDistance
            if (i === 0 && parseFloat(range.minDistance) !== parseFloat(formData.baseDistance)) {
                setError("First distance range must start from base distance");
                return false;
            }
            
            // Check if ranges are continuous
            if (i > 0) {
                const prevRange = formData.distanceRanges[i - 1];
                if (parseFloat(prevRange.maxDistance) !== parseFloat(range.minDistance)) {
                    setError(`Distance ranges must be continuous. Check range ${i} and ${i + 1}`);
                    return false;
                }
            }
        }
        
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!validateForm()) return;
        
        setLoading(true);
        
        try {
            const token = localStorage.getItem("token");
            const dataToSubmit = {
                baseFare: parseFloat(formData.baseFare),
                minimumFare: parseFloat(formData.minimumFare),
                baseDistance: parseFloat(formData.baseDistance),
                maxPriceBuffer: parseFloat(formData.maxPriceBuffer),
                isActive: formData.isActive,
                nightCharges: {
                    multiplier: parseFloat(formData.nightCharges.multiplier),
                    startTime: parseInt(formData.nightCharges.startTime),
                    endTime: parseInt(formData.nightCharges.endTime)
                },
                distanceRanges: formData.distanceRanges.map(range => ({
                    minDistance: parseFloat(range.minDistance),
                    maxDistance: parseFloat(range.maxDistance),
                    pricePerKm: parseFloat(range.pricePerKm)
                }))
            };
            
            await axios.patch(
                `https://suuper.in/pricing/${vehicleData.vehicleType}?cityId=${formData.cityId}`,
                dataToSubmit,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            onSuccess();
        } catch (error) {
            console.error("Error updating pricing:", error);
            setError(error.response?.data?.message || "Failed to update pricing configuration");
        } finally {
            setLoading(false);
        }
    };

    // Get the vehicle icon
    const getVehicleIcon = () => {
        return formData.vehicleType === "bike" ? 
            <Bike className="mr-2 h-5 w-5 text-blue-500" /> : 
            <Car className="mr-2 h-5 w-5 text-blue-500" />;
    };

    return (
        <Card className="shadow-md border-blue-100">
            <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <Edit className="mr-2 h-5 w-5" />
                        <CardTitle className="text-xl">Update {vehicleData.vehicleType} Pricing Configuration</CardTitle>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onCancel} className="text-white hover:bg-blue-800">
                        <X className="h-5 w-5" />
                    </Button>
                </div>
                <CardDescription className="text-blue-100">Modify pricing parameters for {vehicleData.vehicleType} vehicles</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit}>
                    <div className="space-y-6">
                        <div className="border border-blue-100 rounded-md p-4 bg-white">
                            <h3 className="text-lg font-semibold mb-4 border-b border-blue-100 pb-2 flex items-center">
                                {getVehicleIcon()}
                                <span className="capitalize">
                                    {formData.vehicleType} Configuration
                                </span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium flex items-center text-gray-700">
                                        City
                                    </Label>
                                    <Select
                                        value={formData.cityId}
                                        onValueChange={(value) => handleChange("cityId", value)}
                                        disabled={loading}
                                    >
                                        <SelectTrigger className="mt-2 border-blue-200 focus:border-blue-500">
                                            <SelectValue placeholder="Select city" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities && cities.length > 0 ? (
                                                cities.map((city) => (
                                                    <SelectItem key={city._id} value={city._id}>
                                                        <div className="flex items-center">
                                                            <div className={`h-3 w-3 rounded-full ${city.isActive ? 'bg-green-500' : 'bg-blue-500'} shadow-sm mr-2 transition-all duration-300`}></div>
                                                            {city.name}
                                                        </div>
                                                    </SelectItem>
                                                ))
                                            ) : (
                                                <SelectItem value="" disabled>
                                                    No cities available
                                                </SelectItem>
                                            )}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center mt-7">
                                    <Switch
                                        id="active-status"
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) => handleChange("isActive", checked)}
                                        className="data-[state=checked]:bg-blue-500"
                                    />
                                    <Label htmlFor="active-status" className="ml-2">
                                        Active Status
                                    </Label>
                                </div>
                            </div>
                        </div>

                        <div className="border border-blue-100 rounded-md p-4 bg-white">
                            <h3 className="text-lg font-semibold mb-4 border-b border-blue-100 pb-2 flex items-center">
                                <DollarSign className="mr-2 h-5 w-5 text-blue-600" />
                                Basic Pricing
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label className="text-sm font-medium flex items-center text-gray-700">
                                        <DollarSign className="mr-1 h-4 w-4 text-blue-500" />
                                        Minimum Fare
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.minimumFare}
                                        onChange={(e) => handleChange("minimumFare", e.target.value)}
                                        className="mt-1 border-blue-200 focus:border-blue-500"
                                        disabled={loading}
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium flex items-center text-gray-700">
                                        <DollarSign className="mr-1 h-4 w-4 text-blue-500" />
                                        Base Fare
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.baseFare}
                                        onChange={(e) => handleChange("baseFare", e.target.value)}
                                        className="mt-1 border-blue-200 focus:border-blue-500"
                                        disabled={loading}
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium flex items-center text-gray-700">
                                        <Ruler className="mr-1 h-4 w-4 text-blue-500" />
                                        Base Distance (km)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.baseDistance}
                                        onChange={(e) => handleChange("baseDistance", e.target.value)}
                                        className="mt-1 border-blue-200 focus:border-blue-500"
                                        disabled={loading}
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium flex items-center text-gray-700">
                                        <Calculator className="mr-1 h-4 w-4 text-blue-500" />
                                        Max Price Buffer (%)
                                    </Label>
                                    <Input
                                        type="number"
                                        value={formData.maxPriceBuffer}
                                        onChange={(e) => handleChange("maxPriceBuffer", e.target.value)}
                                        className="mt-1 border-blue-200 focus:border-blue-500"
                                        disabled={loading}
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border border-blue-100 rounded-md p-4 bg-white">
                            <h3 className="text-lg font-semibold mb-4 border-b border-blue-100 pb-2 flex items-center">
                                <Moon className="mr-2 h-5 w-5 text-blue-600" />
                                Night Charges
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <Label className="text-sm font-medium flex items-center text-gray-700">
                                        <Gauge className="mr-1 h-4 w-4 text-blue-500" />
                                        Multiplier
                                    </Label>
                                    <Input
                                        type="number"
                                        step="0.1"
                                        value={formData.nightCharges.multiplier}
                                        onChange={(e) => handleNightChargeChange("multiplier", e.target.value)}
                                        className="mt-1 border-blue-200 focus:border-blue-500"
                                        disabled={loading}
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium flex items-center text-gray-700">
                                        <Clock className="mr-1 h-4 w-4 text-blue-500" />
                                        Start Time (24hr)
                                    </Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={formData.nightCharges.startTime}
                                        onChange={(e) => handleNightChargeChange("startTime", e.target.value)}
                                        className="mt-1 border-blue-200 focus:border-blue-500"
                                        disabled={loading}
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium flex items-center text-gray-700">
                                        <Clock className="mr-1 h-4 w-4 text-blue-500" />
                                        End Time (24hr)
                                    </Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="23"
                                        value={formData.nightCharges.endTime}
                                        onChange={(e) => handleNightChargeChange("endTime", e.target.value)}
                                        className="mt-1 border-blue-200 focus:border-blue-500"
                                        disabled={loading}
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border border-blue-100 rounded-md p-4 bg-white">
                            <div className="flex items-center justify-between mb-4 border-b border-blue-100 pb-2">
                                <h3 className="text-lg font-semibold flex items-center">
                                    <Route className="mr-2 h-5 w-5 text-blue-600" />
                                    Distance Ranges
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={addDistanceRange}
                                    disabled={loading}
                                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                >
                                    <Plus className="mr-1 h-4 w-4" />
                                    Add Range
                                </Button>
                            </div>
                            <div className="space-y-4">
                                {formData.distanceRanges.map((range, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-3 bg-blue-50/50 rounded-md border border-blue-100/50">
                                        <div>
                                            <Label className="text-sm font-medium flex items-center text-gray-700">
                                                <Ruler className="mr-1 h-4 w-4 text-blue-500" />
                                                Min Distance (km) {index === 0 && (
                                                    <span className="text-xs text-blue-600 ml-1">(Base Distance)</span>
                                                )}
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={range.minDistance}
                                                onChange={(e) => handleDistanceRangeChange(index, "minDistance", e.target.value)}
                                                className="mt-1 border-blue-200 focus:border-blue-500"
                                                disabled={index === 0 || loading} // First range should match base distance
                                                onWheel={(e) => e.target.blur()}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium flex items-center text-gray-700">
                                                <Ruler className="mr-1 h-4 w-4 text-blue-500" />
                                                Max Distance (km)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={range.maxDistance}
                                                onChange={(e) => handleDistanceRangeChange(index, "maxDistance", e.target.value)}
                                                className="mt-1 border-blue-200 focus:border-blue-500"
                                                disabled={loading}
                                                onWheel={(e) => e.target.blur()}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium flex items-center text-gray-700">
                                                <DollarSign className="mr-1 h-4 w-4 text-blue-500" />
                                                Price Per Km (₹)
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={range.pricePerKm}
                                                onChange={(e) => handleDistanceRangeChange(index, "pricePerKm", e.target.value)}
                                                className="mt-1 border-blue-200 focus:border-blue-500"
                                                disabled={loading}
                                                onWheel={(e) => e.target.blur()}
                                            />
                                        </div>
                                        <div className="flex items-end">
                                            {index > 0 && (
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeDistanceRange(index)}
                                                    disabled={loading}
                                                    className="w-full"
                                                >
                                                    <Trash2 className="mr-1 h-4 w-4" />
                                                    Remove
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="py-2 px-4 rounded-md flex items-center bg-red-100 text-red-800">
                                <AlertCircle className="h-4 w-4 mr-2" />
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onCancel}
                                disabled={loading}
                                className="w-1/3 border-blue-200"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="w-2/3 bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" />
                                        Update Pricing
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}