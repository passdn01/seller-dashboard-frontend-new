import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { 
  AlertTriangle, 
  AlertCircle, 
  TrendingDown, 
  User, 
  Calendar, 
  DollarSign, 
  Activity,
  Check,
  X,
  Car,
  Clock,
  Star,
  RotateCcw,
  ArrowLeft,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { CircularGauge, DonutChart, MetricCard, ProgressBar, RupeeIcon } from './charts';
// Import the Tooltip component and tooltip content
import { Tooltip, tooltipContent } from './InfoTooltip';

const ChurnPrediction = () => {
  const { id } = useParams(); // Get id from URL params
  const [driverData, setDriverData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dataVisible, setDataVisible] = useState(true);

  // Risk level colors
  const riskColors = {
    'Critical': '#ef4444',
    'High': '#f97316',
    'Medium': '#eab308',
    'Low': '#22c55e',
    'Very Low': '#3b82f6'
  };

  // Category colors
  const categoryColors = {
    'profile': '#8b5cf6',
    'engagement': '#ec4899',
    'financial': '#14b8a6',
    'behavioral': '#f59e0b'
  };

  // Fetch driver data on component mount or when id changes
  useEffect(() => {
    const fetchDriverData = async () => {
      if (!id) {
        setError("No driver ID provided");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${import.meta.env.VITE_SELLER_URL_LOCAL}/dashboard/api/seller/churnDriverData/${id}`);
        setDriverData(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch driver data');
      } finally {
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [id]);

  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case 'Critical':
        return <AlertCircle size={32} className="text-red-500" />;
      case 'High':
        return <AlertTriangle size={32} className="text-orange-500" />;
      case 'Medium':
        return <TrendingDown size={32} className="text-yellow-500" />;
      case 'Low':
        return <Activity size={32} className="text-green-500" />;
      default:
        return <Check size={32} className="text-blue-500" />;
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'profile':
        return <User size={24} className="text-purple-500" />;
      case 'engagement':
        return <Activity size={24} className="text-pink-500" />;
      case 'financial':
        return <RupeeIcon size={24} className="text-teal-500" />;
      case 'behavioral':
        return <Calendar size={24} className="text-amber-500" />;
      default:
        return null;
    }
  };

  // Format risk factors for display
  const formatRiskFactors = (riskFactors) => {
    if (!riskFactors) return [];
    
    return Object.entries(riskFactors).map(([key, value]) => ({
      category: key.charAt(0).toUpperCase() + key.slice(1),
      contribution: parseFloat(value.toFixed(1)),
      color: categoryColors[key]
    })).sort((a, b) => b.contribution - a.contribution);
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="flex flex-col items-center">
          <RefreshCw size={48} className="animate-spin text-blue-600 mb-4" />
          <p className="text-lg font-medium">Loading driver analysis...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-5 rounded  mb-6">
            <div className="flex items-start">
              <AlertCircle className="mt-1 mr-3 flex-shrink-0" size={24} />
              <div>
                <p className="font-bold text-lg mb-1">Error Loading Data</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!driverData) {
    return (
      <div className="container mx-auto p-8 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 text-yellow-800 p-5 rounded  mb-6">
            <p className="font-bold text-lg mb-1">No Data Available</p>
            <p>No churn prediction data found for driver ID: {id}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 my-4 mx-3 pb-4">
      <div className="rounded-md mb-6">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <Tooltip content={tooltipContent.churnAnalysis || "Analysis of driver churn risk factors and recommendations"}>
                <h1 className="text-3xl font-bold text-gray-900">Driver Churn Analysis</h1>
              </Tooltip>
              <div className="flex items-center text-gray-500 mt-1">
                <span className="mr-3">Driver ID: {id}</span>
                {/* <span className="mx-3">|</span> */}
                <span>Analyzed: {new Date(driverData.calculationDate).toLocaleDateString()} {new Date(driverData.calculationDate).toLocaleTimeString()}</span>
              </div>
            </div>
            
            {/* Toggle button for data visibility */}
            <button 
              onClick={() => setDataVisible(!dataVisible)}
              className="flex items-center border-none gap-2 px-4 py-2 rounded-md text-gray-700 transition-colors focus:outline-none"
            >
              {dataVisible ? (
                <>
                  <ChevronUp size={32} />
                </>
              ) : (
                <>
                  <ChevronDown size={32} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      
      {dataVisible && (
        <div className="container mx-auto px-4">
            {/* Overview Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Churn Risk Score Card */}
            <Card className="">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-b">
                <div>
                    <Tooltip content={tooltipContent.churnRiskScore}>
                    <CardTitle className="text-xl">Churn Risk Score</CardTitle>
                    </Tooltip>
                    <CardDescription>Overall risk assessment</CardDescription>
                </div>
                {getRiskIcon(driverData.churnRiskLevel)}
                </CardHeader>
                <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                    <CircularGauge
                    value={driverData.churnRiskScore} 
                    color={riskColors[driverData.churnRiskLevel]} 
                    />
                    <Tooltip content={tooltipContent[`riskLevel${driverData.churnRiskLevel}`] || tooltipContent[driverData.churnRiskLevel.toLowerCase() + "Risk"]}>
                    <p 
                        className="text-xl font-semibold mt-2" 
                        style={{ color: riskColors[driverData.churnRiskLevel] }}
                    >
                        {driverData.churnRiskLevel} Risk
                    </p>
                    </Tooltip>
                    
                    <div className="w-full border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-3 text-center text-gray-700">Risk Level Scale</h3>
                    <div className="flex justify-between items-center px-2">
                        <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-blue-500 mb-1"></div>
                        <Tooltip content={tooltipContent.veryLowRisk}>
                            <span className="text-xs">Very Low</span>
                        </Tooltip>
                        </div>
                        <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mb-1"></div>
                        <Tooltip content={tooltipContent.lowRisk}>
                            <span className="text-xs">Low</span>
                        </Tooltip>
                        </div>
                        <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 mb-1"></div>
                        <Tooltip content={tooltipContent.mediumRisk}>
                            <span className="text-xs">Medium</span>
                        </Tooltip>
                        </div>
                        <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-orange-500 mb-1"></div>
                        <Tooltip content={tooltipContent.highRisk}>
                            <span className="text-xs">High</span>
                        </Tooltip>
                        </div>
                        <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-red-500 mb-1"></div>
                        <Tooltip content={tooltipContent.criticalRisk}>
                            <span className="text-xs">Critical</span>
                        </Tooltip>
                        </div>
                    </div>
                    </div>
                </div>
                </CardContent>
            </Card>
            
            {/* Risk Factors Chart Card */}
            <Card className="">
                <CardHeader className="pb-2 border-b">
                <Tooltip content={tooltipContent.riskFactors}>
                    <CardTitle className="text-xl">Risk Factors</CardTitle>
                </Tooltip>
                <CardDescription>Contributing factors to churn risk</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                    <DonutChart data={formatRiskFactors(driverData.riskFactors)} />
                    
                    <div className="w-full mt-4">
                    {formatRiskFactors(driverData.riskFactors).map((factor, idx) => (
                        <div key={idx} className="flex items-center mb-2">
                        <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{ backgroundColor: factor.color }}
                        ></div>
                        <Tooltip content={tooltipContent[factor.category.toLowerCase() + "Metrics"]}>
                            <span className="text-sm">{factor.category}: {factor.contribution.toFixed(1)}%</span>
                        </Tooltip>
                        </div>
                    ))}
                    </div>
                </div>
                </CardContent>
            </Card>
            
            {/* Recommendations Card */}
            <Card className="">
                <CardHeader className="pb-2 border-b">
                <Tooltip content={tooltipContent.recommendations}>
                    <CardTitle className="text-xl">Recommendations</CardTitle>
                </Tooltip>
                <CardDescription>Actions to reduce churn risk</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                <div className="space-y-3 max-h-full overflow-y-auto pr-1">
                    {driverData.recommendations && driverData.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start gap-2 p-3 bg-gray-50 rounded-md border hover:bg-blue-50 hover:border-blue-200 transition-colors">
                        {idx === 0 ? (
                        <AlertCircle className="text-blue-500 mt-0.5 flex-shrink-0" size={16} />
                        ) : (
                        <Check className="text-green-500 mt-0.5 flex-shrink-0" size={16} />
                        )}
                        <span className="text-sm">{rec}</span>
                    </div>
                    ))}
                </div>
                </CardContent>
            </Card>
            </div>
            
            {/* Risk Factors Breakdown Section */}
            <Card className=" mb-8">
            <CardHeader className="pb-2 border-b">
                <CardTitle className="text-xl">Risk Factors Breakdown</CardTitle>
                <CardDescription>Detailed analysis of churn risk contributions</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="space-y-4">
                {formatRiskFactors(driverData.riskFactors).map((factor, idx) => (
                    <ProgressBar
                    key={idx} 
                    label={
                        <Tooltip content={tooltipContent[factor.category.toLowerCase() + "Metrics"]}>
                        {factor.category}
                        </Tooltip>
                    }
                    value={factor.contribution} 
                    color={factor.color} 
                    />
                ))}
                </div>
            </CardContent>
            </Card>
            
            {/* Category Metrics Cards */}
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Detailed Metrics Analysis</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {driverData.metrics && Object.entries(driverData.metrics).map(([key, data]) => {
                const category = key.replace('Metrics', '');
                
                return (
                <Card key={key} className="">
                    <CardHeader className="pb-2 border-b flex flex-row items-center gap-2">
                    {getCategoryIcon(category)}
                    <div>
                        <Tooltip content={tooltipContent[key]}>
                        <CardTitle className="text-xl capitalize">{category} Metrics</CardTitle>
                        </Tooltip>
                        <CardDescription>
                        <div className="flex items-center gap-2">
                            <span>Weight: {data.weight}%</span>
                            <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                            <div className="flex items-center">
                                <span>Score: </span>
                                <span 
                                className={`font-medium ${
                                    data.categoryScore > 70 ? 'text-green-500' : 
                                    data.categoryScore > 40 ? 'text-yellow-500' : 'text-red-500'
                                }`}
                                >
                                {data.categoryScore.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        </CardDescription>
                    </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {Object.entries(data.metrics).map(([metricKey, metric]) => (
                        <MetricCard 
                            key={metricKey} 
                            metricKey={metricKey} 
                            metric={metric} 
                            // Pass tooltip component and content
                            Tooltip={Tooltip}
                            tooltipContent={tooltipContent}
                        />
                        ))}
                    </div>
                    </CardContent>
                </Card>
                );
            })}
            </div>
        </div>
      )}
    </div>
  );
};

export default ChurnPrediction;