import React, { useState } from 'react';
import { Card, CardContent, CardTitle } from "@/components/ui/card";
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

function CurrentUserCard() {
    const [password, setPassword] = useState("");
    const [open, setOpen] = useState(true);

    const name = localStorage.getItem('admin')
    const username = localStorage.getItem('username')
    const role = localStorage.getItem('role')

    const handlePasswordUpdate = async () => {
        try {
            const response = await fetch('https://8qklrvxb-5000.inc1.devtunnels.ms/dashboard/api/editDashboardUser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                    name,
                    role
                })
            });

            if (response?.data?.success) {
                window.alert('Password updated successfully');
                setOpen(false);
                setPassword("");
            } else {
                window.alert('Password update failed');
            }
        } catch (error) {
            console.error('Error updating password:', error);
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
        <Card className="p-4 mx-8 my-4">

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

                <div className="">
                    <div>
                        User Name: {username}
                    </div>

                    <div className="flex justify-between pt-2">
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    Edit Password
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-[425px] h-96">
                                <DialogHeader>
                                    <DialogTitle>Edit Password</DialogTitle>
                                </DialogHeader>
                                <div className=" ">
                                    <div className="flex flex-col gap-2">
                                        <Label htmlFor="password">New Password</Label>
                                        <Input
                                            id="password"
                                            type="text"
                                            placeholder="Enter your New password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <DialogTrigger asChild>
                                        <Button variant="outline">Cancel</Button>
                                    </DialogTrigger>
                                    <Button type="submit" onClick={handlePasswordUpdate}>Save changes</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

export default CurrentUserCard