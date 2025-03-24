import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
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
    Bike,
    MapPin,
    ToggleLeft,
    Info,
    RefreshCw,
    Trash2,
    Plus,
    AlarmClock,
    Building2,
    Settings,
    BarChart3,
    HelpCircle,
} from "lucide-react";

export default function FarePricing() {
    const [pricingData, setPricingData] = useState({});
    const [changedFields, setChangedFields] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [saveStatus, setSaveStatus] = useState({ type: null, message: null });
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [cityLoading, setCityLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState({});
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchCities();
    }, []);

    useEffect(() => {
        if (selectedCity) {
            setLoading(true);
            fetchPricingData(selectedCity);
        }
    }, [selectedCity]);

    const fetchCities = async () => {
        setCityLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`https://airshare.co.in/admin/city`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCities(response.data);
            if (response.data.length > 0) {
                setSelectedCity(response.data[0]._id);
            }
        } catch (error) {
            console.error("Error fetching cities:", error);
        } finally {
            setCityLoading(false);
        }
    };

    const fetchPricingData = async (cityId) => {
        setLoading(true);
        setRefreshing(true);
        try {
            // const response = await axios.get(`https://airshare.co.in/pricing`);
            const response = await axios.get(`https://suuper.in/pricing?cityId=${selectedCity}`);
            const data = response.data.data;
            console.log("Pricing data:", data);

            // Extract all unique vehicle types
            const types = [...new Set(data.map(item => item.vehicleType))];
            setVehicleTypes(types);

            // Create formatted data object
            const formattedData = {};
            types.forEach(type => {
                const vehicleData = data.find(item => item.vehicleType === type);
                if (vehicleData) {
                    formattedData[type.toLowerCase()] = vehicleData;
                }
            });

            setPricingData(formattedData);
            
            // Set initial selected category if available
            if (types.length > 0 && !selectedCategory) {
                setSelectedCategory(types[0].toLowerCase());
            } else if (!types.includes(selectedCategory.toUpperCase())) {
                setSelectedCategory(types[0].toLowerCase());
            }
            
            setChangedFields({});
        } catch (error) {
            console.error("Error fetching pricing data:", error);
        } finally {
            setLoading(false);
            setTimeout(() => setRefreshing(false), 600); // Add slight delay for animation
        }
    };

    const refreshData = () => {
        if (selectedCity) {
            fetchPricingData(selectedCity);
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

    const handleToggleActive = async (category, currentStatus) => {
        // Set loading state for specific category
        setLoadingCategories(prev => ({ ...prev, [category.toLowerCase()]: true }));
        
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `https://suuper.in/pricing/${category.toUpperCase()}?cityId=${selectedCity}`,
                { isActive: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Update local state
            setPricingData((prev) => ({
                ...prev,
                [category.toLowerCase()]: {
                    ...prev[category.toLowerCase()],
                    isActive: !currentStatus,
                },
            }));
            
            setSaveStatus({
                type: "success",
                message: `${category} is now ${!currentStatus ? 'active' : 'inactive'}`
            });
            setTimeout(() => setSaveStatus({ type: null, message: null }), 3000);
        } catch (error) {
            console.error("Error toggling status:", error);
            setSaveStatus({
                type: "error",
                message: `Failed to update ${category} status`
            });
            setTimeout(() => setSaveStatus({ type: null, message: null }), 3000);
            
            // Revert the toggle since it failed
            setPricingData((prev) => ({
                ...prev,
                [category.toLowerCase()]: {
                    ...prev[category.toLowerCase()],
                    isActive: currentStatus, // Revert to original status
                },
            }));
        } finally {
            setLoadingCategories(prev => ({ ...prev, [category.toLowerCase()]: false }));
        }
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
                `https://suuper.in/pricing/${category.toUpperCase()}?cityId=${selectedCity}`,
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
        switch (category.toUpperCase()) {
            case "AUTO":
                return <Car className="mr-2 h-5 w-5 text-blue-500" />;
            case "HATCHBACK":
                return <Car className="mr-2 h-5 w-5 text-blue-500" />;
            case "SEDAN":
                return <Car className="mr-2 h-5 w-5 text-blue-500" />;
            case "BIKE":
                return <Bike className="mr-2 h-5 w-5 text-blue-500" />;
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

    const getStatusDot = (isActive) => {
        return (
            <div className={`h-3 w-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-blue-500'} shadow-sm mr-2 transition-all duration-300`}></div>
        );
    };

    const renderPricingForm = (category) => {
        const data = pricingData[category];

        if (!data) return null;

        const isCategoryLoading = loadingCategories[category] || false;
        const hasChanges = changedFields[category] && Object.keys(changedFields[category]).length > 0;

        return (
            <Card className="shadow-md border-blue-100">
                <CardHeader className="border-b bg-blue-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            {getVehicleIcon(category)}
                            <CardTitle className="text-xl">{category.toUpperCase()} Pricing Configuration</CardTitle>
                        </div>
                        <div className="flex items-center space-x-2">
                            {isCategoryLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            ) : (
                                <div className="flex items-center">
                                    <div className="flex items-center mr-3">
                                        {getStatusDot(data.isActive)}
                                        <span className={`text-sm font-medium ${data.isActive ? 'text-green-600' : 'text-blue-500'}`}>
                                            {data.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                    <Switch
                                        id={`active-${category}`}
                                        checked={data.isActive}
                                        onCheckedChange={() => handleToggleActive(category, data.isActive)}
                                        disabled={isCategoryLoading}
                                        className={data.isActive ? "data-[state=checked]:bg-green-500" : ""}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                    <CardDescription>Adjust pricing parameters for {category} vehicles</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <div className="space-y-6">
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
                                    <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-blue-50/50 rounded-md border border-blue-100/50">
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
                <h1 className="text-2xl font-bold text-center mb-6 flex items-center justify-center">
                    <Route className="mr-2 h-6 w-6 text-blue-600" />
                    FARE PRICING MANAGEMENT
                </h1>

                <div className="max-w-4xl mx-auto mb-6">
                    <Card className="shadow-lg border-blue-100 overflow-hidden">
                        <CardContent className="p-0">
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center text-white">
                                <Building2 className="h-5 w-5 mr-2" />
                                <h2 className="text-lg font-semibold">City Selection</h2>
                            </div>
                            <div className="p-4 bg-white">
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <div className="flex items-center min-w-[150px]">
                                        <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                                        <Label htmlFor="city-select" className="font-medium text-blue-700">
                                            Select City:
                                        </Label>
                                    </div>
                                    <div className="flex-1 w-full">
                                        <Select
                                            value={selectedCity}
                                            onValueChange={setSelectedCity}
                                            disabled={cityLoading || cities.length === 0}
                                        >
                                            <SelectTrigger id="city-select" className="w-full border-blue-200 focus:border-blue-500 bg-blue-50/50">
                                                {cityLoading ? (
                                                    <div className="flex items-center">
                                                        <Loader2 className="h-4 w-4 animate-spin mr-2 text-blue-500" />
                                                        <span>Loading cities...</span>
                                                    </div>
                                                ) : (
                                                    <SelectValue placeholder="Select a city" />
                                                )}
                                            </SelectTrigger>
                                            <SelectContent>
                                                {cities.map((city) => (
                                                    <SelectItem key={city._id} value={city._id}>
                                                        <div className="flex items-center">
                                                            {getStatusDot(city.isActive)}
                                                            <span className="font-medium">{city.name}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button 
                                        variant="outline"
                                        size="sm"
                                        onClick={refreshData}
                                        disabled={loading || refreshing || !selectedCity}
                                        className="min-w-[100px] border-blue-200 text-blue-700 hover:bg-blue-50"
                                    >
                                        <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                                        Refresh
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-2" />
                        <span className="text-lg text-blue-600">Loading pricing data...</span>
                    </div>
                ) : vehicleTypes.length > 0 ? (
                    <div className="max-w-4xl mx-auto">
                        <Tabs
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                            className="w-full"
                        >
                            <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 mb-6 bg-blue-100">
                                {vehicleTypes.map(type => {
                                    const isActive = pricingData[type.toLowerCase()]?.isActive;
                                    return (
                                        <TabsTrigger 
                                            key={type} 
                                            value={type.toLowerCase()} 
                                            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white flex items-center"
                                        >
                                            <div className="flex items-center">
                                                {getStatusDot(isActive)}
                                                {type === "BIKE" ? (
                                                    <Bike className="mr-2 h-4 w-4" />
                                                ) : (
                                                    <Car className="mr-2 h-4 w-4" />
                                                )}
                                                {type}
                                            </div>
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>

                            {vehicleTypes.map(type => (
                                <TabsContent key={type} value={type.toLowerCase()}>
                                    {renderPricingForm(type.toLowerCase())}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                ) : (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <p className="text-lg text-gray-700">No pricing data found for this city.</p>
                            <p className="text-md text-gray-500 mt-2">Please select a different city or add pricing data.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}