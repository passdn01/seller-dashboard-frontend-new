import React, { useEffect, useState } from "react";
import Header from "../drivers/allDrivers/Header";
import LiveDataCard from "./LiveDataCard";
import CardGrid from "./CardGrid";
import HomeCharts from "./HomeCharts";
const RideDashboard = () => {


    return (
        <div>
            <Header className='w-full' title="DASHBOARD"></Header>
            <LiveDataCard></LiveDataCard>
            <CardGrid></CardGrid>
            <HomeCharts></HomeCharts>
        </div>
    );
};

export { RideDashboard };
