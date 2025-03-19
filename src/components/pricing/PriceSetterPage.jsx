import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import axios from "axios";
import SideNavbar from "../SideNavbar";
import {
    Car,
    Clock,
    DollarSign,
    Save,
    Moon,
    ArrowRight,
    AlertCircle,
    Check,
    Loader2,
    Route,
    Ruler,
    Calculator,
    Gauge,
} from "lucide-react";

const VEHICLE_TYPES = {
    AUTO: "auto",
    HATCHBACK: "hatchback",
    SEDAN: "sedan",
};

export default function FarePricing() {
    const [pricingData, setPricingData] = useState({});
    const [changedFields, setChangedFields] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(VEHICLE_TYPES.AUTO);
    const [saveStatus, setSaveStatus] = useState({ type: null, message: null });

    const [cityId, setCityId] = useState("60d21b4667d0d8992e610c85");

    useEffect(() => {
        fetchPricingData();
    }, []);

    const fetchPricingData = async () => {
        setLoading(true);
        try {
            // const response = await axios.get(`https://airshare.co.in/pricing`);
            const response = await axios.get(`https://jwkxs7nc-8055.inc1.devtunnels.ms/pricing`);
            const data = response.data.data;

            console.log(data, "response from server")

            const formattedData = {
                auto: data.find((item) => item.vehicleType === "AUTO") || null,
                hatchback: data.find((item) => item.vehicleType === "HATCHBACK") || null,
                sedan: data.find((item) => item.vehicleType === "SEDAN") || null,
            };

            if (formattedData.auto) {
                setCityId(formattedData.auto.cityId);
            }

            setPricingData(formattedData);
            setChangedFields({});
        } catch (error) {
            console.error("Error fetching pricing data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (category, field, value) => {
        setPricingData((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value,
            },
        }));

        setChangedFields((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value,
            },
        }));
    };

    const handleNightChargeChange = (category, field, value) => {
        setPricingData((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                nightCharges: {
                    ...prev[category]?.nightCharges,
                    [field]: value,
                },
            },
        }));

        setChangedFields((prev) => ({
            ...prev,
            [category]: {
                ...prev[category],
                nightCharges: {
                    ...prev[category]?.nightCharges,
                    [field]: value,
                },
            },
        }));
    };

    const handleDistanceRangeChange = (category, index, field, value) => {
        setPricingData((prev) => {
            const updatedRanges = [...prev[category].distanceRanges];
            updatedRanges[index] = {
                ...updatedRanges[index],
                [field]: value
            };

            return {
                ...prev,
                [category]: {
                    ...prev[category],
                    distanceRanges: updatedRanges
                }
            };
        });

        setChangedFields((prev) => {
            const updatedRanges = [
                ...(prev[category]?.distanceRanges || pricingData[category]?.distanceRanges || [])
            ];
            updatedRanges[index] = {
                ...(updatedRanges[index] || {}),
                [field]: value
            };

            return {
                ...prev,
                [category]: {
                    ...prev[category],
                    distanceRanges: updatedRanges
                }
            };
        });
    };

    const handleSave = async (category) => {
        if (!changedFields[category] || Object.keys(changedFields[category]).length === 0) {
            setSaveStatus({
                type: "warning",
                message: `No changes detected for ${category}`
            });
            setTimeout(() => setSaveStatus({ type: null, message: null }), 3000);
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem("token");
            await axios.patch(
                // `https://airshare.co.in/pricing/${category}?cityId=${cityId}`,
                `https://jwkxs7nc-8055.inc1.devtunnels.ms/pricing/${category}?cityId=${cityId}`,
                changedFields[category],
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setSaveStatus({
                type: "success",
                message: `Updated ${category} pricing successfully!`
            });
            setTimeout(() => setSaveStatus({ type: null, message: null }), 3000);
            setChangedFields((prev) => ({
                ...prev,
                [category]: {},
            }));
        } catch (error) {
            console.error("Error updating pricing:", error);
            setSaveStatus({
                type: "error",
                message: `Failed to update ${category} pricing`
            });
            setTimeout(() => setSaveStatus({ type: null, message: null }), 3000);
        } finally {
            setLoading(false);
        }
    };

    // Get the appropriate vehicle icon based on category
    const getVehicleIcon = (category) => {
        switch (category) {
            case VEHICLE_TYPES.AUTO:
                return <Car className="mr-2 h-5 w-5 text-blue-500" />;
            case VEHICLE_TYPES.HATCHBACK:
                return <Car className="mr-2 h-5 w-5 text-blue-500" />;
            case VEHICLE_TYPES.SEDAN:
                return <Car className="mr-2 h-5 w-5 text-blue-500" />;
            default:
                return <Car className="mr-2 h-5 w-5 text-blue-500" />;
        }
    };

    const validateDistanceRanges = (category) => {
        if (!pricingData[category] || !pricingData[category].distanceRanges) return true;

        const ranges = pricingData[category].distanceRanges;
        for (let i = 0; i < ranges.length - 1; i++) {
            // Check if current max equals next min
            if (parseFloat(ranges[i].maxDistance) !== parseFloat(ranges[i + 1].minDistance)) {
                setSaveStatus({
                    type: "warning",
                    message: `Distance ranges must be continuous. Check ranges ${i + 1} and ${i + 2}.`
                });
                setTimeout(() => setSaveStatus({ type: null, message: null }), 5000);
                return false;
            }
        }
        return true;
    };

    const renderPricingForm = (category) => {
        const data = pricingData[category];

        if (!data) return null;

        return (
            <Card className="shadow-md border-blue-100">
                <CardHeader className="border-b bg-blue-50">
                    <div className="flex items-center">
                        {getVehicleIcon(category)}
                        <CardTitle className="text-xl ">{category.toUpperCase()} Pricing Configuration</CardTitle>
                    </div>
                    <CardDescription>Adjust pricing parameters for {category} vehicles</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
                        <div className="border border-blue-100 rounded-md p-4 bg-white">
                            <h3 className="text-lg font-semibold mb-4  border-b border-blue-100 pb-2 flex items-center">
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
                                        value={data.minimumFare}
                                        onChange={(e) => handleChange(category, "minimumFare", e.target.value)}
                                        className="mt-1 border-blue-200 focus:border-blue-500"
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
                                        value={data.baseFare}
                                        onChange={(e) => handleChange(category, "baseFare", e.target.value)}
                                        className="mt-1 border-blue-200 focus:border-blue-500"
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium flex items-center text-gray-700">
                                        <Ruler className="mr-1 h-4 w-4 text-blue-500" />
                                        Base Distance
                                    </Label>
                                    <Input
                                        type="number"
                                        value={data.baseDistance}
                                        onChange={(e) => handleChange(category, "baseDistance", e.target.value)}
                                        className="mt-1 border-blue-200 focus:border-blue-500"
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium flex items-center text-gray-700">
                                        <Calculator className="mr-1 h-4 w-4 text-blue-500" />
                                        Max Price Buffer
                                    </Label>
                                    <Input
                                        type="number"
                                        value={data.maxPriceBuffer}
                                        onChange={(e) => handleChange(category, "maxPriceBuffer", e.target.value)}
                                        className="mt-1 border-blue-200 focus:border-blue-500"
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border border-blue-100 rounded-md p-4 bg-white">
                            <h3 className="text-lg font-semibold mb-4  border-b border-blue-100 pb-2 flex items-center">
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
                                        value={data.nightCharges?.multiplier || ""}
                                        onChange={(e) => handleNightChargeChange(category, "multiplier", e.target.value)}
                                        className="mt-1 border-blue-200 focus:border-blue-500"
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium flex items-center text-gray-700">
                                        <Clock className="mr-1 h-4 w-4 text-blue-500" />
                                        Start Time
                                    </Label>
                                    <Input
                                        type="number"
                                        value={data.nightCharges?.startTime || ""}
                                        onChange={(e) => handleNightChargeChange(category, "startTime", e.target.value)}
                                        className="mt-1 border-blue-200 focus:border-blue-500"
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium flex items-center text-gray-700">
                                        <Clock className="mr-1 h-4 w-4 text-blue-500" />
                                        End Time
                                    </Label>
                                    <Input
                                        type="number"
                                        value={data.nightCharges?.endTime || ""}
                                        onChange={(e) => handleNightChargeChange(category, "endTime", e.target.value)}
                                        className="mt-1 border-blue-200 focus:border-blue-500"
                                        onWheel={(e) => e.target.blur()}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border border-blue-100 rounded-md p-4 bg-white">
                            <h3 className="text-lg font-semibold mb-4 border-b border-blue-100 pb-2 flex items-center">
                                <Route className="mr-2 h-5 w-5 text-blue-600" />
                                Distance Ranges
                            </h3>
                            <div className="space-y-4">
                                {data.distanceRanges?.map((range, index) => (
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-2 bg-blue-50/50 rounded-md">
                                        <div>
                                            <Label className="text-sm font-medium flex items-center text-gray-700">
                                                <Ruler className="mr-1 h-4 w-4 text-blue-500" />
                                                Min Distance
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={range.minDistance}
                                                onChange={(e) => handleDistanceRangeChange(category, index, "minDistance", e.target.value)}
                                                className="mt-1 border-blue-200 focus:border-blue-500"
                                                onWheel={(e) => e.target.blur()}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium flex items-center text-gray-700">
                                                <Ruler className="mr-1 h-4 w-4 text-blue-500" />
                                                Max Distance
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={range.maxDistance}
                                                onChange={(e) => handleDistanceRangeChange(category, index, "maxDistance", e.target.value)}
                                                className="mt-1 border-blue-200 focus:border-blue-500"
                                                onWheel={(e) => e.target.blur()}
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-sm font-medium flex items-center text-gray-700">
                                                <DollarSign className="mr-1 h-4 w-4 text-blue-500" />
                                                Price Per Km
                                            </Label>
                                            <Input
                                                type="number"
                                                step="0.1"
                                                value={range.pricePerKm}
                                                onChange={(e) => handleDistanceRangeChange(category, index, "pricePerKm", e.target.value)}
                                                className="mt-1 border-blue-200 focus:border-blue-500"
                                                onWheel={(e) => e.target.blur()}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {saveStatus.type && (
                            <div className={`py-2 px-4 rounded-md flex items-center ${saveStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                                saveStatus.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {saveStatus.type === 'success' ? <Check className="h-4 w-4 mr-2" /> :
                                    saveStatus.type === 'warning' ? <AlertCircle className="h-4 w-4 mr-2" /> :
                                        <AlertCircle className="h-4 w-4 mr-2" />}
                                {saveStatus.message}
                            </div>
                        )}

                        <Button
                            className="w-full bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                            onClick={() => {
                                if (validateDistanceRanges(category)) {
                                    handleSave(category);
                                }
                            }}
                            disabled={loading || !changedFields[category] || Object.keys(changedFields[category]).length === 0}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="min-h-screen bg-blue-50/50">
            <SideNavbar />
            <div className="pl-[250px] px-4 py-6">
                <h1 className="text-2xl font-bold text-center mb-6  flex items-center justify-center">
                    FARE PRICING MANAGEMENT
                </h1>

                {loading && !Object.keys(pricingData).length ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-2" />
                        <span className="text-lg text-blue-600">Loading pricing data...</span>
                    </div>
                ) : (
                    <div className="max-w-4xl mx-auto">
                        <Tabs
                            defaultValue={selectedCategory}
                            onValueChange={setSelectedCategory}
                            className="w-full"
                        >
                            <TabsList className="grid grid-cols-3 mb-6 bg-blue-100">
                                <TabsTrigger value={VEHICLE_TYPES.AUTO} className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center">
                                    <Car className="mr-2 h-4 w-4" />
                                    Auto
                                </TabsTrigger>
                                <TabsTrigger value={VEHICLE_TYPES.HATCHBACK} className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center">
                                    <Car className="mr-2 h-4 w-4" />
                                    Hatchback
                                </TabsTrigger>
                                <TabsTrigger value={VEHICLE_TYPES.SEDAN} className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center">
                                    <Car className="mr-2 h-4 w-4" />
                                    Sedan
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value={VEHICLE_TYPES.AUTO}>
                                {renderPricingForm(VEHICLE_TYPES.AUTO)}
                            </TabsContent>

                            <TabsContent value={VEHICLE_TYPES.HATCHBACK}>
                                {renderPricingForm(VEHICLE_TYPES.HATCHBACK)}
                            </TabsContent>

                            <TabsContent value={VEHICLE_TYPES.SEDAN}>
                                {renderPricingForm(VEHICLE_TYPES.SEDAN)}
                            </TabsContent>
                        </Tabs>
                    </div>
                )}
            </div>
        </div>
    );
}