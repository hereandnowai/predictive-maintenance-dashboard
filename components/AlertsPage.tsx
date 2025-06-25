
import React, { useState, useMemo } from 'react';
import { MOCK_ALERTS, BRAND_CONFIG } from '../constants';
import { Alert, AlertSeverity } from '../types';
import { AlertIcon as AlertBellIcon, CheckCircleIcon, FilterIcon, SearchIcon, XCircleIcon } from './icons'; 

const getSeverityColorClass = (severity: AlertSeverity) => {
  switch (severity) {
    case AlertSeverity.INFO: return `border-blue-500 bg-blue-50 text-[${BRAND_CONFIG.brand.colors.secondary}]`;
    case AlertSeverity.WARNING: return 'border-yellow-500 bg-yellow-50 text-yellow-700';
    case AlertSeverity.ERROR: return 'border-red-500 bg-red-50 text-red-700';
    default: return `border-gray-500 bg-gray-50 text-[${BRAND_CONFIG.brand.colors.secondary}]`;
  }
};

const getSeverityIcon = (severity: AlertSeverity) => {
    const brandColors = BRAND_CONFIG.brand.colors;
    switch (severity) {
        case AlertSeverity.INFO: return <AlertBellIcon className={`w-5 h-5 text-blue-500`} />;
        case AlertSeverity.WARNING: return <AlertBellIcon className="w-5 h-5 text-yellow-500" />;
        case AlertSeverity.ERROR: return <AlertBellIcon className="w-5 h-5 text-red-500" />;
        default: return <AlertBellIcon className={`w-5 h-5 text-gray-500`} />;
    }
};

export const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'ALL'>('ALL');
  const [acknowledgedFilter, setAcknowledgedFilter] = useState<'ALL' | 'ACKNOWLEDGED' | 'UNACKNOWLEDGED'>('ALL');
  const brandColors = BRAND_CONFIG.brand.colors;

  const handleAcknowledge = (alertId: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ));
  };
  
  const handleAcknowledgeAll = () => {
    setAlerts(alerts.map(alert => ({ ...alert, acknowledged: true })));
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
        const matchesSearch = alert.message.toLowerCase().includes(searchTerm.toLowerCase()) || alert.equipmentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
        const matchesAcknowledged = 
            acknowledgedFilter === 'ALL' ||
            (acknowledgedFilter === 'ACKNOWLEDGED' && alert.acknowledged) ||
            (acknowledgedFilter === 'UNACKNOWLEDGED' && !alert.acknowledged);
        return matchesSearch && matchesSeverity && matchesAcknowledged;
    }).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); 
  }, [alerts, searchTerm, severityFilter, acknowledgedFilter]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold text-[${brandColors.secondary}]`}>System Alerts</h1>
        {filteredAlerts.some(a => !a.acknowledged) && (
            <button 
                onClick={handleAcknowledgeAll}
                className={`bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out flex items-center`}
            >
                <CheckCircleIcon className="w-5 h-5 mr-2" /> Acknowledge All Visible
            </button>
        )}
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="search-alerts" className="block text-sm font-medium text-gray-700">Search</label>
             <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    id="search-alerts"
                    className={`focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}] block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2`}
                    placeholder="Message or Equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
          <div>
            <label htmlFor="severity-filter" className="block text-sm font-medium text-gray-700">Severity</label>
            <select id="severity-filter" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value as AlertSeverity | 'ALL')} className={`mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}>
              <option value="ALL">All Severities</option>
              {Object.values(AlertSeverity).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="acknowledged-filter" className="block text-sm font-medium text-gray-700">Status</label>
            <select id="acknowledged-filter" value={acknowledgedFilter} onChange={(e) => setAcknowledgedFilter(e.target.value as 'ALL' | 'ACKNOWLEDGED' | 'UNACKNOWLEDGED')} className={`mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}>
              <option value="ALL">All</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="UNACKNOWLEDGED">Unacknowledged</option>
            </select>
          </div>
           <div className="flex items-center">
             <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
             <span className="text-sm text-gray-600">{filteredAlerts.length} alerts</span>
          </div>
        </div>
      </div>

      {filteredAlerts.length > 0 ? (
        <div className="space-y-4">
          {filteredAlerts.map(alert => (
            <div key={alert.id} className={`p-4 rounded-lg shadow-md border-l-4 flex items-start space-x-3 ${getSeverityColorClass(alert.severity)}`}>
              <div className="flex-shrink-0 pt-0.5">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-semibold`}>{alert.equipmentName}: <span className="font-normal">{alert.message}</span></p>
                <p className="text-xs text-opacity-80">{new Date(alert.timestamp).toLocaleString()} - Severity: {alert.severity}</p>
              </div>
              <div>
                {alert.acknowledged ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircleIcon className="w-4 h-4 mr-1.5" /> Acknowledged
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500`}
                  >
                    <XCircleIcon className="w-4 h-4 mr-1.5" /> Acknowledge
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
         <div className="text-center py-10 bg-white rounded-lg shadow">
            <AlertBellIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alerts found</h3>
            <p className="mt-1 text-sm text-gray-500">System is clear, or try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
