import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { User } from 'lucide-react';

const UserInfoCard = ({ data }) => {
    return (
        <Card className="w-full">
            <CardHeader className="border-b border-gray-300 flex items-center flex-row gap-x-2">
                <User className="w-6 h-6" />
                <h3 className="font-medium">User Info</h3>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 pt-4">
                    <p><strong>Name:</strong><br />
                        {data?.firstName} {data?.lastName}</p>
                    <p><strong>DOB:</strong><br />
                        {data?.dob}</p>
                    <p><strong>Email:</strong><br />
                        {data?.email}</p>
                    <p><strong>Gender:</strong><br />
                        {data?.gender}</p>
                    <p><strong>Phone:</strong><br />
                        {data?.phone}</p>

                </div>

            </CardContent>
        </Card>
    );
};

export default UserInfoCard;