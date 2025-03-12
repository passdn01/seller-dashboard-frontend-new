import React, { useState } from 'react';
import { Calendar, Search } from 'lucide-react';
import SankeyChart from './SankeyChart';
import moment from 'moment-timezone';

const IST_TIMEZONE = "Asia/Kolkata";

const DriverJourney = () => {
  const [flowData, setFlowData] = useState([]);
  const [metricsData, setMetricsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: moment().tz(IST_TIMEZONE).subtract(30, 'days').format('YYYY-MM-DD'),
    end: moment().tz(IST_TIMEZONE).format('YYYY-MM-DD')
  });

  const fetchDriverData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driverJourney?start=${dateRange.start}&end=${dateRange.end}`
      );
      const data = await response.json();

      if (data.success) {
        setFlowData(data.data);
        setMetricsData(data.metrics);
        setError(null);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePresetClick = async (preset) => {
    const end = moment().tz(IST_TIMEZONE).format('YYYY-MM-DD');
      let start;
  
      if (preset === 'last30') {
        start = moment().tz(IST_TIMEZONE).subtract(30, 'days').format('YYYY-MM-DD');
      } else if (preset === 'today') {
        start = end;
      }
      else if (preset === 'allTime') {
        start = '2024-01-01';
      }
  
      setDateRange({ start, end });
    
    // Fetch data immediately after setting date range
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/driverJourney?start=${start}&end=${end}`
      );
      const data = await response.json();

      if (data.success) {
        setFlowData(data.data);
        setMetricsData(data.metrics);
        setError(null);
      } else {
        setError('Failed to fetch data');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMetrics = () => {
    if (!metricsData) return {
      totalDrivers: 0,
      verifiedDrivers: 0,
      pendingDrivers: 0,
      notVerifiedDrivers: 0,
      autoDrivers: 0,
      cabDrivers: 0,
      eliteDrivers: 0
    };
  
    return {
      totalDrivers: metricsData.totalDrivers || 0,
      verifiedDrivers: metricsData.verifiedDrivers || 0,
      pendingDrivers: metricsData.pendingDrivers || 0,
      notVerifiedDrivers: metricsData.notVerifiedDrivers || 0,
      autoDrivers: metricsData.autoDrivers || 0,
      cabDrivers: metricsData.cabDrivers || 0,
      eliteDrivers: metricsData.eliteDrivers || 0
    };
  };

  const options = {
    title: 'Driver Journey Flow Analysis',
    height: '400px',
    axes: {
      left: { mapsTo: 'source', scaleType: 'labels' },
      right: { mapsTo: 'target', scaleType: 'labels' }
    },
    alluvial: {
      nodePadding: 15,
      width: 15,
      nodes: [
        { name: 'Total LogIn Drivers' },
        { name: 'Verified Drivers' },
        { name: 'Pending Drivers' },
        { name: 'In process Document Drivers' },
        { name: 'Auto Drivers' },
        { name: 'Cab Drivers' },
        { name: 'Elite Drivers' }
      ]
    },
  };

  const metrics = calculateMetrics();

  return (
    <div className="w-full h-auto p-4 bg-white">
      <div className="mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Driver Analysis</h2>
          
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full md:w-auto">
            <div className="flex gap-2">
              <button
                onClick={() => handlePresetClick('today')}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => handlePresetClick('last30')}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                Last 30 Days
              </button>
              <button
                onClick={() => handlePresetClick('allTime')}
                className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
              >
                All Time
              </button>
            </div>
            
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  name="start"
                  value={dateRange.start}
                  onChange={handleDateChange}
                  className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <span className="text-gray-500">to</span>
              <input
                type="date"
                name="end"
                value={dateRange.end}
                onChange={handleDateChange}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={fetchDriverData}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:bg-blue-300"
              >
                <Search className="w-4 h-4" />
                {isLoading ? 'Loading...' : 'Show Data'}
              </button>
            </div>
          </div>
        </div>

        {(flowData.length > 0 || error) && (
          <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
            <MetricCard 
              label="Total LogIn Drivers" 
              value={metrics.totalDrivers}
            />
            <MetricCard 
              label="Verified Drivers" 
              value={metrics.verifiedDrivers}
            />
            <MetricCard 
              label="Auto Drivers" 
              value={metrics.autoDrivers}
            />
            <MetricCard 
              label="Elite Drivers" 
              value={metrics.eliteDrivers}
            />
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="text-red-500">Error: {error}</div>
        </div>
      ) : flowData.length > 0 ? (
        <div className="w-[1200px] h-[500px]">
          <SankeyChart 
            data={flowData} 
            options={options} 
          />
        </div>
      ) : (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="text-gray-500">Select date range and click 'Show Data' to view the chart</div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ label, value }) => (
  <div className="p-6 rounded-sm border">
    <p className="text-3xl font-bold text-gray-800">{value.toLocaleString()}</p>
    <p className="text-md text-gray-600">{label}</p>
  </div>
);

export default DriverJourney;