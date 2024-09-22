import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import driverLicenseIcon from '../../../assets/driverLicense.svg'
import {
    Dialog,
    DialogContent,

    DialogTrigger,
} from "@/components/ui/dialog"

const DriverLicense = ({ data }) => {
    const { driverInfo } = data
    return (
        <Card className="w-full">

            <CardHeader className='border-b border-gray-300 flex items-center flex-row gap-x-2'>
                <img src={driverLicenseIcon} alt="" className='w-6 h-6' />Driving License detail</CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm pt-4">
                    <p><strong>License Number:</strong> <br />{driverInfo?.licenseNumber}</p>
                    <p><strong>DOB:</strong> <br />{driverInfo?.dob}</p>
                    <p><strong>Name:</strong> <br />{driverInfo?.name}</p>
                    <p><strong>address:</strong><br /> {driverInfo?.driverAddress}</p>
                    <p><strong>Valid up to:</strong> <br />{driverInfo?.drivingLicenseValidUpto}</p>
                    <p><strong>Gender:</strong> <br />{driverInfo?.gender}</p>
                    <p><strong>Category:</strong> <br />{driverInfo?.drivingLicenseCategory}</p>
                    <p><strong>UPI ID:</strong> <br />{driverInfo?.upiID}</p>
                    <p><strong>Balance:</strong> <br />₹{driverInfo?.balance}</p>
                </div>
                <div className="mt-4 space-x-2">
                    <Button variant="outline" size="sm"><Dialog>
                        <DialogTrigger>Driving License Image</DialogTrigger>
                        <DialogContent>
                            <img src={driverInfo?.drivingLicense} alt="NOT AVAILABLE" />
                        </DialogContent>
                    </Dialog>
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
};

export default DriverLicense
