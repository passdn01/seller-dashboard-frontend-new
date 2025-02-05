import React from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/card';
function RideInfoCard({ userInfo }) {
    console.log(userInfo, "userInfo in rideinfo card")
    return (
        <Card className="w-full">
            <CardHeader className="border-b border-gray-300 flex items-center flex-row gap-x-2">

                <h3 className="font-medium">User Info</h3>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 pt-4">
                    <p><strong>Name:</strong><br />
                        {userInfo?.name}</p>

                    <p><strong>Phone:</strong><br />
                        {userInfo?.phone}</p>

                </div>

            </CardContent>
        </Card>
    )
}

export default RideInfoCard