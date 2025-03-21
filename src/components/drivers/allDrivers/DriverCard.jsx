import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import referBy from '../../../assets/referBy.svg'
import { Dialog, DialogContent, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
const DriverCard = ({ data }) => {
    console.log(data);
    const { driverInfo } = data;

    return (
        <>

            <Card className='flex justify-between items-center px-2 my-4 mx-3'>
                <div>
                    <CardHeader className=' '>
                        <div className='flex gap-x-4'>
                            <Dialog>
                                {/* Trigger the dialog when AvatarImage is clicked */}
                                <DialogTrigger>
                                    <Avatar>
                                        <AvatarImage src={driverInfo.profileUrl} alt={driverInfo?.name} />
                                        <AvatarFallback>{driverInfo?.name?.charAt(0) || 'NAN'}</AvatarFallback>
                                    </Avatar>
                                </DialogTrigger>

                                {/* Content of the dialog */}
                                <DialogContent className='max-h-[80vh] overflow-auto'>
                                    <DialogDescription>
                                        <img src={driverInfo?.profileUrl} alt="Profile" />
                                    </DialogDescription>
                                </DialogContent>
                            </Dialog>
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle>
                                        {driverInfo?.name || ''}
                                    </CardTitle>
                                    {/* Green or Red Dot based on `isCompleteRegistration` */}
                                    <span
                                        className={`w-3 h-3 rounded-full ${driverInfo?.isCompleteRegistration ? 'bg-green-400' : 'bg-red-400'
                                            }`}
                                        title={driverInfo?.isCompleteRegistration ? "Registration Complete" : "Registration Incomplete"}
                                    ></span>
                                </div>
                                <CardDescription>
                                    {driverInfo?.phone || ''} <br />
                                    Joined: {driverInfo?.createdAt ? new Date(driverInfo.createdAt).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    }) : ''}
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