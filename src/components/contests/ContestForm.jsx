import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ArrowLeft, Plus, X, Save, ChevronDown, ChevronUp, Search } from "lucide-react";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const ContestForm = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = Boolean(id);

    const [loading, setLoading] = useState(isEditing);
    const [submitting, setSubmitting] = useState(false);
    const [cities, setCities] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        startDate: '',
        endDate: '',
        city: '',
        rewardList: {}
    });

    // For new reward entries
    const [newRewardKey, setNewRewardKey] = useState('');
    const [newRewardValue, setNewRewardValue] = useState('');
    const [rewardError, setRewardError] = useState('');
    const [showAllRewards, setShowAllRewards] = useState(false);
    const [rewardFilter, setRewardFilter] = useState('');

    useEffect(() => {
        fetchCities();
        if (isEditing) {
            fetchContest();
        }
    }, [id]);

    const fetchCities = async () => {
        try {
            const response = await axios.get('https://3n8qx2vb-8055.inc1.devtunnels.ms/admin/city');
            setCities(response.data);
        } catch (error) {
            console.error('Error fetching cities:', error);
            toast({
                title: "Error",
                description: "Failed to load cities",
                variant: "destructive"
            });
        }
    };

    const fetchContest = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://3n8qx2vb-8055.inc1.devtunnels.ms/api/contest/${id}`);
            const contestData = response.data.data;
            setFormData({
                title: contestData.title,
                startDate: contestData.startDate?.split('T')[0] || '',
                endDate: contestData.endDate?.split('T')[0] || '',
                city: contestData.city?._id || contestData.city,
                rewardList: contestData.rewardList || {}
            });
        } catch (error) {
            console.error('Error fetching contest:', error);
            toast({
                title: "Error",
                description: "Failed to load contest data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCityChange = (value) => {
        setFormData(prev => ({ ...prev, city: value }));
    };

    const addReward = () => {
        // Clear previous error
        setRewardError('');

        // Validate inputs
        if (!newRewardKey.trim() && !newRewardValue.trim()) {
            setRewardError("Both reward key and value cannot be empty");
            return;
        }

        if (!newRewardKey.trim()) {
            setRewardError("Reward key cannot be empty");
            return;
        }

        if (!newRewardValue.trim()) {
            setRewardError("Reward value cannot be empty");
            return;
        }

        // Check for duplicate keys
        if (formData.rewardList.hasOwnProperty(newRewardKey.trim())) {
            setRewardError("A reward with this key already exists");
            return;
        }

        // Add new reward
        setFormData(prev => ({
            ...prev,
            rewardList: {
                ...prev.rewardList,
                [newRewardKey.trim()]: newRewardValue.trim()
            }
        }));

        // Clear inputs
        setNewRewardKey('');
        setNewRewardValue('');
    };

    const removeReward = (key) => {
        const updatedRewards = { ...formData.rewardList };
        delete updatedRewards[key];
        setFormData(prev => ({ ...prev, rewardList: updatedRewards }));
    };

    const validateForm = () => {
        // Check if required fields are filled
        if (!formData.title.trim()) {
            toast({
                title: "Validation Error",
                description: "Title is required",
                variant: "destructive"
            });
            return false;
        }

        if (!formData.startDate) {
            toast({
                title: "Validation Error",
                description: "Start date is required",
                variant: "destructive"
            });
            return false;
        }

        if (!formData.endDate) {
            toast({
                title: "Validation Error",
                description: "End date is required",
                variant: "destructive"
            });
            return false;
        }

        if (!formData.city) {
            toast({
                title: "Validation Error",
                description: "City is required",
                variant: "destructive"
            });
            return false;
        }

        // Check if start date is before end date
        if (new Date(formData.startDate) > new Date(formData.endDate)) {
            toast({
                title: "Validation Error",
                description: "Start date must be before end date",
                variant: "destructive"
            });
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Clear any existing reward error
        setRewardError('');

        // Check if new reward is partially filled but not added
        if ((newRewardKey.trim() && !newRewardValue.trim()) || (!newRewardKey.trim() && newRewardValue.trim())) {
            setRewardError("Please add or clear the reward fields before submitting");
            return;
        }

        // Validate form
        if (!validateForm()) {
            return;
        }

        try {
            setSubmitting(true);
            const payload = {
                ...formData,
                city: formData.city
            };

            if (isEditing) {
                await axios.put(`https://3n8qx2vb-8055.inc1.devtunnels.ms/api/contest/${id}`, payload);
                toast({
                    title: "Success",
                    description: "Contest updated successfully"
                });
            } else {
                await axios.post('https://3n8qx2vb-8055.inc1.devtunnels.ms/api/contest/', payload);
                console.log(payload, "payload im sending to create contest")
                toast({
                    title: "Success",
                    description: "Contest created successfully"
                });
            }

            navigate('/contests');
        } catch (error) {
            console.error('Error saving contest:', error);
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to save contest",
                variant: "destructive"
            });
        } finally {
            setSubmitting(false);
        }
    };

    const filteredRewards = Object.entries(formData.rewardList).filter(([key]) =>
        key.toLowerCase().includes(rewardFilter.toLowerCase())
    );

    const rewardCount = Object.keys(formData.rewardList).length;
    const displayedRewards = showAllRewards || rewardFilter
        ? filteredRewards
        : filteredRewards.slice(0, 5);

    if (loading) {
        return (
            <div className="container mx-auto py-12 flex justify-center">
                <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
        );
    }

    return (
        <div className="mx-16 py-6">
            <div className="mb-6 flex items-center">
                <Button variant="ghost" onClick={() => navigate('/contests')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Contests
                </Button>
            </div>

            <form onSubmit={handleSubmit}>
                <Card>
                    <CardHeader>
                        <CardTitle>{isEditing ? 'Edit Contest' : 'Create New Contest'}</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="Contest Title"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="city">City</Label>
                                <Select
                                    name="city"
                                    value={formData.city}
                                    onValueChange={handleCityChange}
                                    required
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select City" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {cities.map(city => (
                                            <SelectItem key={city._id} value={city._id}>
                                                {city.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    name="startDate"
                                    type="date"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    name="endDate"
                                    type="date"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-lg font-medium">Rewards ({rewardCount})</h3>
                                {rewardCount > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <div className="relative">
                                            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Search rewards..."
                                                className="pl-8 h-9 w-64"
                                                value={rewardFilter}
                                                onChange={(e) => setRewardFilter(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Rewards List */}
                            <div className="space-y-2">
                                {rewardCount === 0 ? (
                                    <p className="text-sm text-muted-foreground">No rewards added yet.</p>
                                ) : (
                                    <>
                                        <ScrollArea className="h-auto max-h-64 overflow-auto">
                                            <div className="space-y-2">
                                                {displayedRewards.map(([key, value]) => (
                                                    <div key={key} className="flex items-center gap-2 p-3 border rounded-md">
                                                        <div className="flex-1 font-medium">{key}</div>
                                                        <div className="flex-1">{value}</div>
                                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeReward(key)}>
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </ScrollArea>

                                        {rewardCount > 5 && !rewardFilter && (
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                className="w-full"
                                                onClick={() => setShowAllRewards(!showAllRewards)}
                                            >
                                                {showAllRewards ? (
                                                    <>
                                                        <ChevronUp className="mr-2 h-4 w-4" />
                                                        Show Less
                                                    </>
                                                ) : (
                                                    <>
                                                        <ChevronDown className="mr-2 h-4 w-4" />
                                                        Show All ({rewardCount - 5} more)
                                                    </>
                                                )}
                                            </Button>
                                        )}

                                        {rewardFilter && filteredRewards.length === 0 && (
                                            <p className="text-sm text-muted-foreground">No rewards match your search.</p>
                                        )}
                                    </>
                                )}
                            </div>

                            {/* New Reward */}
                            <div className="grid grid-cols-3 gap-4 items-end">
                                <div>
                                    <Label htmlFor="newRewardKey">Reward Key</Label>
                                    <Input
                                        id="newRewardKey"
                                        value={newRewardKey}
                                        onChange={(e) => setNewRewardKey(e.target.value)}
                                        placeholder="e.g., First Place"
                                        className={rewardError && !newRewardKey.trim() ? "border-red-500" : ""}
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="newRewardValue">Reward Value</Label>
                                    <Input
                                        id="newRewardValue"
                                        value={newRewardValue}
                                        onChange={(e) => setNewRewardValue(e.target.value)}
                                        placeholder="e.g., Rs.100 or 500 points"
                                        className={rewardError && !newRewardValue.trim() ? "border-red-500" : ""}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    size="sm"
                                    className='w-32'
                                    onClick={addReward}
                                >
                                    Add Reward
                                </Button>
                            </div>

                            {rewardError && (
                                <p className="text-sm text-red-500">{rewardError}</p>
                            )}


                        </div>
                    </CardContent>

                    <CardFooter className="flex justify-end space-x-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => navigate('/contests')}
                            disabled={submitting}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {isEditing ? 'Updating...' : 'Creating...'}
                                </>
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    {isEditing ? 'Update Contest' : 'Create Contest'}
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
};

export default ContestForm;