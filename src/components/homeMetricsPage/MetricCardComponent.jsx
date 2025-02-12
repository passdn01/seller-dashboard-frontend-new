import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import arrowup from '../../assets/arrowUp.svg'

const MetricCard = ({
    icon,
    title,
    increase,
    number,
    hoverData,
    hover = false
}) => {
    const isPositive = !increase?.toString().startsWith('-');

    return (
        <Card className="w-full">
            <CardContent className="pt-4 pb-4">
                {/* Title Row */}
                <div className="mb-1">
                    {icon && <img src={icon} alt="" className="w-6 h-6 mb-2" />}


                    {/* Number and Increase Row */}
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-semibold">{number}</span>
                        {increase && (
                            <span className={`flex items-center text-md font-semibold px-1 rounded-full pr-2 
                                ${isPositive ? 'text-blue-500 bg-[#0F62FE] bg-opacity-10' : 'text-red-500'} 
                                ${title === "Fake Rides" ? 'bg-yellow-200 text-yellow-500 fill-yellow-500' : ''} 
                                ${title === "Cancel Rides" ? 'bg-red-200 text-red-800 ' : ''}`}
                            >
                                <img src={arrowup} alt="" className='w-4 h-4' />{Math.abs(increase)}
                            </span>
                        )}
                    </div>
                    <div className="text-sm text-gray-500 flex gap-x-2 items-center">{title}
                        {hover && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-gray-400" />
                                    </TooltipTrigger>
                                    <TooltipContent side="top" className="bg-zinc-900 text-white p-3 max-w-xs">
                                        <div className="space-y-2">
                                            <p className="font-semibold text-sm">{hoverData.title}</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-xs text-gray-300">{hoverData.todayNumberLine}</span>
                                                    <span className="text-sm">{hoverData.todayNumber}</span>
                                                </div>
                                                <div className="flex items-center justify-between gap-4">
                                                    <span className="text-xs text-gray-300">{hoverData.lastHourNumberLine}</span>
                                                    <span className="text-sm">{hoverData.lastHourNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                </div>


            </CardContent>
        </Card>
    );
};

export default MetricCard;