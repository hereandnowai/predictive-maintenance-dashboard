
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { HealthMetric, ChartDataPoint } from '../types';

interface HealthMetricChartProps {
  data: HealthMetric[];
  metricType: keyof Omit<HealthMetric, 'timestamp' | 'usageHours' | 'energyConsumption'> | 'usageHours' | 'energyConsumption';
  color: string;
  title: string;
}

const formatXAxis = (timestamp: number) => {
  return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const HealthMetricChart: React.FC<HealthMetricChartProps> = ({ data, metricType, color, title }) => {
  const chartData: ChartDataPoint[] = data.map(metric => ({
    date: formatXAxis(metric.timestamp),
    value: metric[metricType] as number, // Cast as number
  }));

  if (!data || data.length === 0) {
    return <div className="text-center p-4 text-gray-500">{title}: No data available.</div>;
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow h-72">
      <h3 className="text-md font-semibold text-gray-700 mb-2">{title}</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" stroke="#666" fontSize={12} />
          <YAxis stroke="#666" fontSize={12} domain={['auto', 'auto']} />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '8px', borderColor: '#ccc' }}
            labelStyle={{ color: '#333', fontWeight: 'bold' }}
            formatter={(value: number) => [value.toFixed(2), metricType.charAt(0).toUpperCase() + metricType.slice(1)]}
          />
          <Legend wrapperStyle={{fontSize: "12px", paddingTop: "10px"}}/>
          <Line type="monotone" dataKey="value" name={metricType.charAt(0).toUpperCase() + metricType.slice(1)} stroke={color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
