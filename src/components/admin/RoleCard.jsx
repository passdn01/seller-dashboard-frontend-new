import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const roleOptions = [
    "admin",
    "superAdmin",
    "guest",
    "issueSolver",
    "issueAssigner",
    "verifierAndIssueAssigner",
    "verifier",
    "UserExplore"
];

const ProfileCard = ({ data }) => {
    const [editedData, setEditedData] = useState({
        name: data.name,
        role: data.role,
        password: data.password
    });

    const handleInputChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveChanges = async () => {
        try {
            const response = await fetch('https://8qklrvxb-5000.inc1.devtunnels.ms/dashboard/api/editDashboardUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...editedData,
                    username: data.username
                })
            });

            if (response?.data?.success) {
                window.alert(response.data.message);
            } else {
                window.alert('Failed to update user');
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const { name, role, username, password } = data;

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    return (
        <Card className="w-full max-w-md p-4">
            <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={name} />
                        <AvatarFallback>{getInitials(name)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h3 className="font-medium text-lg">{name}</h3>
                        <Badge variant="secondary" className="font-normal bg-blue-100 text-blue-800">
                            {role}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">ID: {username}</p>
                        <p className="text-sm text-muted-foreground">Password: {'•'.repeat(12)}</p>
                    </div>

                    <div className="flex justify-between pt-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Edit
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <DialogHeader>
                                    <DialogTitle>Edit Profile</DialogTitle>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                        <Label htmlFor="name">Name</Label>
                                        <Input
                                            id="name"
                                            value={editedData.name}
                                            onChange={(e) => handleInputChange('name', e.target.value)}
                                            placeholder="Enter your name"
                                        />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="role">Role</Label>
                                        <Select
                                            value={editedData.role}
                                            onValueChange={(value) => handleInputChange('role', value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a role" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {roleOptions.map((role) => (
                                                    <SelectItem key={role} value={role}>
                                                        {role}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="password">Password</Label>
                                        <Input
                                            id="password"
                                            type="text"
                                            value={editedData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <DialogTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogTrigger>
                                    <Button type="submit" onClick={handleSaveChanges}>Save changes</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                        <Button variant="destructive" size="sm">
                            Delete Role
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProfileCard;
