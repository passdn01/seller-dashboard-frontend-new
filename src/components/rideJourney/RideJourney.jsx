import React, { useState } from 'react';
import '@carbon/charts-react/styles.css';
import { Calendar, Search, Info } from 'lucide-react';
import SankeyChart from './SankeyChart';
import moment from 'moment-timezone';

const IST_TIMEZONE = "Asia/Kolkata";

const RideJourney = () => {
  const [flowData, setFlowData] = useState([]);
  const [metricsData, setMetricsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: moment().tz(IST_TIMEZONE).subtract(30, 'days').format('YYYY-MM-DD'),
    end: moment().tz(IST_TIMEZONE).format('YYYY-MM-DD')
  });

  const fetchRideData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/rideJourney?start=${dateRange.start}&end=${dateRange.end}`
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
        `${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/buyer/rideJourney?start=${start}&end=${end}`
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
      totalSearches: 0,
      autoSearches: 0,
      eliteSearches: 0,
      completedRides: 0,
      notAcceptedRides: 0,
      cancelledRides: 0
    };
  
    return {
      totalSearches: metricsData.totalRideSearch || 0,
      autoSearches: metricsData.autoSearch || 0,
      eliteSearches: metricsData.eliteSearch || 0,
      completedRides: (metricsData.autoCompleted || 0) + (metricsData.cabCompleted || 0) + (metricsData.eliteCompleted || 0),
      notAcceptedRides: (metricsData.autoNotAccepted || 0) + (metricsData.cabNotAccepted || 0) + (metricsData.eliteNotAccepted || 0),
      cancelledRides: (metricsData.autoCancelled || 0) + (metricsData.cabCancelled || 0) + (metricsData.eliteCancelled || 0)
    };
  };

  const options = {
    title: 'Ride Journey Flow Analysis',
    height: '400px',
    axes: {
      left: { mapsTo: 'source', scaleType: 'labels' },
      right: { mapsTo: 'target', scaleType: 'labels' }
    },
    alluvial: {
      nodePadding: 15,
      width: 15,
      nodes: [
        { name: 'Total Ride Search' },
        { name: 'Auto Search' },
        { name: 'Cab Search' },
        { name: 'Elite Search' },
        { name: 'Auto Accepted' },
        { name: 'Cab Accepted' },
        { name: 'Elite Accepted' },
        { name: 'Ride Not Accepted' },
        { name: 'Completed' },
        { name: 'Cancelled' },
        { name: 'Not Completed' }
      ]
    },
    tooltip: {
      enabled: true,
      customHTML: (data) => `
        <div class="p-2 bg-white shadow-lg rounded">
          <p class="font-bold">${data.source} → ${data.target}</p>
          <p>Count: ${data.value.toLocaleString()}</p>
          ${data.target === 'Completed' || data.target === 'Not Completed' || data.target === 'Cancelled' ? 
            `<p class="text-sm text-gray-600">Final Status</p>` : ''}
        </div>
      `
    }
  };

  const metrics = calculateMetrics();

  // Metric info descriptions
  const metricInfo = {
    totalSearches: "Total ride searches across all vehicle types.",
    autoSearches: "Searches for auto-rickshaw rides.",
    eliteSearches: "Searches for premium/elite rides.",
    completedRides: "Total successfully completed rides.",
    notAcceptedRides: "Rides searched but not accepted.",
    cancelledRides: "Accepted rides later canceled."
  };


  return (
    <div className="w-full h-auto p-4 bg-white">
      <div className="mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Analysis</h2>
          
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
                onClick={fetchRideData}
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
          <div className="mt-2 grid grid-cols-2 md:grid-cols-5 gap-2">
            <MetricCard 
              label="Total Searches" 
              value={metrics.totalSearches}
              info={metricInfo.totalSearches}
            />
            <MetricCard 
              label="Auto Searches" 
              value={metrics.autoSearches}
              info={metricInfo.autoSearches}
            />
            <MetricCard 
              label="Completed Rides" 
              value={metrics.completedRides}
              info={metricInfo.completedRides}
            />
            <MetricCard 
              label="Cancelled Rides" 
              value={metrics.cancelledRides}
              info={metricInfo.cancelledRides}
            />
            <MetricCard 
              label="Not Completed Rides" 
              value={metrics.notAcceptedRides}
              info={metricInfo.notAcceptedRides}
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

const MetricCard = ({ label, value, info }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="p-6 rounded-sm border relative">
      <div 
        className="absolute top-0 right-0 mt-2 mr-2"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        <Info className="w-5 h-5 text-gray-400 cursor-pointer" />
        {showTooltip && (
          <div className="absolute z-10 right-0 mt-1 p-3 bg-white border shadow-lg rounded-md w-64 text-sm text-gray-700">
            {info}
          </div>
        )}
      </div>
      <div className="flex justify-between items-start">
        <p className="text-3xl font-bold text-gray-800">{value.toLocaleString()}</p>
      </div>
      <p className="text-md text-gray-600 mt-1">{label}</p>
    </div>
  );
};

export default RideJourney;