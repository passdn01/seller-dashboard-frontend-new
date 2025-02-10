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
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SELLER_URL_LOCAL } from '@/lib/utils';

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

const RoleCard = ({ data, onUserDeleted, onUserEdited }) => {
    const [editedData, setEditedData] = useState({
        name: data.name,
        role: data.role,
        password: data.password
    });
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleDeleteRole = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${SELLER_URL_LOCAL}/dashboard/api/deleteDashboardUser`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: data._id })
            });

            const responseData = await response.json();

            if (response.ok && responseData.success) {
                alert(responseData.message || 'User deleted successfully');
                onUserDeleted(data._id); // Remove user from UI
            } else {
                alert(responseData.message || 'Failed to delete user');
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('An error occurred while deleting the user');
        } finally {
            setIsLoading(false);
            setIsDeleteDialogOpen(false);
        }
    };

    const handleInputChange = (field, value) => {
        setEditedData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSaveChanges = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${SELLER_URL_LOCAL}/dashboard/api/editDashboardUser`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...editedData,
                    username: data.username,
                })
            });

            const responseData = await response.json();

            if (response.ok && responseData.success) {
                alert(responseData.message || 'Profile updated successfully');
                setIsEditDialogOpen(false);

                // After editing, propagate the changes to the parent
                onUserEdited({ ...data, ...editedData }); // Update the user in the UI
            } else {
                alert(responseData.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating user:', error);
            alert('An error occurred while updating the profile');
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (name) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    return (
        <Card className="w-full p-4">
            <CardContent className="space-y-2">
                <div className="flex items-center space-x-2">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src="" alt={data.name} />
                        <AvatarFallback>{getInitials(data.name)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h3 className="font-medium text-lg">{data.name}</h3>
                        <Badge variant="secondary" className="font-normal bg-blue-100 text-blue-800">
                            {data.role}
                        </Badge>
                    </div>
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">ID: {data.username}</p>
                        <p className="text-sm text-muted-foreground">Password: {'•'.repeat(12)}</p>
                    </div>

                    <div className="flex justify-between pt-2">
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
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
                                            type="password"
                                            value={editedData.password}
                                            onChange={(e) => handleInputChange('password', e.target.value)}
                                            placeholder="Enter your password"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsEditDialogOpen(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        onClick={handleSaveChanges}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Saving...' : 'Save changes'}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" size="sm">
                                    Delete Role
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This action cannot be undone. This will permanently delete the user
                                        and remove their data from the system.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteRole}
                                        disabled={isLoading}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        {isLoading ? 'Deleting...' : 'Delete'}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default RoleCard;
