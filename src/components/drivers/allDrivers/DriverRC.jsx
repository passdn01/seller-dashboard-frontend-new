import React from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import driverRC from '../../../assets/driverRC.svg'
import {
    Dialog,
    DialogContent,

    DialogTrigger,
} from "@/components/ui/dialog"
const handleDsubmit = (e)=>{
    e.preventDefault();
    
}
const DriverRC = ({ data }) => {
    // Using placeholder data for RC Details
    const { driverInfo } = data
    return (
        <Card className="w-full">
            <CardHeader className='border-b border-gray-300 flex items-center flex-row gap-x-2'>
                <img src={driverRC} alt="" className='w-6 h-6' />Vehicle detail</CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm pt-4">
                    <p><strong>Vehicle Number:</strong> {driverInfo?.vehicleNumber}</p>
                    <p><strong>Fuel type:</strong> {driverInfo?.vehicleFuelType}</p>
                    <p><strong>Vehicle model:</strong> {driverInfo?.vehicleMakerModel}</p>
                    <p><strong>Valid up to:</strong> {driverInfo?.rcValidUpto}</p>
                    <p><strong>RC Valid Up To:</strong> {driverInfo?.rcValidUpto}</p>
                    <p><strong>Vehicle Type:</strong> {driverInfo?.vehicleType}</p>
                    <p><strong>Category:</strong> {driverInfo?.category}</p>
                    {/* <form onSubmit={handleDsubmit}>
                    <strong><input id='rcn' type='text'value={driverInfo?.vehicleNumber}/></strong><br/>
                    <strong><input id='par1' type='text'value={driverInfo?.vehicleFuelType}/></strong><br/>
                    <strong><input id='' type='text'value={driverInfo?.vehicleMakerModel}/></strong><br/>
                    <strong><input id='' type='text'value={driverInfo?.rcValidUpto}/></strong><br/>
                    <strong><input id='' type='text'value={driverInfo?.rcValidUpto}/></strong><br/>
                    <strong><input id='' type='text'value={driverInfo?.vehicleType}/></strong><br/>
                    <strong><input id='' type='text'value={driverInfo?.category}/></strong><br/>
                    <strong><button type='submit'> Submit</button></strong><br/>


                    </form> */}
                </div>
                <div className="mt-4 space-x-2">
                    <Button variant="outline" size="sm"><Dialog>
                        <DialogTrigger>RC Image</DialogTrigger>
                        <DialogContent className='max-h-[80vh] overflow-auto'>
                            <img src={driverInfo?.registrationCertificate} alt="NOT AVAILABLE" />
                        </DialogContent>
                    </Dialog>
                    </Button>
                    <Button variant="outline" size="sm"><Dialog>
                        <DialogTrigger>RC Back Image</DialogTrigger>
                        <DialogContent className='max-h-[80vh] overflow-auto'>
                            <img src={driverInfo?.registrationCertificateBack} alt="NOT AVAILABLE" />
                        </DialogContent>
                    </Dialog>
                    </Button>
                </div>
            </CardContent>
        </Card >
    );
};

export default DriverRC