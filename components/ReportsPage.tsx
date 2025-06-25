
import React, { useState } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { MOCK_EQUIPMENT_HEALTH, MOCK_MAINTENANCE_LOGS, MOCK_MAINTENANCE_TASKS, BRAND_CONFIG } from '../constants';
import { EquipmentStatus } from '../types';
import { DownloadIcon, ReportIcon as PageIcon } from './icons';

type ReportType = 'equipment_status' | 'maintenance_activity' | 'cost_analysis' | 'health_trends';

const StatusColors = {
  [EquipmentStatus.OK]: '#4CAF50',
  [EquipmentStatus.WARNING]: '#FFC107',
  [EquipmentStatus.CRITICAL]: '#F44336',
  [EquipmentStatus.MAINTENANCE]: '#2196F3',
  [EquipmentStatus.OFFLINE]: '#9E9E9E',
};

export const ReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState<ReportType>('equipment_status');
  const [timeRange, setTimeRange] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');
  const brandColors = BRAND_CONFIG.brand.colors;

  const generateReportData = () => {
    switch (reportType) {
      case 'equipment_status':
        const statusSummary = MOCK_EQUIPMENT_HEALTH.reduce((acc, curr) => {
          acc[curr.status] = (acc[curr.status] || 0) + 1;
          return acc;
        }, {} as Record<EquipmentStatus, number>);
        return Object.entries(statusSummary).map(([name, value]) => ({ name, value }));
      
      case 'maintenance_activity':
        const completedTasks = MOCK_MAINTENANCE_TASKS.filter(t => t.status === 'Completed').length;
        const pendingTasks = MOCK_MAINTENANCE_TASKS.filter(t => t.status === 'Pending' || t.status === 'In Progress').length;
        return [
            { name: 'Completed Tasks', value: completedTasks },
            { name: 'Pending/In Progress Tasks', value: pendingTasks },
            { name: 'Total Logs', value: MOCK_MAINTENANCE_LOGS.length },
        ];
      
      case 'health_trends': 
        return MOCK_EQUIPMENT_HEALTH.slice(0,3).map(eq => {
            const avgTemp = eq.metrics.slice(-7).reduce((sum, m) => sum + m.temperature, 0) / Math.min(7, eq.metrics.length);
            return { name: eq.name.substring(0,15)+'...', 'Avg Temp (°C)': parseFloat(avgTemp.toFixed(1)) || 0 };
        });

      default:
        return [];
    }
  };

  const reportData = generateReportData();

  const renderChart = () => {
    if (reportData.length === 0) return <p className="text-gray-500">No data available for this report.</p>;

    switch (reportType) {
      case 'equipment_status':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie data={reportData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {reportData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={StatusColors[entry.name as EquipmentStatus] || brandColors.primary} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case 'maintenance_activity':
         return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150}/>
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill={brandColors.primary} />
            </BarChart>
          </ResponsiveContainer>
        );
      case 'health_trends':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={reportData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-15} textAnchor="end" height={50} interval={0} fontSize={10}/>
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Avg Temp (°C)" fill={brandColors.primary} />
            </BarChart>
          </ResponsiveContainer>
        );
      default:
        return <p className="text-gray-500">Chart type not configured for this report.</p>;
    }
  };
  
  const handleExport = (format: 'CSV' | 'PDF') => {
      alert(`Exporting ${reportType} report for ${timeRange} period as ${format}... (Mock function)`);
  };

  return (
    <div className="p-6">
      <h1 className={`text-3xl font-bold text-[${brandColors.secondary}] mb-6`}>Reports</h1>

      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className={`text-xl font-semibold text-[${brandColors.secondary}] mb-4`}>Configure Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="report-type" className="block text-sm font-medium text-gray-700">Report Type</label>
            <select
              id="report-type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className={`mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}] sm:text-sm`}
            >
              <option value="equipment_status">Equipment Status Overview</option>
              <option value="maintenance_activity">Maintenance Activity Summary</option>
              <option value="health_trends">Health Trends (Sample)</option>
            </select>
          </div>
          <div>
            <label htmlFor="time-range" className="block text-sm font-medium text-gray-700">Time Range</label>
            <select
              id="time-range"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as 'weekly' | 'monthly' | 'quarterly')}
              className={`mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}] sm:text-sm`}
            >
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
            </select>
          </div>
           <div className="md:col-start-3 flex items-end space-x-2">
            <button onClick={() => handleExport('CSV')} className={`w-full md:w-auto flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition duration-150`}>
              <DownloadIcon className="w-5 h-5 mr-2" /> Export CSV
            </button>
            <button onClick={() => handleExport('PDF')} className={`w-full md:w-auto flex items-center justify-center bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg shadow-md transition duration-150`}>
              <DownloadIcon className="w-5 h-5 mr-2" /> Export PDF
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className={`text-xl font-semibold text-[${brandColors.secondary}] mb-4`}>
          {reportType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Report ({timeRange})
        </h2>
        {reportData.length > 0 ? renderChart() : (
            <div className="text-center py-10">
                <PageIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No data to display</h3>
                <p className="mt-1 text-sm text-gray-500">Select report parameters to generate a visual.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
