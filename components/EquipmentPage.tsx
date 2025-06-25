
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MOCK_EQUIPMENT_HEALTH, MOCK_MAINTENANCE_TASKS, MOCK_MAINTENANCE_LOGS, MOCK_USERS, BRAND_CONFIG, CURRENT_USER } from '../constants';
import { EquipmentHealthMetrics, HealthMetric, MaintenanceTask, MaintenanceLogEntry, EquipmentStatus, TaskStatus, TaskPriority, UserRole } from '../types';
import { HealthMetricChart } from './HealthMetricChart';
import { Modal } from './Modal';
import { PlusCircleIcon, EditIcon, TrashIcon, ChevronLeftIcon, FilterIcon, SearchIcon, CogIcon } from './icons';

const getStatusColorClass = (status: EquipmentStatus) => {
  switch (status) {
    case EquipmentStatus.OK: return 'text-green-600 bg-green-100';
    case EquipmentStatus.WARNING: return 'text-yellow-600 bg-yellow-100';
    case EquipmentStatus.CRITICAL: return 'text-red-600 bg-red-100';
    case EquipmentStatus.MAINTENANCE: return 'text-blue-600 bg-blue-100';
    case EquipmentStatus.OFFLINE: return 'text-gray-600 bg-gray-100';
    default: return 'text-gray-600 bg-gray-100';
  }
};

const getPriorityColorClass = (priority: TaskPriority) => {
    switch (priority) {
        case TaskPriority.HIGH: return 'text-red-600 bg-red-100';
        case TaskPriority.MEDIUM: return 'text-yellow-600 bg-yellow-100';
        case TaskPriority.LOW: return 'text-blue-600 bg-blue-100';
        default: return 'text-gray-600 bg-gray-100';
    }
};

const EquipmentDetailView: React.FC<{ equipment: EquipmentHealthMetrics, tasks: MaintenanceTask[], logs: MaintenanceLogEntry[], onBack: () => void, onUpdateEquipment: (updatedEquipment: EquipmentHealthMetrics) => void }> = ({ equipment, tasks, logs, onBack, onUpdateEquipment }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editableEquipment, setEditableEquipment] = useState<EquipmentHealthMetrics>(equipment);
  const brandColors = BRAND_CONFIG.brand.colors;

  useEffect(() => {
    setEditableEquipment(equipment);
  }, [equipment]);

  const handleInputChange = <K extends keyof EquipmentHealthMetrics,>(key: K, value: EquipmentHealthMetrics[K]) => {
    setEditableEquipment(prev => ({ ...prev, [key]: value }));
  };
  
  const handleSaveChanges = () => {
    onUpdateEquipment(editableEquipment);
    setIsEditModalOpen(false);
  };

  const relevantTasks = tasks.filter(task => task.equipmentId === equipment.id);
  const relevantLogs = logs.filter(log => log.equipmentId === equipment.id);

  return (
    <div className="space-y-6">
      <button onClick={onBack} className={`flex items-center text-[${brandColors.secondary}] hover:text-[${brandColors.primary}] font-medium mb-4`}>
        <ChevronLeftIcon className="w-5 h-5 mr-1" /> Back to List
      </button>
      <div className="bg-white shadow-xl rounded-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className={`text-3xl font-bold text-[${brandColors.secondary}]`}>{equipment.name}</h2>
            <p className="text-gray-600">{equipment.type} - {equipment.location}</p>
          </div>
          <div className="flex flex-col items-end">
            <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusColorClass(equipment.status)}`}>{equipment.status}</span>
            { (CURRENT_USER.role === UserRole.SUPERVISOR || CURRENT_USER.role === UserRole.MANAGER) &&
              <button onClick={() => setIsEditModalOpen(true)} className={`mt-2 text-sm text-[${brandColors.secondary}] hover:text-[${brandColors.primary}] flex items-center`}>
                <EditIcon className="w-4 h-4 mr-1" /> Edit
              </button>
            }
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
          <p><strong>Purchase Date:</strong> {new Date(equipment.purchaseDate).toLocaleDateString()}</p>
          <p><strong>Last Service:</strong> {new Date(equipment.lastServiceDate).toLocaleDateString()}</p>
          {equipment.nextServiceDate && <p><strong>Next Suggested Service:</strong> {new Date(equipment.nextServiceDate).toLocaleDateString()}</p>}
          <p><strong>Predicted Risk:</strong> <span className={
              equipment.predictedFailureRisk === 'High' ? 'text-red-600 font-semibold' : 
              equipment.predictedFailureRisk === 'Medium' ? 'text-yellow-600 font-semibold' : 'text-green-600 font-semibold'
            }>{equipment.predictedFailureRisk || 'N/A'}</span>
          </p>
          {equipment.notes && <p className="md:col-span-2"><strong>Notes:</strong> {equipment.notes}</p>}
        </div>

        <h3 className={`text-xl font-semibold text-[${brandColors.secondary}] mb-4 mt-8`}>Health Metrics (Last 30 days)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <HealthMetricChart data={equipment.metrics} metricType="temperature" color="#FF6384" title="Temperature (°C)" />
          <HealthMetricChart data={equipment.metrics} metricType="vibration" color="#36A2EB" title="Vibration (mm/s)" />
          <HealthMetricChart data={equipment.metrics} metricType="usageHours" color="#FFCE56" title="Usage Hours" />
          <HealthMetricChart data={equipment.metrics} metricType="energyConsumption" color="#4BC0C0" title="Energy (kWh)" />
        </div>
        
        <div className="mt-8">
            <h3 className={`text-xl font-semibold text-[${brandColors.secondary}] mb-2`}>Maintenance Tasks ({relevantTasks.length})</h3>
            {relevantTasks.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {relevantTasks.map(task => (
                        <li key={task.id} className="py-3">
                            <div className="flex justify-between items-center">
                                <span className={`font-medium text-[${brandColors.secondary}]`}>{task.description}</span>
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityColorClass(task.priority)}`}>{task.priority}</span>
                            </div>
                            <p className="text-xs text-gray-500">Due: {new Date(task.dueDate).toLocaleDateString()} - Status: {task.status} - Assigned to: {task.assignedTo}</p>
                        </li>
                    ))}
                </ul>
            ) : <p className="text-gray-500">No maintenance tasks for this equipment.</p>}
        </div>

        <div className="mt-8">
            <h3 className={`text-xl font-semibold text-[${brandColors.secondary}] mb-2`}>Maintenance Logs ({relevantLogs.length})</h3>
            {relevantLogs.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                    {relevantLogs.map(log => (
                        <li key={log.id} className="py-3">
                            <p className={`font-medium text-[${brandColors.secondary}]`}>{log.description}</p>
                            <p className="text-xs text-gray-500">Date: {new Date(log.date).toLocaleDateString()} - By: {log.performedBy} - Duration: {log.durationHours}h</p>
                            {log.partsUsed.length > 0 && (
                                <p className="text-xs text-gray-500">Parts: {log.partsUsed.map(p => `${p.partName} (x${p.quantity})`).join(', ')}</p>
                            )}
                        </li>
                    ))}
                </ul>
            ) : <p className="text-gray-500">No maintenance logs for this equipment.</p>}
        </div>
      </div>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Equipment Details">
        <div className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" id="name" value={editableEquipment.name} onChange={(e) => handleInputChange('name', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}] sm:text-sm p-2`} />
          </div>
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
            <input type="text" id="type" value={editableEquipment.type} onChange={(e) => handleInputChange('type', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}] sm:text-sm p-2`} />
          </div>
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" id="location" value={editableEquipment.location} onChange={(e) => handleInputChange('location', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}] sm:text-sm p-2`} />
          </div>
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
            <select id="status" value={editableEquipment.status} onChange={(e) => handleInputChange('status', e.target.value as EquipmentStatus)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}] sm:text-sm p-2`}>
              {Object.values(EquipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes</label>
            <textarea id="notes" value={editableEquipment.notes || ''} onChange={(e) => handleInputChange('notes', e.target.value)} rows={3} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}] sm:text-sm p-2`} />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
            <button type="button" onClick={handleSaveChanges} className={`px-4 py-2 text-sm font-medium text-[${brandColors.secondary}] bg-[${brandColors.primary}] rounded-md hover:brightness-90`}>Save Changes</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};


export const EquipmentPage: React.FC = () => {
  const { equipmentId } = useParams<{ equipmentId?: string }>();
  const navigate = useNavigate();
  const [allEquipment, setAllEquipment] = useState<EquipmentHealthMetrics[]>(MOCK_EQUIPMENT_HEALTH);
  const [allTasks, setAllTasks] = useState<MaintenanceTask[]>(MOCK_MAINTENANCE_TASKS);
  const [allLogs, setAllLogs] = useState<MaintenanceLogEntry[]>(MOCK_MAINTENANCE_LOGS);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<EquipmentStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<string | 'ALL'>('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newEquipment, setNewEquipment] = useState<Partial<EquipmentHealthMetrics>>({
    name: '', type: '', location: '', status: EquipmentStatus.OK, metrics: [],
    lastServiceDate: new Date().toISOString(), purchaseDate: new Date().toISOString()
  });
  const brandColors = BRAND_CONFIG.brand.colors;

  const handleAddEquipment = () => {
    const newId = `eq-${Date.now()}`;
    const completeNewEquipment: EquipmentHealthMetrics = {
      id: newId,
      name: newEquipment.name || 'New Equipment',
      type: newEquipment.type || 'Unknown',
      location: newEquipment.location || 'Unassigned',
      status: newEquipment.status || EquipmentStatus.OK,
      lastServiceDate: newEquipment.lastServiceDate || new Date().toISOString(),
      purchaseDate: newEquipment.purchaseDate || new Date().toISOString(),
      metrics: [], 
      predictedFailureRisk: 'Low'
    };
    setAllEquipment(prev => [...prev, completeNewEquipment]);
    setIsAddModalOpen(false);
    setNewEquipment({ name: '', type: '', location: '', status: EquipmentStatus.OK, metrics: [], lastServiceDate: new Date().toISOString(), purchaseDate: new Date().toISOString()});
  };

  const handleDeleteEquipment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this equipment? This action cannot be undone.')) {
        setAllEquipment(prev => prev.filter(eq => eq.id !== id));
        setAllTasks(prev => prev.filter(task => task.equipmentId !== id));
        setAllLogs(prev => prev.filter(log => log.equipmentId !== id));
        if (equipmentId === id) { 
          navigate('/equipment');
        }
    }
  };
  
  const handleUpdateEquipment = (updatedEquipment: EquipmentHealthMetrics) => {
    setAllEquipment(prev => prev.map(eq => eq.id === updatedEquipment.id ? updatedEquipment : eq));
  };

  const selectedEquipment = useMemo(() => {
    return equipmentId ? allEquipment.find(eq => eq.id === equipmentId) : undefined;
  }, [equipmentId, allEquipment]);

  const equipmentTypes = useMemo(() => ['ALL', ...new Set(allEquipment.map(eq => eq.type))], [allEquipment]);

  const filteredEquipment = useMemo(() => {
    return allEquipment.filter(eq => {
      const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) || eq.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'ALL' || eq.status === statusFilter;
      const matchesType = typeFilter === 'ALL' || eq.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [allEquipment, searchTerm, statusFilter, typeFilter]);

  if (equipmentId && selectedEquipment) {
    return <EquipmentDetailView equipment={selectedEquipment} tasks={allTasks} logs={allLogs} onBack={() => navigate('/equipment')} onUpdateEquipment={handleUpdateEquipment} />;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold text-[${brandColors.secondary}]`}>Office Equipment</h1>
        {(CURRENT_USER.role === UserRole.SUPERVISOR || CURRENT_USER.role === UserRole.MANAGER) &&
        <button onClick={() => setIsAddModalOpen(true)} className={`flex items-center bg-[${brandColors.primary}] hover:brightness-90 text-[${brandColors.secondary}] font-medium py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out`}>
          <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Equipment
        </button>
        }
      </div>

      {/* Filters and Search */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="search-equipment" className="block text-sm font-medium text-gray-700">Search</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                type="text"
                id="search-equipment"
                className={`focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}] block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2`}
                placeholder="Name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">Status</label>
            <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as EquipmentStatus | 'ALL')} className={`mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}] sm:text-sm`}>
              <option value="ALL">All Statuses</option>
              {Object.values(EquipmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700">Type</label>
            <select id="type-filter" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={`mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}] sm:text-sm`}>
              {equipmentTypes.map(t => <option key={t} value={t}>{t === 'ALL' ? 'All Types' : t}</option>)}
            </select>
          </div>
          <div className="flex items-center">
             <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
             <span className="text-sm text-gray-600">{filteredEquipment.length} results</span>
          </div>
        </div>
      </div>

      {filteredEquipment.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Service</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEquipment.map((eq) => (
                <tr key={eq.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/equipment/${eq.id}`} className={`text-sm font-medium text-[${brandColors.secondary}] hover:text-[${brandColors.primary}]`}>{eq.name}</Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{eq.location}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(eq.status)}`}>
                      {eq.status}
                    </span>
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                      eq.predictedFailureRisk === 'High' ? 'text-red-600' : 
                      eq.predictedFailureRisk === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                    {eq.predictedFailureRisk || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {eq.nextServiceDate ? new Date(eq.nextServiceDate).toLocaleDateString() : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link to={`/equipment/${eq.id}`} className={`text-[${brandColors.secondary}] hover:text-[${brandColors.primary}] mr-3`}><CogIcon className="w-5 h-5 inline-block" title="View Details" /></Link>
                    {(CURRENT_USER.role === UserRole.SUPERVISOR || CURRENT_USER.role === UserRole.MANAGER) &&
                        <button onClick={() => handleDeleteEquipment(eq.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5 inline-block" title="Delete Equipment" /></button>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
          <CogIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No equipment found</h3>
          <p className="mt-1 text-sm text-gray-500">Adjust your filters or add new equipment.</p>
        </div>
      )}
      
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Equipment">
        <div className="space-y-4">
          <div>
            <label htmlFor="new-name" className="block text-sm font-medium text-gray-700">Name</label>
            <input type="text" id="new-name" value={newEquipment.name || ''} onChange={(e) => setNewEquipment(prev => ({ ...prev, name: e.target.value }))} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
          </div>
          <div>
            <label htmlFor="new-type" className="block text-sm font-medium text-gray-700">Type</label>
            <input type="text" id="new-type" value={newEquipment.type || ''} onChange={(e) => setNewEquipment(prev => ({ ...prev, type: e.target.value }))} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
          </div>
          <div>
            <label htmlFor="new-location" className="block text-sm font-medium text-gray-700">Location</label>
            <input type="text" id="new-location" value={newEquipment.location || ''} onChange={(e) => setNewEquipment(prev => ({ ...prev, location: e.target.value }))} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
          </div>
           <div>
            <label htmlFor="new-purchaseDate" className="block text-sm font-medium text-gray-700">Purchase Date</label>
            <input type="date" id="new-purchaseDate" value={newEquipment.purchaseDate ? newEquipment.purchaseDate.substring(0,10) : ''} onChange={(e) => setNewEquipment(prev => ({ ...prev, purchaseDate: new Date(e.target.value).toISOString() }))} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
          </div>
          <div>
            <label htmlFor="new-lastServiceDate" className="block text-sm font-medium text-gray-700">Last Service Date</label>
            <input type="date" id="new-lastServiceDate" value={newEquipment.lastServiceDate ? newEquipment.lastServiceDate.substring(0,10) : ''} onChange={(e) => setNewEquipment(prev => ({ ...prev, lastServiceDate: new Date(e.target.value).toISOString() }))} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
          </div>
          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
            <button type="button" onClick={handleAddEquipment} className={`px-4 py-2 text-sm font-medium text-[${brandColors.secondary}] bg-[${brandColors.primary}] rounded-md hover:brightness-90`}>Add Equipment</button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default EquipmentPage;
