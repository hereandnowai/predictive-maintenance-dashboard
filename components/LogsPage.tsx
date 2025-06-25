
import React, { useState, useMemo } from 'react';
import { MOCK_MAINTENANCE_LOGS, MOCK_EQUIPMENT, MOCK_USERS, MOCK_SPARE_PARTS, BRAND_CONFIG, CURRENT_USER } from '../constants';
import { MaintenanceLogEntry, Equipment, User, SparePart, UserRole } from '../types';
import { Modal } from './Modal';
import { PlusCircleIcon, FilterIcon, SearchIcon, LogIcon as PageIcon } from './icons';

export const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<MaintenanceLogEntry[]>(MOCK_MAINTENANCE_LOGS);
  const [equipmentList] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [users] = useState<User[]>(MOCK_USERS);
  const [spareParts] = useState<SparePart[]>(MOCK_SPARE_PARTS);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLogEntry, setNewLogEntry] = useState<Partial<MaintenanceLogEntry>>({
    equipmentId: equipmentList[0]?.id || '',
    equipmentName: equipmentList[0]?.name || '',
    date: new Date().toISOString().split('T')[0],
    performedBy: CURRENT_USER.name,
    description: '',
    partsUsed: [],
    durationHours: 1,
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [equipmentFilter, setEquipmentFilter] = useState<string | 'ALL'>('ALL');
  const [technicianFilter, setTechnicianFilter] = useState<string | 'ALL'>('ALL');
  const brandColors = BRAND_CONFIG.brand.colors;

  const handleInputChange = <K extends keyof MaintenanceLogEntry,>(key: K, value: MaintenanceLogEntry[K]) => {
    setNewLogEntry({ ...newLogEntry, [key]: value });
     if(key === 'equipmentId'){
        const selectedEquipment = equipmentList.find(e => e.id === value);
        if(selectedEquipment){
            setNewLogEntry(prev => ({...prev!, equipmentName: selectedEquipment.name}));
        }
    }
  };

  const handleAddPartUsed = () => {
    setNewLogEntry(prev => ({
      ...prev,
      partsUsed: [...(prev.partsUsed || []), { partId: spareParts[0]?.id || '', partName: spareParts[0]?.name || '', quantity: 1 }]
    }));
  };

  const handlePartUsedChange = (index: number, field: 'partId' | 'quantity', value: string | number) => {
    const updatedParts = [...(newLogEntry.partsUsed || [])];
    if (field === 'partId') {
      const selectedPart = spareParts.find(p => p.id === value);
      updatedParts[index] = { ...updatedParts[index], partId: value as string, partName: selectedPart?.name || '' };
    } else {
      updatedParts[index] = { ...updatedParts[index], quantity: Number(value) };
    }
    setNewLogEntry(prev => ({ ...prev, partsUsed: updatedParts }));
  };
  
  const handleRemovePartUsed = (index: number) => {
    setNewLogEntry(prev => ({
        ...prev,
        partsUsed: (prev.partsUsed || []).filter((_, i) => i !== index)
    }));
  };

  const handleSaveLog = () => {
    if (!newLogEntry.description || !newLogEntry.equipmentId || !newLogEntry.date || !newLogEntry.performedBy) {
        alert("Please fill all required fields.");
        return;
    }
    const logToSave: MaintenanceLogEntry = {
      ...newLogEntry,
      id: `log-${Date.now()}`,
      description: newLogEntry.description!,
      equipmentId: newLogEntry.equipmentId!,
      equipmentName: equipmentList.find(e => e.id === newLogEntry.equipmentId)?.name || 'Unknown Equipment',
      date: new Date(newLogEntry.date!).toISOString(),
      performedBy: newLogEntry.performedBy!,
      partsUsed: newLogEntry.partsUsed || [],
      durationHours: newLogEntry.durationHours || 0,
    };
    setLogs([logToSave, ...logs]);
    setIsModalOpen(false);
    setNewLogEntry({
        equipmentId: equipmentList[0]?.id || '',
        equipmentName: equipmentList[0]?.name || '',
        date: new Date().toISOString().split('T')[0],
        performedBy: CURRENT_USER.name,
        description: '',
        partsUsed: [],
        durationHours: 1,
    });
  };

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
        const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) || log.equipmentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesEquipment = equipmentFilter === 'ALL' || log.equipmentId === equipmentFilter;
        const matchesTechnician = technicianFilter === 'ALL' || log.performedBy === technicianFilter;
        return matchesSearch && matchesEquipment && matchesTechnician;
    }).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()); 
  }, [logs, searchTerm, equipmentFilter, technicianFilter]);
  
  const equipmentNamesForFilter = useMemo(() => ['ALL', ...new Set(equipmentList.map(eq => eq.name))], [equipmentList]);
  const technicianNamesForFilter = useMemo(() => ['ALL', ...new Set(users.map(user => user.name))], [users]);


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold text-[${brandColors.secondary}]`}>Maintenance Logs</h1>
        {CURRENT_USER.role !== UserRole.MANAGER && 
        <button onClick={() => setIsModalOpen(true)} className={`flex items-center bg-[${brandColors.primary}] hover:brightness-90 text-[${brandColors.secondary}] font-medium py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out`}>
          <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Log Entry
        </button>
        }
      </div>

      {/* Filters */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label htmlFor="search-logs" className="block text-sm font-medium text-gray-700">Search</label>
             <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    type="text"
                    id="search-logs"
                    className={`focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}] block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2`}
                    placeholder="Description or Equipment..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
          <div>
            <label htmlFor="equipment-filter" className="block text-sm font-medium text-gray-700">Equipment</label>
            <select id="equipment-filter" value={equipmentFilter} onChange={(e) => setEquipmentFilter(e.target.value)} className={`mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}>
              {equipmentNamesForFilter.map(name => <option key={name} value={name === 'ALL' ? 'ALL' : equipmentList.find(eq=>eq.name === name)?.id}>{name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="technician-filter" className="block text-sm font-medium text-gray-700">Technician</label>
            <select id="technician-filter" value={technicianFilter} onChange={(e) => setTechnicianFilter(e.target.value)} className={`mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}>
              {technicianNamesForFilter.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </div>
           <div className="flex items-center">
             <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
             <span className="text-sm text-gray-600">{filteredLogs.length} logs</span>
          </div>
        </div>
      </div>

      {filteredLogs.length > 0 ? (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {filteredLogs.map(log => (
              <li key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                    <div>
                        <p className={`text-sm font-semibold text-[${brandColors.secondary}]`}>{log.equipmentName} - <span className="font-normal">{log.description}</span></p>
                        <p className="text-xs text-gray-500">
                        Date: {new Date(log.date).toLocaleDateString()} | Performed by: {log.performedBy} | Duration: {log.durationHours}h
                        </p>
                    </div>
                    {log.taskId && <span className={`text-xs bg-[${brandColors.primary}] bg-opacity-30 text-[${brandColors.secondary}] px-2 py-0.5 rounded-full`}>Task ID: {log.taskId}</span>}
                </div>
                {log.partsUsed.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs font-medium text-gray-600">Parts Used:</p>
                    <ul className="list-disc list-inside ml-2">
                      {log.partsUsed.map((part, idx) => (
                        <li key={idx} className="text-xs text-gray-500">{part.partName} (Quantity: {part.quantity})</li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
            <PageIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No maintenance logs found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or add a new log entry.</p>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Log Entry" size="lg">
        <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div>
            <label htmlFor="log-equipmentId" className="block text-sm font-medium text-gray-700">Equipment</label>
            <select id="log-equipmentId" value={newLogEntry.equipmentId || ''} onChange={(e) => handleInputChange('equipmentId', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}>
              {equipmentList.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="log-date" className="block text-sm font-medium text-gray-700">Date</label>
            <input type="date" id="log-date" value={newLogEntry.date ? newLogEntry.date.split('T')[0] : ''} onChange={(e) => handleInputChange('date', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
          </div>
          <div>
            <label htmlFor="log-performedBy" className="block text-sm font-medium text-gray-700">Performed By</label>
            <select id="log-performedBy" value={newLogEntry.performedBy || ''} onChange={(e) => handleInputChange('performedBy', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}>
                {users.map(user => <option key={user.id} value={user.name}>{user.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="log-description" className="block text-sm font-medium text-gray-700">Description of Work</label>
            <textarea id="log-description" value={newLogEntry.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} rows={3} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
          </div>
           <div>
            <label htmlFor="log-duration" className="block text-sm font-medium text-gray-700">Duration (Hours)</label>
            <input type="number" id="log-duration" value={newLogEntry.durationHours || 1} onChange={(e) => handleInputChange('durationHours', parseFloat(e.target.value))} min="0.5" step="0.5" className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
          </div>
          <div>
            <label htmlFor="log-taskId" className="block text-sm font-medium text-gray-700">Related Task ID (Optional)</label>
            <input type="text" id="log-taskId" value={newLogEntry.taskId || ''} onChange={(e) => handleInputChange('taskId', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Parts Used</h4>
            {newLogEntry.partsUsed && newLogEntry.partsUsed.map((part, index) => (
              <div key={index} className="flex items-center space-x-2 border p-2 rounded-md">
                <select 
                    value={part.partId} 
                    onChange={(e) => handlePartUsedChange(index, 'partId', e.target.value)} 
                    className={`block w-full border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}
                >
                  {spareParts.map(sp => <option key={sp.id} value={sp.id}>{sp.name} (SKU: {sp.sku})</option>)}
                </select>
                <input 
                    type="number" 
                    value={part.quantity} 
                    onChange={(e) => handlePartUsedChange(index, 'quantity', parseInt(e.target.value, 10))} 
                    min="1"
                    className={`block w-20 border-gray-300 rounded-md shadow-sm p-2 text-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}
                />
                <button type="button" onClick={() => handleRemovePartUsed(index)} className="text-red-500 hover:text-red-700 text-sm p-1">Remove</button>
              </div>
            ))}
            <button type="button" onClick={handleAddPartUsed} className={`text-sm text-[${brandColors.secondary}] hover:text-[${brandColors.primary}] flex items-center`}>
              <PlusCircleIcon className="w-4 h-4 mr-1" /> Add Part
            </button>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
            <button type="button" onClick={handleSaveLog} className={`px-4 py-2 text-sm font-medium text-[${brandColors.secondary}] bg-[${brandColors.primary}] rounded-md hover:brightness-90`}>Save Log</button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LogsPage;
