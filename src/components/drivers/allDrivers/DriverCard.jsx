import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import referBy from '../../../assets/referBy.svg'
const DriverCard = ({ data }) => {
    const { driverInfo } = data;

    return (
        <>

            <Card className='flex justify-between items-center px-2 my-4 mx-3'>
                <div>
                    <CardHeader className=' '>
                        <div className='flex gap-x-4'>
                            <Avatar>
                                <AvatarImage src={driverInfo.profileUrl} alt={driverInfo?.name} />
                                <AvatarFallback>{driverInfo?.name?.charAt(0) || 'NAN'}</AvatarFallback>
                            </Avatar>

                            <div>
                                <CardTitle>{driverInfo?.name || ''}</CardTitle>
                                <CardDescription>
                                    {driverInfo?.phone || ''} <br />    Joined: {new Date(driverInfo.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                </div>
                <div className='flex-col flex gap-y-1 pr-4'>
                    <Badge className='bg-[#5356FF] text-white'>{driverInfo.status}</Badge>
                    <div className='flex text-xs gap-1'><img src={referBy} alt="" />{driverInfo?.refferedBy || 'none'}</div>
                </div>
            </Card>
        </>

    );
};

export default DriverCard;