
import React, { useState, useEffect } from 'react';
import { EquipmentHealthMetrics, Alert, MaintenanceTask, EquipmentStatus, AlertSeverity } from '../types';
import { MOCK_EQUIPMENT_HEALTH, MOCK_ALERTS, MOCK_MAINTENANCE_TASKS, BRAND_CONFIG } from '../constants';
import { EquipmentCard } from './EquipmentCard';
import { AlertIcon, CheckCircleIcon, CogIcon, ScheduleIcon } from './icons';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const StatusColors = {
  [EquipmentStatus.OK]: '#4CAF50', // green
  [EquipmentStatus.WARNING]: '#FFC107', // amber
  [EquipmentStatus.CRITICAL]: '#F44336', // red
  [EquipmentStatus.MAINTENANCE]: '#2196F3', // blue
  [EquipmentStatus.OFFLINE]: '#9E9E9E', // grey
};

export const DashboardPage: React.FC = () => {
  const [equipment, setEquipment] = useState<EquipmentHealthMetrics[]>(MOCK_EQUIPMENT_HEALTH);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [tasks, setTasks] = useState<MaintenanceTask[]>(MOCK_MAINTENANCE_TASKS);
  const brandColors = BRAND_CONFIG.brand.colors;

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setEquipment(prevEquipment => 
        prevEquipment.map(eq => {
          if (eq.status === EquipmentStatus.MAINTENANCE || eq.status === EquipmentStatus.OFFLINE) return eq;
          const newMetrics = [...eq.metrics];
          const lastMetric = newMetrics[newMetrics.length - 1];
          if (lastMetric) {
            newMetrics.push({
              ...lastMetric,
              timestamp: Date.now(),
              vibration: Math.max(0, parseFloat((lastMetric.vibration + (Math.random() - 0.45) * 0.05).toFixed(2))),
              temperature: Math.max(15, parseFloat((lastMetric.temperature + (Math.random() - 0.45) * 0.5).toFixed(1))),
              usageHours: parseFloat((lastMetric.usageHours + Math.random() * 0.5).toFixed(2)),
              energyConsumption: parseFloat((lastMetric.energyConsumption + Math.random() * 0.1).toFixed(2)),
            });
             if (newMetrics.length > 50) newMetrics.shift(); // Keep last 50 points
          }
          return { ...eq, metrics: newMetrics };
        })
      );
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);


  const equipmentStatusSummary = equipment.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<EquipmentStatus, number>);

  const equipmentStatusChartData = Object.entries(equipmentStatusSummary).map(([name, value]) => ({ name, value }));
  
  const criticalAlertsCount = alerts.filter(alert => alert.severity === AlertSeverity.ERROR && !alert.acknowledged).length;
  const warningAlertsCount = alerts.filter(alert => alert.severity === AlertSeverity.WARNING && !alert.acknowledged).length;
  const upcomingTasksCount = tasks.filter(task => task.status !== 'Completed' && new Date(task.dueDate) > new Date()).length;

  return (
    <div className="p-6 space-y-6">
      <h1 className={`text-3xl font-bold text-[${brandColors.secondary}]`}>Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Equipment" value={equipment.length.toString()} icon={<CogIcon className={`w-8 h-8 text-[${brandColors.secondary}]`} />} />
        <StatCard title="Critical Alerts" value={criticalAlertsCount.toString()} icon={<AlertIcon className="w-8 h-8 text-red-500" />} linkTo="/alerts" />
        <StatCard title="Warning Alerts" value={warningAlertsCount.toString()} icon={<AlertIcon className="w-8 h-8 text-yellow-500" />} linkTo="/alerts" />
        <StatCard title="Upcoming Tasks" value={upcomingTasksCount.toString()} icon={<ScheduleIcon className="w-8 h-8 text-green-500" />} linkTo="/schedule" />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className={`text-xl font-semibold text-[${brandColors.secondary}] mb-4`}>Equipment Status Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={equipmentStatusChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill={brandColors.primary}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {equipmentStatusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={StatusColors[entry.name as EquipmentStatus]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className={`text-xl font-semibold text-[${brandColors.secondary}] mb-4`}>Predicted Failure Risks</h2>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={equipment.map(e => ({ name: e.name.substring(0,15) + '...', risk: e.predictedFailureRisk === 'High' ? 3 : e.predictedFailureRisk === 'Medium' ? 2 : 1 }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-30} textAnchor="end" height={70} interval={0} fontSize={10} />
                    <YAxis allowDecimals={false}  ticks={[1,2,3]} tickFormatter={(value) => ['Low','Medium','High'][value-1]}/>
                    <Tooltip formatter={(value) => (value === 3 ? 'High' : value === 2 ? 'Medium' : 'Low')} />
                    <Legend payload={[{value: 'Low', type:'square', color: StatusColors.OK}, {value: 'Medium', type:'square', color: StatusColors.Warning}, {value: 'High', type:'square', color: StatusColors.Critical}]} />
                    <Bar dataKey="risk">
                        {equipment.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.predictedFailureRisk === 'High' ? StatusColors.Critical : entry.predictedFailureRisk === 'Medium' ? StatusColors.Warning : StatusColors.OK} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
      </div>
      
      {/* Quick Access Sections */}
      <div>
        <h2 className={`text-2xl font-semibold text-[${brandColors.secondary}] mb-4`}>Critical Equipment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {equipment
            .filter(eq => eq.status === EquipmentStatus.CRITICAL || eq.predictedFailureRisk === 'High')
            .slice(0, 3)
            .map(eq => <EquipmentCard key={eq.id} equipment={eq} />)}
        </div>
        {equipment.filter(eq => eq.status === EquipmentStatus.CRITICAL || eq.predictedFailureRisk === 'High').length === 0 && (
          <p className="text-gray-500">No equipment currently in critical condition or high risk.</p>
        )}
      </div>

      <div>
        <h2 className={`text-2xl font-semibold text-[${brandColors.secondary}] mb-4`}>Recent Alerts</h2>
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {alerts.slice(0, 5).map(alert => (
              <li key={alert.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <AlertIcon className={`w-5 h-5 ${alert.severity === AlertSeverity.ERROR ? 'text-red-500' : alert.severity === AlertSeverity.WARNING ? 'text-yellow-500' : `text-[${brandColors.secondary}]`}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium text-[${brandColors.secondary}] truncate`}>{alert.equipmentName}: {alert.message}</p>
                    <p className="text-xs text-gray-500">{new Date(alert.timestamp).toLocaleString()}</p>
                  </div>
                  {alert.acknowledged ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <span className="text-xs text-red-500 font-semibold">Needs Ack</span>}
                </div>
              </li>
            ))}
          </ul>
           {alerts.length === 0 && <p className="p-4 text-gray-500">No recent alerts.</p>}
        </div>
      </div>
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  linkTo?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, linkTo }) => {
  const brandColors = BRAND_CONFIG.brand.colors;
  const content = (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-500 font-medium">{title}</p>
        <p className={`text-3xl font-bold text-[${brandColors.secondary}]`}>{value}</p>
      </div>
      <div className="p-3 bg-gray-100 rounded-full">
        {icon}
      </div>
    </div>
  );
  return linkTo ? <Link to={linkTo}>{content}</Link> : content;
};

export default DashboardPage;
