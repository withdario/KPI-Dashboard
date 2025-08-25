import React from 'react';
import { ChartDataPoint } from '../types/googleAnalytics';

interface SimpleLineChartProps {
  data: ChartDataPoint[];
  title: string;
  className?: string;
  height?: number;
  color?: string;
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  title,
  className = '',
  height = 200,
  color = '#3B82F6',
}) => {
  if (!data || data.length < 2) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-32 text-gray-500">
          Insufficient data to display chart
        </div>
      </div>
    );
  }

  const width = 600;
  const padding = 40;
  const chartWidth = width - 2 * padding;
  const chartHeight = height - 2 * padding;

  // Find min and max values for scaling
  const values = data.map(d => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // Create SVG path for the line
  const createPath = () => {
    const points = data.map((point, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    });
    return points.join(' ');
  };

  // Create grid lines
  const createGridLines = () => {
    const lines = [];
    const gridCount = 5;
    
    for (let i = 0; i <= gridCount; i++) {
      const y = padding + (i / gridCount) * chartHeight;
      const value = maxValue - (i / gridCount) * valueRange;
      
      lines.push(
        <line
          key={`grid-${i}`}
          x1={padding}
          y1={y}
          x2={width - padding}
          y2={y}
          stroke="#E5E7EB"
          strokeWidth="1"
        />
      );
      
      lines.push(
        <text
          key={`label-${i}`}
          x={padding - 10}
          y={y + 4}
          textAnchor="end"
          fontSize="12"
          fill="#6B7280"
        >
          {value.toFixed(0)}
        </text>
      );
    }
    
    return lines;
  };

  // Create axis labels
  const createAxisLabels = () => {
    const labels = [];
    const labelCount = Math.min(6, data.length);
    
    for (let i = 0; i < labelCount; i++) {
      const index = Math.floor((i / (labelCount - 1)) * (data.length - 1));
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const date = new Date(data[index].date);
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      labels.push(
        <text
          key={`axis-${i}`}
          x={x}
          y={height - 10}
          textAnchor="middle"
          fontSize="12"
          fill="#6B7280"
        >
          {label}
        </text>
      );
    }
    
    return labels;
  };

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="overflow-x-auto">
        <svg width={width} height={height} className="mx-auto">
          {/* Grid lines and labels */}
          {createGridLines()}
          
          {/* X and Y axes */}
          <line
            x1={padding}
            y1={padding}
            x2={padding}
            y2={height - padding}
            stroke="#D1D5DB"
            strokeWidth="2"
          />
          <line
            x1={padding}
            y1={height - padding}
            x2={width - padding}
            y2={height - padding}
            stroke="#D1D5DB"
            strokeWidth="2"
          />
          
          {/* Line chart */}
          <path
            d={createPath()}
            stroke={color}
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {data.map((point, index) => {
            const x = padding + (index / (data.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((point.value - minValue) / valueRange) * chartHeight;
            
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="4"
                fill={color}
                className="hover:r-6 transition-all duration-200"
              />
            );
          })}
          
          {/* X-axis labels */}
          {createAxisLabels()}
        </svg>
      </div>
    </div>
  );
};

export default SimpleLineChart;
