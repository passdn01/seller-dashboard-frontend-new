import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import axios from "axios";
import SideNavbar from "../SideNavbar";
import {
    Car,
    Loader2,
    Route,
    MapPin,
    Building2,
    RefreshCw,
    AlertCircle,
    Plus,
    Edit,
    Bike,
    CheckCircle,
    Gauge,
    Ruler,
    Calculator,
    Moon, // Added missing import
} from "lucide-react";
import CreatePricing from "./CreatePricing";
import UpdatePricing from "./UpdatePricing";

export default function FarePricing() {
    const [pricingData, setPricingData] = useState({});
    const [loading, setLoading] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [saveStatus, setSaveStatus] = useState({ type: null, message: null });
    const [cities, setCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState("");
    const [vehicleTypes, setVehicleTypes] = useState([]);
    const [cityLoading, setCityLoading] = useState(false);
    const [loadingCategories, setLoadingCategories] = useState({});
    const [refreshing, setRefreshing] = useState(false);
    const [mode, setMode] = useState("view"); // view, create, update
    const [selectedVehicleForUpdate, setSelectedVehicleForUpdate] = useState(null);

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
            const response = await axios.get(`https://suuper.in/pricing?cityId=${cityId}`);
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
            setMode("view");
            setSelectedVehicleForUpdate(null);
        }
    };

    const handleToggleActive = async (category, field, currentStatus) => {
        // Set loading state for specific category
        setLoadingCategories(prev => ({ ...prev, [category.toLowerCase()]: true }));
        
        try {
            const token = localStorage.getItem("token");
            await axios.patch(
                `https://suuper.in/pricing/${category.toUpperCase()}?cityId=${selectedCity}`,
                { [field]: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            // Update local state
            setPricingData((prev) => ({
                ...prev,
                [category.toLowerCase()]: {
                    ...prev[category.toLowerCase()],
                    [field]: !currentStatus,
                },
            }));
            
            setSaveStatus({
                type: "success",
                message: `${category} is now ${field === "isActive" ? 
                    (!currentStatus ? 'active' : 'inactive') : 
                    (!currentStatus ? 'coming soon' : 'not coming soon')}`
            });
            setTimeout(() => setSaveStatus({ type: null, message: null }), 3000);
        } catch (error) {
            console.error(`Error toggling ${field}:`, error);
            setSaveStatus({
                type: "error",
                message: `Failed to update ${category} ${field === "isActive" ? "status" : "coming soon status"}`
            });
            setTimeout(() => setSaveStatus({ type: null, message: null }), 3000);
            
            // Revert the toggle since it failed
            setPricingData((prev) => ({
                ...prev,
                [category.toLowerCase()]: {
                    ...prev[category.toLowerCase()],
                    [field]: currentStatus, // Revert to original status
                },
            }));
        } finally {
            setLoadingCategories(prev => ({ ...prev, [category.toLowerCase()]: false }));
        }
    };

    const handleCreateClick = () => {
        setMode("create");
    };

    const handleUpdateClick = (vehicleType) => {
        setSelectedVehicleForUpdate(pricingData[vehicleType.toLowerCase()]);
        setMode("update");
    };

    const handleCancelForm = () => {
        setMode("view");
        setSelectedVehicleForUpdate(null);
    };

    const handleFormSubmitSuccess = () => {
        refreshData();
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
            case "SUV":
                return <Car className="mr-2 h-5 w-5 text-blue-500" />;
            case "BIKE":
                return <Bike className="mr-2 h-5 w-5 text-blue-500" />;
            default:
                return <Car className="mr-2 h-5 w-5 text-blue-500" />;
        }
    };

    const getStatusDot = (isActive) => {
        return (
            <div className={`h-3 w-3 rounded-full ${isActive ? 'bg-green-500' : 'bg-blue-500'} shadow-sm mr-2 transition-all duration-300`}></div>
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
                            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-4 flex items-center justify-between text-white">
                                <div className="flex items-center">
                                    <Building2 className="h-5 w-5 mr-2" />
                                    <h2 className="text-lg font-semibold">City Selection</h2>
                                </div>
                                {mode === "view" && (
                                    <Button 
                                        variant="secondary" 
                                        size="sm" 
                                        className="bg-green-500 hover:bg-green-600 text-white"
                                        onClick={handleCreateClick}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create New Pricing
                                    </Button>
                                )}
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
                                            disabled={cityLoading || cities.length === 0 || mode !== "view"}
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
                                        disabled={loading || refreshing || !selectedCity || mode !== "view"}
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

                {mode === "create" && (
                    <div className="max-w-4xl mx-auto">
                        <CreatePricing 
                            cityId={selectedCity} 
                            onCancel={handleCancelForm} 
                            onSuccess={handleFormSubmitSuccess}
                            existingVehicleTypes={vehicleTypes}
                            cities={cities}
                        />
                    </div>
                )}

                {mode === "update" && selectedVehicleForUpdate && (
                    <div className="max-w-4xl mx-auto">
                        <UpdatePricing 
                            cityId={selectedCity} 
                            vehicleData={selectedVehicleForUpdate} 
                            onCancel={handleCancelForm} 
                            onSuccess={handleFormSubmitSuccess}
                            cities={cities}
                        />
                    </div>
                )}

                {mode === "view" && loading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-2" />
                        <span className="text-lg text-blue-600">Loading pricing data...</span>
                    </div>
                ) : mode === "view" && vehicleTypes.length > 0 ? (
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
                                    <Card className="shadow-md border-blue-100">
                                        <CardHeader className="border-b bg-blue-50 flex flex-row items-center justify-between">
                                            <div className="flex items-center">
                                                {getVehicleIcon(type)}
                                                <div>
                                                    <CardTitle className="text-xl">{type.toUpperCase()} Pricing Configuration</CardTitle>
                                                    <CardDescription>Pricing parameters for {type} vehicles</CardDescription>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center">
                                                        {loadingCategories[type.toLowerCase()] ? (
                                                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                        ) : (
                                                            <div className="flex items-center">
                                                                <div className="flex items-center mr-3">
                                                                    {getStatusDot(pricingData[type.toLowerCase()]?.isActive)}
                                                                    <span className={`text-sm font-medium ${pricingData[type.toLowerCase()]?.isActive ? 'text-green-600' : 'text-blue-500'}`}>
                                                                        {pricingData[type.toLowerCase()]?.isActive ? 'Active' : 'Inactive'}
                                                                    </span>
                                                                </div>
                                                                <Switch
                                                                    id={`active-${type}`}
                                                                    checked={pricingData[type.toLowerCase()]?.isActive}
                                                                    onCheckedChange={() => handleToggleActive(type, "isActive", pricingData[type.toLowerCase()]?.isActive)}
                                                                    disabled={loadingCategories[type.toLowerCase()]}
                                                                    className={pricingData[type.toLowerCase()]?.isActive ? "data-[state=checked]:bg-green-500" : ""}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    <div className="flex items-center ml-4">
                                                        <div className="flex items-center mr-3">
                                                            <div className={`h-3 w-3 rounded-full ${pricingData[type.toLowerCase()]?.isComingSoon ? 'bg-yellow-500' : 'bg-gray-400'} shadow-sm mr-2 transition-all duration-300`}></div>
                                                            <span className={`text-sm font-medium ${pricingData[type.toLowerCase()]?.isComingSoon ? 'text-yellow-600' : 'text-gray-500'}`}>
                                                                {pricingData[type.toLowerCase()]?.isComingSoon ? 'Coming Soon' : 'Not Coming Soon'}
                                                            </span>
                                                        </div>
                                                        <Switch
                                                            id={`coming-soon-${type}`}
                                                            checked={pricingData[type.toLowerCase()]?.isComingSoon || false}
                                                            onCheckedChange={() => handleToggleActive(type, "isComingSoon", pricingData[type.toLowerCase()]?.isComingSoon || false)}
                                                            disabled={loadingCategories[type.toLowerCase()]}
                                                            className={pricingData[type.toLowerCase()]?.isComingSoon ? "data-[state=checked]:bg-yellow-500" : ""}
                                                        />
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleUpdateClick(type)}
                                                    className="border-blue-200 text-blue-700 hover:bg-blue-50"
                                                >
                                                    <Edit className="mr-2 h-4 w-4" />
                                                    Edit
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="pt-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Basic Pricing Card */}
                                                <div className="border border-blue-100 rounded-lg shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
                                                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 border-b border-blue-100">
                                                    <h3 className="text-lg font-semibold flex items-center text-blue-800">
                                                        {/* <DollarSign className="mr-2 h-5 w-5 text-blue-600" /> */}
                                                        ₹
                                                        Basic Pricing
                                                    </h3>
                                                    </div>
                                                    <div className="p-5">
                                                    <div className="space-y-4">
                                                        <div className="flex items-center p-2 hover:bg-blue-50 rounded-md transition-colors duration-200">
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 flex-shrink-0">
                                                            {/* <DollarSign className="h-5 w-5 text-blue-600" /> */}
                                                            ₹
                                                        </div>
                                                        <div className="ml-4 flex-1">
                                                            <span className="text-sm text-gray-500">Base Fare</span>
                                                            <div className="text-lg font-semibold text-blue-800">{pricingData[type.toLowerCase()]?.baseFare}</div>
                                                        </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center p-2 hover:bg-blue-50 rounded-md transition-colors duration-200">
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 flex-shrink-0">
                                                            <Calculator className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div className="ml-4 flex-1">
                                                            <span className="text-sm text-gray-500">Minimum Fare</span>
                                                            <div className="text-lg font-semibold text-blue-800">₹{pricingData[type.toLowerCase()]?.minimumFare}</div>
                                                        </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center p-2 hover:bg-blue-50 rounded-md transition-colors duration-200">
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 flex-shrink-0">
                                                            <Ruler className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div className="ml-4 flex-1">
                                                            <span className="text-sm text-gray-500">Base Distance</span>
                                                            <div className="text-lg font-semibold text-blue-800">{pricingData[type.toLowerCase()]?.baseDistance} km</div>
                                                        </div>
                                                        </div>
                                                        
                                                        <div className="flex items-center p-2 hover:bg-blue-50 rounded-md transition-colors duration-200">
                                                        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 flex-shrink-0">
                                                            <Gauge className="h-5 w-5 text-blue-600" />
                                                        </div>
                                                        <div className="ml-4 flex-1">
                                                            <span className="text-sm text-gray-500">Price Buffer</span>
                                                            <div className="text-lg font-semibold text-blue-800">{pricingData[type.toLowerCase()]?.maxPriceBuffer}%</div>
                                                        </div>
                                                        </div>
                                                    </div>
                                                    </div>
                                                </div>

                                                {/* Night Charges Card */}
                                                <div className="border border-blue-100 rounded-lg shadow-sm overflow-hidden bg-white hover:shadow-md transition-shadow duration-300">
                                                    <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-4 border-b border-blue-100">
                                                    <h3 className="text-lg font-semibold flex items-center text-indigo-800">
                                                        <Moon className="mr-2 h-5 w-5 text-indigo-600" />
                                                        Night Charges
                                                    </h3>
                                                    </div>
                                                    <div className="p-5">
                                                    <div className="flex items-center justify-center mb-6">
                                                        <div className="w-20 h-20 rounded-full bg-indigo-100 border-4 border-indigo-200 flex items-center justify-center">
                                                        <div className="text-2xl font-bold text-indigo-800">{pricingData[type.toLowerCase()]?.nightCharges?.multiplier}x</div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="relative pt-5">
                                                        <div className="h-2 bg-indigo-100 rounded-full w-full mb-8">
                                                        <div className="absolute -top-2 left-0 w-4 h-4 rounded-full bg-indigo-600"></div>
                                                        <div className="absolute -top-2 right-0 w-4 h-4 rounded-full bg-indigo-600"></div>
                                                        </div>
                                                        
                                                        <div className="flex justify-between items-center text-center">
                                                        <div className="flex-1">
                                                            <div className="text-xl font-semibold text-indigo-800">
                                                            {pricingData[type.toLowerCase()]?.nightCharges?.startTime}:00
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">Start Time</div>
                                                        </div>
                                                        
                                                        <div className="w-16">
                                                            <div className="h-10 w-px bg-indigo-200 mx-auto"></div>
                                                        </div>
                                                        
                                                        <div className="flex-1">
                                                            <div className="text-xl font-semibold text-indigo-800">
                                                            {pricingData[type.toLowerCase()]?.nightCharges?.endTime}:00
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1">End Time</div>
                                                        </div>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="mt-5 pt-4 border-t border-indigo-100 text-xs text-center text-gray-500">
                                                        Night charges apply between these hours
                                                    </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="mt-6 border border-blue-100 rounded-md p-4 bg-white">
                                                <h3 className="text-lg font-semibold mb-4 border-b border-blue-100 pb-2">
                                                    Distance Ranges
                                                </h3>
                                                <div className="overflow-x-auto">
                                                    <div className="bg-white rounded-md border border-blue-100 shadow-sm">
                                                        <div className="p-4 border-b border-blue-100">
                                                        <h4 className="font-semibold text-blue-700 flex items-center">
                                                            <Route className="h-4 w-4 mr-2" />
                                                            Distance-Based Pricing Tiers
                                                        </h4>
                                                        <p className="text-sm text-gray-500 mt-1">Rates vary based on distance traveled</p>
                                                        </div>
                                                        
                                                        <div className="p-4">
                                                        {pricingData[type.toLowerCase()]?.distanceRanges?.map((range, index) => (
                                                            <div key={index} className={`flex items-center mb-3 ${index !== 0 ? 'pt-3 border-t border-blue-50' : ''}`}>
                                                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-100 text-blue-700 font-bold flex-shrink-0">
                                                                {index + 1}
                                                            </div>
                                                            <div className="flex-1 ml-4">
                                                                <div className="flex justify-between items-center">
                                                                <span className="text-sm font-medium text-gray-700">Range {index + 1}</span>
                                                                <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-semibold">
                                                                    ₹{range.pricePerKm}/km
                                                                </span>
                                                                </div>
                                                                <div className="relative mt-2 mb-1">
                                                                <div className="h-2 bg-blue-100 rounded-full w-full"></div>
                                                                <div 
                                                                    className="absolute top-0 h-2 bg-blue-500 rounded-full" 
                                                                    style={{ 
                                                                    left: '0%', 
                                                                    width: '100%', 
                                                                    background: 'linear-gradient(90deg, #3b82f6 0%, #60a5fa 100%)' 
                                                                    }}
                                                                ></div>
                                                                </div>
                                                                <div className="flex justify-between text-md text-gray-500">
                                                                <span>{range.minDistance} km</span>
                                                                <span>{range.maxDistance} km</span>
                                                                </div>
                                                            </div>
                                                            </div>
                                                        ))}
                                                        </div>
                                                        
                                                        <div className="bg-blue-50 p-3 border-t border-blue-100 text-xs text-gray-600">
                                                        <div className="flex items-center">
                                                            <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                                                            <span>Price increases based on distance traveled</span>
                                                        </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            ))}
                        </Tabs>
                    </div>
                ) : mode === "view" && (
                    <div className="flex justify-center items-center h-64">
                        <div className="text-center">
                            <AlertCircle className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                            <p className="text-lg text-gray-700">No pricing data found for this city.</p>
                            <p className="text-md text-gray-500 mt-2">Please select a different city or add pricing data.</p>
                        </div>
                    </div>
                )}

                {saveStatus.type && (
                    <div className="fixed bottom-4 right-4 max-w-md">
                        <div className={`py-2 px-4 rounded-md flex items-center shadow-lg ${
                            saveStatus.type === 'success' ? 'bg-green-100 text-green-800' :
                            saveStatus.type === 'warning' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                            {saveStatus.type === 'success' ? <CheckCircle className="h-4 w-4 mr-2" /> :
                                <AlertCircle className="h-4 w-4 mr-2" />}
                            {saveStatus.message}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}