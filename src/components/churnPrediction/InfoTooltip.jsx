import React, { useState, useRef, useEffect } from 'react';
import { Info } from 'lucide-react';

// Premium tooltip component with advanced design and optimal positioning
export const Tooltip = ({ children, content, width = 280 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: true, right: false });
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  
  // Calculate optimal position for tooltip when shown
  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      // Calculate if tooltip should be above/below or left/right
      const newPosition = {
        top: triggerRect.top > tooltipRect.height,
        right: triggerRect.left + tooltipRect.width > viewportWidth - 20
      };
      
      setPosition(newPosition);
    }
  }, [isVisible]);
  
  // Position classes based on calculated position
  const positionClasses = position.right
    ? "right-0 -translate-y-1/2"
    : "left-0 transform translate-x-6 -translate-y-1/2";
  
  return (
    <div className="relative inline-flex items-center">
      {children}
      <div 
        ref={triggerRef}
        className="ml-1 cursor-pointer transition-colors duration-200"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <Info size={16} />
      </div>
      {isVisible && (
        <div 
          ref={tooltipRef}
          className={`absolute z-50 ${positionClasses}`}
          style={{ width: `${width}px` }}
        >
          <div className="relative bg-gray-200 p-3 rounded-md shadow-lg border border-gray-300 text-black text-sm leading-relaxed">
            {/* Arrow pointing to the info icon */}
            <div className={`absolute ${position.right ? '-right-3' : '-left-3'} top-1/2 transform -translate-y-1/2 ${
              position.right 
                ? 'border-t-4 border-b-4 border-l-8 border-t-transparent border-b-transparent border-l-gray-800' 
                : 'border-t-4 border-b-4 border-r-8 border-t-transparent border-b-transparent border-r-gray-800'
            }`}></div>
            
            {/* Tooltip content with enhanced styles */}
            <div className="font-normal tracking-wide">{content}</div>
          </div>
        </div>
      )}
    </div>
  );
};

// Alternative design with a title section
export const TooltipWithTitle = ({ children, title, content, width = 280 }) => {
  const [isVisible, setIsVisible] = useState(false);
  
  return (
    <div className="relative inline-flex items-center">
      {children}
      <div 
        className="ml-1 text-gray-500 cursor-help hover:text-blue-500 transition-colors duration-200"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        <Info size={16} />
      </div>
      {isVisible && (
        <div 
          className="absolute z-50 left-0 transform translate-x-6 -translate-y-1/2"
          style={{ width: `${width}px` }}
        >
          <div className="relative bg-gray-800 rounded-md shadow-lg border border-gray-700 overflow-hidden">
            {/* Title section */}
            <div className="bg-gray-700 px-3 py-2 font-medium text-xs text-white border-b border-gray-600">
              {title}
            </div>
            
            {/* Content section */}
            <div className="p-3 text-white text-xs leading-relaxed">
              {content}
            </div>
            
            {/* Arrow pointing to the info icon */}
            <div className="absolute -left-3 top-1/2 transform -translate-y-1/2 border-t-4 border-b-4 border-r-8 border-t-transparent border-b-transparent border-r-gray-800"></div>
          </div>
        </div>
      )}
    </div>
  );
};

// Tooltip content definitions with improved clarity
export const tooltipContent = {
  // Overview section
  churnRiskScore: "A numerical score (0-100) representing the probability of driver leaving the platform. Higher values indicate greater risk.",
  
  riskFactors: "Breakdown of how each category contributes to the overall churn risk as a percentage of total risk.",
  
  recommendations: "Actionable suggestions to reduce churn risk, prioritized by potential impact and relevance to this driver.",
  
  // Risk level explanations
  riskLevelCritical: "90-100: Extremely high risk of churn. Immediate intervention required.",
  riskLevelHigh: "70-89: High likelihood of leaving. Proactive engagement needed.",
  riskLevelMedium: "50-69: Moderate risk. Active monitoring recommended.",
  riskLevelLow: "30-49: Below average risk. Regular engagement sufficient.",
  riskLevelVeryLow: "0-29: Minimal risk of leaving. Maintain standard support.",
  
  // Metric categories
  profileMetrics: "Factors related to driver identity and characteristics. Makes up 20% of total risk assessment.",
  
  engagementMetrics: "How actively the driver participates on the platform. Makes up 50% of total risk assessment.",
  
  financialMetrics: "Earnings and financial performance metrics. Makes up 15% of total risk assessment.",
  
  behavioralMetrics: "Driver's usage patterns and behavior. Makes up 15% of total risk assessment.",
  
  // Individual metrics
  registrationAge: "Days since driver registered. Newer drivers typically have higher churn risk.",
  
  vehicleTypeScore: "Rating of vehicle type based on platform performance data. Some vehicle types correlate with lower churn.",
  
  driverRating: "Average rating given by riders. Lower ratings correlate with higher churn risk.",
  
  ridesCompleted: "Average number of rides completed per day. More rides indicate higher engagement.",
  
  onlineTime: "Average hours online per day. More online time shows greater commitment.",
  
  acceptanceRate: "Percentage of ride requests accepted. Lower rates may indicate dissatisfaction.",
  
  cancellationRate: "Percentage of accepted rides later cancelled. Higher rates often precede churn.",
  
  rideArrived: "Total number of rides where driver successfully arrived at pickup point.",
  
  monthlyEarnings: "Total earnings in the last 30 days. Lower earnings increase churn risk.",
  
  avgEarningsPerRide: "Average earnings per completed ride. May indicate efficiency or ride quality.",
  
  lastActive: "Days since the driver last opened the app. Longer periods indicate disengagement.",
  
  appUsage: "Average app usage time in minutes per day. Lower usage may signal reduced interest.",

  // Additional tooltip content for special metrics
  categoryWeight: "The percentage impact this category has on the overall churn risk calculation.",
  categoryScore: "Performance score for this category (0-100%). Higher scores indicate lower churn risk in this area.",
  metricWeight: "The importance of this specific metric within its category.",
  metricValue: "The actual measured value for this metric.",
  metricScore: "Normalized score (0-100%) indicating how this value compares to target benchmarks."
};

// Usage example:
// <Tooltip content={tooltipContent.churnRiskScore} width={300}>Churn Risk Score</Tooltip>
// <TooltipWithTitle title="Churn Risk Score" content={tooltipContent.churnRiskScore}>Churn Risk Score</TooltipWithTitle>