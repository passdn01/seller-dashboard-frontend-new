import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { User } from 'lucide-react';
import { SELLER_URL_LOCAL } from '@/lib/utils';

const UserEditCard = ({ userData }) => {
    const userId = userData._id;
    const [formData, setFormData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [redeemedCoins, setRedeemedCoins] = useState(0)

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/userDetail`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: userId })
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch user details');
                }

                const data = await response.json();
                console.log(data, "data in fetchuserdata")
                if (data.success) {
                    console.log("here")
                    setFormData({
                        firstName: data?.data.firstName || '',
                        lastName: data?.data.lastName || '',
                        dob: data?.data.dob || '',
                        gender: data?.data.gender || '',
                        email: data?.data.email || '',
                        phone: data?.data.phone || '',
                        id: data?.data._id || '',
                        coins: data?.data.coins || 0,
                        profilePic: data?.data.profilePic || '',
                        isActive: data?.data.isActive || false
                    });
                    setRedeemedCoins(data?.payoutCoins)
                }
                else {
                    window.alert(data.message)
                }
            } catch (error) {
                console.error('Error fetching user details:', error);
            }
        };

        fetchUserData();
    }, []);

    const calculateWithdrawAmount = (coins) => (coins / 10).toFixed(2);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleGenderChange = (value) => {
        setFormData(prev => ({ ...prev, gender: value }));
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/updateUser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to update user');
            }

            alert('User details updated successfully!');
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user details');
        } finally {
            setIsLoading(false);
        }
    };

    if (!formData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="w-full max-w-6xl mx-auto">
            <div className="text-lg font-semibold mb-4 flex gap-x-6">
                <span>User Details</span>
                <span className={formData.isActive ? 'text-green-400' : 'text-red-400'}>
                    {formData.isActive ? 'ACTIVE' : 'NOT ACTIVE'}
                </span>
            </div>
            <Card>
                <CardContent className="p-6">
                    <div className="grid grid-cols-[250px_1fr_1fr] gap-8">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-48 h-48 bg-blue-50 rounded-lg flex items-center justify-center">
                                {formData.profilePic ? (
                                    <img src={formData.profilePic} alt="profile" className="w-full h-full object-cover rounded-lg" />
                                ) : (
                                    <User size={100} className="text-blue-300" />
                                )}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="phone">User Number</Label>
                            <Input id="phone" value={formData.phone} onChange={handleInputChange} className="bg-gray-50" />

                            <Label htmlFor="firstName">First Name</Label>
                            <Input id="firstName" value={formData.firstName} onChange={handleInputChange} placeholder="First Name" />

                            <Label htmlFor="dob">DOB</Label>
                            <Input id="dob" type="date" value={formData.dob} onChange={handleInputChange} />

                            <Label htmlFor="email">Email ID</Label>
                            <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="Enter email address" />
                        </div>

                        <div className="space-y-4">
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input id="lastName" value={formData.lastName} onChange={handleInputChange} placeholder="Last Name" />

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

                            {/* <Label htmlFor="upi">UPI ID</Label>
                            <Input id="upi" value={formData.upi} onChange={handleInputChange} placeholder="Enter UPI ID" /> */}
                            <div>
                                <Label>Available Coins</Label>
                                <div className="flex items-center gap-2">
                                    <div className="text-xl font-semibold">{formData.coins}</div>
                                    <div className="text-sm text-gray-500">(₹{calculateWithdrawAmount(formData.coins)} withdrawable)</div>
                                </div>
                            </div>

                            <div>
                                <Label>Redeemed Coins</Label>
                                <div className="flex items-center gap-2">
                                    <div className="text-xl font-semibold">{redeemedCoins * 10}</div>
                                    <div className="text-sm text-gray-500">(₹{redeemedCoins} withdrawed)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <Button onClick={handleSubmit} disabled={isLoading} className="px-6">
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserEditCard;
