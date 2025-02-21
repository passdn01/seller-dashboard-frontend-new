import React from 'react';
import { AreaChart } from '@carbon/charts-react';
import '@carbon/charts/styles.css';
import { Card } from "@/components/ui/card";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import './homeChart.css'


const YearlyDataRenderer = ({ mdata, group, chartTitle }) => {
    const groupDataByYear = (data) => {
        const grouped = {};

        data.forEach((item) => {
            const date = new Date(item.date);
            const yearKey = date.getFullYear();

            if (!grouped[yearKey]) {
                grouped[yearKey] = [];
            }
            grouped[yearKey].push(item);
        });

        return Object.entries(grouped).map(([key, values]) => {
            const firstDate = new Date(values[0].date);
            const lastDate = new Date(firstDate.getFullYear(), 11, 31); // Last day of the year

            return {
                startDate: firstDate,
                endDate: lastDate,
                data: values,
            };
        });
    };

    const type = "year";
    const getTimeFormat = () => {
        switch (type) {
            case 'day':
                return '%H:00';
            case 'month':
                return '%Y-%m-%d';
            case 'year':
                return '%Y';
            default:
                return '%Y-%m-%d';
        }
    };

    const chartOptions = (title, group, startDate) => ({
        title: title + " " + startDate.getFullYear(),
        axes: {
            bottom: {
                title: 'Year',
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
        },
        toolbar: {
            enabled: true,
            numberOfIcons: 3,
            controls: [
                { type: 'Reset zoom' },
                { type: 'Export as CSV' }

            ]
        },
        zoomBar: {
            top: {
                enabled: true
            }
        },
    });

    const ChartCard = ({ title, chartData, group, startDate }) => {
        let upData = chartData.filter(d => d.group === group);

        upData.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (!upData.length) {
            return <Card>No data available for {startDate.getFullYear()}</Card>;
        }

        return (
            <Card className="p-4 mb-6">
                <AreaChart data={upData} options={chartOptions(title, group, startDate)} />
            </Card>
        );
    };

    const yearlyData = groupDataByYear(mdata);
    yearlyData.sort((a, b) => b.startDate - a.startDate);

    return (
        <div className="p-4">
            <Swiper navigation={true} modules={[Navigation]} className="mySwiper" allowTouchMove={false}
            >
                {yearlyData.map((year, index) => (
                    <SwiperSlide key={index}>
                        <div className='px-10'>
                            <ChartCard title={chartTitle} chartData={year.data} group={group} startDate={year.startDate} />
                        </div>
                    </SwiperSlide>
                ))}
            </Swiper>
        </div>
    );
};

export default YearlyDataRenderer;
