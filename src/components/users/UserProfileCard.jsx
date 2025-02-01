import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import referBy from '../../assets/referBy.svg'
import { Dialog, DialogContent, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
const UserProfileCard = ({ userData }) => {
    console.log(userData, "userData");
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
                                        <AvatarImage src={userData?.profilePic} alt={userData?.name} />
                                        <AvatarFallback>{'NAN'}</AvatarFallback>
                                    </Avatar>
                                </DialogTrigger>

                                {/* Content of the dialog */}
                                <DialogContent className='max-h-[80vh] overflow-auto'>
                                    <DialogDescription>
                                        <img src={userData?.profilePic} alt="Profile" />
                                    </DialogDescription>
                                </DialogContent>
                            </Dialog>
                            <div>
                                <div className="flex items-center gap-2">
                                    <CardTitle>
                                        {userData?.firstName + ' ' + userData?.lastName || ''}
                                    </CardTitle>
                                    {/* Green or Red Dot based on `isCompleteRegistration` */}

                                </div>
                                <CardDescription>
                                    {userData?.phone || ''} <br />
                                    Joined: {userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', {
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
                    <Badge className='bg-[#5356FF] text-white'>{userData?.isActive ? 'ACTIVE' : 'NOT ACTIVE'}</Badge>
                    <div className='flex text-xs gap-1'><img src={referBy} alt="" />{userData?.refferedBy || 'none'}</div>
                </div>
            </Card>
        </>

    );
};

export default UserProfileCard