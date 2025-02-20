import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import axios from "axios";
import SideNavbar from "../SideNavbar";

const categories = {
    AUTO: "auto",
    HATCHBACK: "hatchback",
    SEDAN: "sedan",
};

export default function FarePricing() {
    const [pricingData, setPricingData] = useState({});
    const [changedFields, setChangedFields] = useState({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchPricingData();
    }, []);

    const fetchPricingData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/api/pricing`);
            const data = response.data.data;

            const formattedData = {
                auto: data.find((item) => item.vehicleType === "AUTO") || null,
                hatchback: data.find((item) => item.vehicleType === "HATCHBACK") || null,
                sedan: data.find((item) => item.vehicleType === "SEDAN") || null,
            };

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

    const handleSave = async (category) => {

        if (!changedFields[category] || Object.keys(changedFields[category]).length === 0) {
            alert(`No changes detected for ${category}`);
            return;
        }

        try {
            setLoading(true)

            await axios.post(
                `${import.meta.env.VITE_SELLER_URL_LOCAL}/api/pricing/${category}`,
                changedFields[category]
            );
            alert(`Updated ${category} pricing successfully!`);
            setChangedFields((prev) => ({
                ...prev,
                [category]: {},
            }));
        } catch (error) {
            console.error("Error updating pricing:", error);
        } finally {
            setLoading(false)
        }
    };

    return (
        <div>
            <SideNavbar />
            <h1 className="text-2xl font-bold text-center mb-6 mt-4 pl-[250px]">FARE PRICING</h1>
            {loading ? <span className="pl-[250px] mx-auto">Loading...</span> : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-[250px] mx-4 py-4">
                    {Object.entries(categories).map(([key, category]) => {
                        const data = pricingData[category];
                        return (
                            data && (
                                <Card key={category}>
                                    <CardHeader>
                                        <CardTitle>{key}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <Label>Minimum Fare</Label>
                                                <Input
                                                    type="number"
                                                    value={data.minimumFare}
                                                    onChange={(e) =>
                                                        handleChange(category, "minimumFare", e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label>Base Fare</Label>
                                                <Input
                                                    type="number"
                                                    value={data.baseFare}
                                                    onChange={(e) =>
                                                        handleChange(category, "baseFare", e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label>Per Km After</Label>
                                                <Input
                                                    type="number"
                                                    value={data.perKmAfter}
                                                    onChange={(e) =>
                                                        handleChange(category, "perKmAfter", e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label>Base Distance</Label>
                                                <Input
                                                    type="number"
                                                    value={data.baseDistance}
                                                    onChange={(e) =>
                                                        handleChange(category, "baseDistance", e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <Label>Max Price Buffer</Label>
                                                <Input
                                                    type="number"
                                                    value={data.maxPriceBuffer}
                                                    onChange={(e) =>
                                                        handleChange(category, "maxPriceBuffer", e.target.value)
                                                    }
                                                />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-semibold mt-4">Night Charges</h2>
                                                <div>
                                                    <Label>Multiplier</Label>
                                                    <Input
                                                        type="number"
                                                        step="0.1"
                                                        value={data.nightCharges?.multiplier || ""}
                                                        onChange={(e) =>
                                                            handleNightChargeChange(
                                                                category,
                                                                "multiplier",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label>Start Time</Label>
                                                    <Input
                                                        type="number"
                                                        value={data.nightCharges?.startTime || ""}
                                                        onChange={(e) =>
                                                            handleNightChargeChange(
                                                                category,
                                                                "startTime",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                                <div>
                                                    <Label>End Time</Label>
                                                    <Input
                                                        type="number"
                                                        value={data.nightCharges?.endTime || ""}
                                                        onChange={(e) =>
                                                            handleNightChargeChange(
                                                                category,
                                                                "endTime",
                                                                e.target.value
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>
                                            <Button className="mt-4 w-full" onClick={() => handleSave(category)}>
                                                {loading ? "Saving..." : "Save"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            )
                        );
                    })}
                </div>
            )}
        </div>
    );
}
