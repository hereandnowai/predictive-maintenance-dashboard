
import React from 'react';
import { Link } from 'react-router-dom';
import { EquipmentHealthMetrics, EquipmentStatus } from '../types';
import { CogIcon, AlertIcon as WarningIcon } from './icons'; 
import { BRAND_CONFIG } from '../constants';

interface EquipmentCardProps {
  equipment: EquipmentHealthMetrics;
}

const getStatusColor = (status: EquipmentStatus): string => {
  switch (status) {
    case EquipmentStatus.OK: return 'bg-green-100 text-green-700 border-green-300';
    case EquipmentStatus.WARNING: return 'bg-yellow-100 text-yellow-700 border-yellow-300';
    case EquipmentStatus.CRITICAL: return 'bg-red-100 text-red-700 border-red-300';
    case EquipmentStatus.MAINTENANCE: return 'bg-blue-100 text-blue-700 border-blue-300';
    case EquipmentStatus.OFFLINE: return 'bg-gray-100 text-gray-700 border-gray-300';
    default: return 'bg-gray-100 text-gray-700 border-gray-300';
  }
};

const getRiskColor = (risk?: 'Low' | 'Medium' | 'High'): string => {
  if (!risk) return 'text-gray-500';
  switch (risk) {
    case 'Low': return 'text-green-600';
    case 'Medium': return 'text-yellow-600';
    case 'High': return 'text-red-600';
    default: return 'text-gray-500';
  }
};

export const EquipmentCard: React.FC<EquipmentCardProps> = ({ equipment }) => {
  const latestMetrics = equipment.metrics.length > 0 ? equipment.metrics[equipment.metrics.length - 1] : null;
  const brandColors = BRAND_CONFIG.brand.colors;

  return (
    <div className="bg-white shadow-lg rounded-xl p-6 hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-3">
          <h3 className={`text-lg font-semibold text-[${brandColors.secondary}]`}>{equipment.name}</h3>
          <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(equipment.status)}`}>
            {equipment.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-1">{equipment.type} - {equipment.location}</p>
        {equipment.predictedFailureRisk && (
          <p className={`text-sm font-medium mb-1 ${getRiskColor(equipment.predictedFailureRisk)}`}>
            Predicted Risk: {equipment.predictedFailureRisk}
          </p>
        )}
        {latestMetrics && (
          <div className="text-xs text-gray-600 space-y-0.5 mb-3">
            <p>Temp: {latestMetrics.temperature.toFixed(1)}°C</p>
            <p>Vibration: {latestMetrics.vibration.toFixed(2)} mm/s</p>
            <p>Usage: {latestMetrics.usageHours.toFixed(0)} hrs</p>
          </div>
        )}
        <div className="text-xs text-gray-500">
          <p>Last Service: {new Date(equipment.lastServiceDate).toLocaleDateString()}</p>
          {equipment.nextServiceDate && <p>Next Service: {new Date(equipment.nextServiceDate).toLocaleDateString()}</p>}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Link
          to={`/equipment/${equipment.id}`}
          className={`text-sm font-medium flex items-center text-[${brandColors.secondary}] hover:text-[${brandColors.primary}]`}
        >
          View Details <CogIcon className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </div>
  );
};
