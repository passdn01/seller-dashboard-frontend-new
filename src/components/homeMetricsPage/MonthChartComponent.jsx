import React, { useState, useEffect } from 'react';
import { AreaChart } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Swiper, SwiperSlide } from 'swiper/react';

import { Navigation } from 'swiper/modules';

import 'swiper/css/navigation';
import './homeChart.css'


const MonthlyDataRenderer = ({ mdata, group, chartTitle }) => {
    const groupDataByMonth = (data) => {
        const grouped = {};

        data.forEach((item) => {
            const date = new Date(item.date);
            const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }
            grouped[monthKey].push(item);
        });

        return Object.entries(grouped).map(([key, values]) => {
            const firstDate = new Date(values[0].date);
            const lastDate = new Date(
                firstDate.getFullYear(),
                firstDate.getMonth() + 1,
                0
            ); // Last day of the month

            return {
                startDate: firstDate,
                endDate: lastDate,
                data: values,
            };
        });
    };

    const type = "month"
    const getTimeFormat = () => {
        switch (type) {
            case 'day':
                return '%H:00';
            case 'month':
                return '%Y-%m-%d';
            case 'year':
                return '%Y-%m';
            default:
                return '%Y-%m-%d';
        }
    };

    const chartOptions = (title, group, startDate) => ({
        title: title + " " + startDate.toLocaleString("default", { month: "long", year: "numeric" }),
        axes: {
            bottom: {
                title: type === 'day' ? 'Time (Hours)' : 'Date',
                mapsTo: 'date',
                scaleType: 'time',
                ticks: {
                    format: getTimeFormat()
                }
            },
            left: {
                mapsTo: 'value',
                title: group,
                scaleType: 'linear',
            },
        },
        curve: 'curveNatural',
        height: '400px',
        grid: {
            x: {
                enabled: true
            },
            y: {
                enabled: true
            }
        }, toolbar: {
            enabled: true,
            numberOfIcons: 3,
            controls: [
                { type: 'Reset zoom' },
                { type: 'Export as CSV' },


            ]
        },
        zoomBar: {
            top: {
                enabled: true
            }
        },

    });

    const ChartCard = ({ title, chartData, group, startDate }) => {
        let upData = chartData.filter(d => d.group === group)
        console.log(upData, "updata")

        upData.sort((a, b) => new Date(b.date) - new Date(a.date));

        const monthName = new Date(startDate).toLocaleString("default", { month: "long" });
        console.log(startDate, "st")
        if (!upData.length) {
            return (<Card>  `No data available for {monthName}` </Card>)
        }
        return (<Card className="p-4 mb-6">
            <AreaChart
                data={upData}
                options={chartOptions(title, group, startDate)}
            />
        </Card>


        )
    };

    const monthlyData = groupDataByMonth(mdata);
    console.log(monthlyData, "monthly data")
    monthlyData.sort((a, b) => b.startDate - a.startDate);


    return (
        <div className="p-4">
            <Swiper navigation={true} modules={[Navigation]} className="mySwiper" allowTouchMove={false} >
                {monthlyData.map((month, index) => (
                    <SwiperSlide>
                        <div className='px-10'>
                            <ChartCard title={chartTitle} chartData={month.data} group={group} key={index} startDate={month.startDate} /></div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default MonthlyDataRenderer;
