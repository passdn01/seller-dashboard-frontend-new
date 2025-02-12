import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Landmark } from 'lucide-react';

const UserBankCard = ({ data }) => {
    return (
        <Card className="w-full">
            <CardHeader className="border-b border-gray-300 flex items-center flex-row gap-x-2">
                <Landmark className="w-6 h-6" />
                <h3 className="font-medium">Bank</h3>
            </CardHeader>
            <CardContent>
                <div className="space-y-4  pt-4">
                    <p><strong>UPI ID:</strong><br />
                        {data?.upi || 'NA'} </p>
                    <p><strong>coins:</strong><br />
                        {data?.coins || '0'}</p>
                    <p><strong>Email:</strong><br />
                        {data?.email || 'NA'}</p>

                </div>
            </CardContent>
        </Card>
    );
};

export default UserBankCard;