import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User } from 'lucide-react';

const UserEditCard = ({ userData }) => {
    const [formData, setFormData] = useState({
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        dob: userData.dob || '',
        gender: userData.gender || '',
        email: userData.email || '',
        upi: userData.upi || '',
        phone: userData.phone || '',
        id: userData._id
    });
    const [isLoading, setIsLoading] = useState(false);

    const calculateWithdrawAmount = (coins) => {
        return (coins / 10).toFixed(2);
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleGenderChange = (value) => {
        setFormData(prev => ({
            ...prev,
            gender: value
        }));
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            const response = await fetch('https://55kqzrxn-6000.inc1.devtunnels.ms/dashboard/api/updateUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            const data = await response.json();
            alert('User details updated successfully!');
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user details');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="text-lg font-semibold mb-4 flex gap-x-6">
                <span>User Details</span>
                <span>
                    {userData.isActive ?
                        <span className='text-green-400'>ACTIVE</span> :
                        <span className='text-red-400'>NOT ACTIVE</span>}
                </span>
            </div>
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-[250px_1fr_1fr] gap-8">
                        {/* Left Column - Profile Picture */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-48 h-48 bg-blue-50 rounded-lg flex items-center justify-center">
                                {userData.profilePic === null || userData.profilePic === '' ?
                                    <User size={100} className="text-blue-300" /> :
                                    <img src={userData.profilePic} alt="profile" className="w-full h-full object-cover rounded-lg" />}
                            </div>
                        </div>

                        {/* Middle Column */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="phone">User Number</Label>
                                <Input
                                    id="phone"
                                    defaultValue={userData.phone}
                                    onChange={handleInputChange}
                                    className="bg-gray-50"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    value={formData.firstName}
                                    onChange={handleInputChange}
                                    placeholder="First Name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="dob">DOB</Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    value={formData.dob}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email ID</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                />
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    value={formData.lastName}
                                    onChange={handleInputChange}
                                    placeholder="Last Name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select value={formData.gender} onValueChange={handleGenderChange}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="upi">UPI ID</Label>
                                <Input
                                    id="upi"
                                    placeholder="Enter UPI ID"
                                    value={formData.upi}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Available Coins</Label>
                                <div className="flex items-center gap-2">
                                    <div className="text-xl font-semibold">{userData.coins}</div>
                                    <div className="text-sm text-gray-500">
                                        (₹{calculateWithdrawAmount(userData.coins)} withdrawable)
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Save Button */}
                    <div className="mt-6 flex justify-end">
                        <Button
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="px-6"
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserEditCard;