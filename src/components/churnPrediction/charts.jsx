import { 
    Calendar, 
    DollarSign, 
    Activity,
    Check,
    X,
    Car,
    Clock,
    Star,
  } from 'lucide-react';

export const RupeeIcon = ({ size = 24, className = "" }) => (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M6 3h12M6 8h12M6 13l6 8M6 13h3c3 0 6-2 6-5" />
    </svg>
  );

export const formatMetricValue = (key, value) => {
    switch (key) {
      case 'registrationAge':
        return `${value} days`;
      case 'driverRating':
        return `${value}/5`;
      case 'ridesCompleted':
        return `${value.toFixed(1)}/day`;
      case 'onlineTime':
        return `${value.toFixed(1)} hrs`;
      case 'acceptanceRate':
      case 'cancellationRate':
        return `${value.toFixed(1)}%`;
      case 'rideArrived':
        return value;
      case 'monthlyEarnings':
        return `$${value.toFixed(0)}`;
      case 'avgEarningsPerRide':
        return `$${value.toFixed(0)}`;
      case 'lastActive':
        return value === 0 ? 'Today' : `${value} days ago`;
      case 'appUsage':
        return `${value.toFixed(0)} mins`;
      default:
        return value;
    }
  };

export const getMetricIcon = (metricKey) => {
    switch (metricKey) {
      case 'registrationAge':
        return <Calendar size={18} />;
      case 'vehicleTypeScore':
        return <Car size={18} />;
      case 'driverRating':
        return <Star size={18} />;
      case 'ridesCompleted':
        return <Check size={18} />;
      case 'onlineTime':
        return <Clock size={18} />;
      case 'acceptanceRate':
        return <Check size={18} />;
      case 'cancellationRate':
        return <X size={18} />;
      case 'rideArrived':
        return <Car size={18} />;
      case 'monthlyEarnings':
        return <RupeeIcon size={18} />;
      case 'avgEarningsPerRide':
        return <RupeeIcon size={18} />;
      case 'lastActive':
        return <Calendar size={18} />;
      case 'appUsage':
        return <Activity size={18} />;
      default:
        return <Activity size={18} />;
    }
  };
 
 // Create a circular gauge for the risk score
 export const CircularGauge = ({ value, maxValue = 100, size = 200, strokeWidth = 15, color }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = (value / maxValue) * circumference;
    
    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#e5e7eb"
            strokeWidth={strokeWidth}
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={circumference - progress}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Value text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold" style={{ color }}>
            {value.toFixed(1)}%
          </span>
        </div>
      </div>
    );
  };
  
  // Create a horizontal progress bar for risk factors
  export const ProgressBar = ({ label, value, maxValue = 100, color }) => {
    return (
      <div className="mb-3">
        <div className="flex justify-between mb-1">
          <span className="font-medium text-sm">{label}</span>
          <span className="text-sm">{value}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="h-2.5 rounded-full" 
            style={{ 
              width: `${value}%`, 
              backgroundColor: color 
            }}
          ></div>
        </div>
      </div>
    );
  };
  
  // Create a metric card with progress visualization
  export const MetricCard = ({ metricKey, metric }) => {
    const formattedName = metricKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
    const scoreColor = metric.score > 70 ? '#22c55e' : metric.score > 40 ? '#eab308' : '#f97316';
    
    return (
      <div className="border p-4 rounded-md bg-gray-50 hover:shadow-md transition-shadow">
        <div className="flex items-center gap-2 mb-2">
          {getMetricIcon(metricKey)}
          <h3 className="font-semibold">{formattedName}</h3>
        </div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-medium">
            {formatMetricValue(metricKey, metric.value)}
          </span>
          <div 
            className={`text-sm font-medium px-2 py-1 rounded-full ${
              metric.score > 70 ? 'bg-green-100 text-green-800' : 
              metric.score > 40 ? 'bg-yellow-100 text-yellow-800' : 
              'bg-orange-100 text-orange-800'
            }`}
          >
            Score: {metric.score.toFixed(0)}%
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div 
            className="h-1.5 rounded-full"
            style={{ 
              width: `${metric.score}%`,
              backgroundColor: scoreColor
            }}
          ></div>
        </div>
      </div>
    );
  };

  // Create donut chart for risk factors
  export const DonutChart = ({ data, size = 200, thickness = 40 }) => {
    const radius = size / 2;
    const innerRadius = radius - thickness;
    const center = size / 2;
    let startAngle = 0;

    return (
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {data.map((item, i) => {
            // Calculate angles
            const angle = (item.contribution / 100) * 360;
            const endAngle = startAngle + angle;
            
            // Calculate path
            const startAngleRad = (startAngle - 90) * Math.PI / 180;
            const endAngleRad = (endAngle - 90) * Math.PI / 180;
            
            const x1 = center + innerRadius * Math.cos(startAngleRad);
            const y1 = center + innerRadius * Math.sin(startAngleRad);
            const x2 = center + radius * Math.cos(startAngleRad);
            const y2 = center + radius * Math.sin(startAngleRad);
            
            const x3 = center + radius * Math.cos(endAngleRad);
            const y3 = center + radius * Math.sin(endAngleRad);
            const x4 = center + innerRadius * Math.cos(endAngleRad);
            const y4 = center + innerRadius * Math.sin(endAngleRad);
            
            // Arc flags
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            // Path
            const path = [
              `M ${x1} ${y1}`,
              `L ${x2} ${y2}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x3} ${y3}`,
              `L ${x4} ${y4}`,
              `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1} ${y1}`,
              'Z'
            ].join(' ');
            
            // Update start angle for next slice
            startAngle = endAngle;
            
            return (
              <path
                key={i}
                d={path}
                fill={item.color}
              />
            );
          })}
          <circle cx={center} cy={center} r={innerRadius} fill="white" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-sm font-medium text-gray-500">Risk</span>
          <span className="text-sm font-medium text-gray-500">Factors</span>
        </div>
      </div>
    );
  };