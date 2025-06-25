
import React, { useState, useMemo } from 'react';
import { MOCK_MAINTENANCE_TASKS, MOCK_EQUIPMENT, MOCK_USERS, BRAND_CONFIG, CURRENT_USER } from '../constants';
import { MaintenanceTask, TaskStatus, TaskPriority, Equipment, User, UserRole } from '../types';
import { Modal } from './Modal';
import { PlusCircleIcon, EditIcon, TrashIcon, FilterIcon, SearchIcon } from './icons';

const getStatusColorClass = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.PENDING: return 'bg-yellow-100 text-yellow-700';
    case TaskStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
    case TaskStatus.COMPLETED: return 'bg-green-100 text-green-700';
    case TaskStatus.OVERDUE: return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};

const getPriorityColorClass = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.HIGH: return 'border-red-500 text-red-600';
    case TaskPriority.MEDIUM: return 'border-yellow-500 text-yellow-600';
    case TaskPriority.LOW: return 'border-blue-500 text-blue-600';
    default: return 'border-gray-500 text-gray-600';
  }
};

export const SchedulePage: React.FC = () => {
  const [tasks, setTasks] = useState<MaintenanceTask[]>(MOCK_MAINTENANCE_TASKS);
  const [equipmentList] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [users] = useState<User[]>(MOCK_USERS.filter(u => u.role === UserRole.TECHNICIAN));

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<MaintenanceTask> | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'ALL'>('ALL');
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'ALL'>('ALL');
  
  const brandColors = BRAND_CONFIG.brand.colors;

  const openModalForNew = () => {
    setEditingTask({ 
        description: '', 
        equipmentId: equipmentList[0]?.id || '',
        equipmentName: equipmentList[0]?.name || '',
        assignedTo: users[0]?.name || '', 
        dueDate: new Date().toISOString().split('T')[0], 
        status: TaskStatus.PENDING, 
        priority: TaskPriority.MEDIUM,
        createdAt: new Date().toISOString()
    });
    setIsModalOpen(true);
  };

  const openModalForEdit = (task: MaintenanceTask) => {
    setEditingTask({...task, dueDate: new Date(task.dueDate).toISOString().split('T')[0]});
    setIsModalOpen(true);
  };

  const handleSaveTask = () => {
    if (!editingTask || !editingTask.description || !editingTask.equipmentId || !editingTask.dueDate) {
        alert("Please fill all required fields.");
        return;
    }
    
    const selectedEquipment = equipmentList.find(e => e.id === editingTask.equipmentId);

    const taskToSave: MaintenanceTask = {
        ...editingTask,
        id: editingTask.id || `task-${Date.now()}`,
        description: editingTask.description!,
        equipmentId: editingTask.equipmentId!,
        equipmentName: selectedEquipment?.name || 'Unknown Equipment',
        assignedTo: editingTask.assignedTo || users[0]?.name || 'Unassigned',
        dueDate: new Date(editingTask.dueDate!).toISOString(),
        status: editingTask.status || TaskStatus.PENDING,
        priority: editingTask.priority || TaskPriority.MEDIUM,
        createdAt: editingTask.createdAt || new Date().toISOString()
    };

    if (editingTask.id) {
      setTasks(tasks.map(t => t.id === taskToSave.id ? taskToSave : t));
    } else {
      setTasks([taskToSave, ...tasks]);
    }
    setIsModalOpen(false);
    setEditingTask(null);
  };

  const handleDeleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
        setTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const handleInputChange = <K extends keyof MaintenanceTask,>(key: K, value: MaintenanceTask[K]) => {
    if(editingTask) {
        setEditingTask({ ...editingTask, [key]: value });
        if(key === 'equipmentId'){
             const selectedEquipment = equipmentList.find(e => e.id === value);
             if(selectedEquipment){
                setEditingTask(prev => ({...prev!, equipmentName: selectedEquipment.name}));
             }
        }
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
        const matchesSearch = task.description.toLowerCase().includes(searchTerm.toLowerCase()) || task.equipmentName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || task.status === statusFilter;
        const matchesPriority = priorityFilter === 'ALL' || task.priority === priorityFilter;
        const matchesAssignee = assigneeFilter === 'ALL' || task.assignedTo === assigneeFilter;
        return matchesSearch && matchesStatus && matchesPriority && matchesAssignee;
    }).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [tasks, searchTerm, statusFilter, priorityFilter, assigneeFilter]);

  const technicians = useMemo(() => ['ALL', ...users.map(u => u.name)], [users]);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className={`text-3xl font-bold text-[${brandColors.secondary}]`}>Maintenance Schedule</h1>
        {(CURRENT_USER.role === UserRole.SUPERVISOR || CURRENT_USER.role === UserRole.MANAGER) &&
        <button onClick={openModalForNew} className={`flex items-center bg-[${brandColors.primary}] hover:brightness-90 text-[${brandColors.secondary}] font-medium py-2 px-4 rounded-lg shadow-md transition duration-150 ease-in-out`}>
          <PlusCircleIcon className="w-5 h-5 mr-2" /> Add Task
        </button>
        }
      </div>

       {/* Filters */}
      <div className="mb-6 p-4 bg-white rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label htmlFor="search-tasks" className="block text-sm font-medium text-gray-700">Search</label>
             <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                type="text"
                id="search-tasks"
                className={`focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}] block w-full pl-10 sm:text-sm border-gray-300 rounded-md p-2`}
                placeholder="Description or Equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700">Status</label>
            <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | 'ALL')} className={`mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}>
              <option value="ALL">All Statuses</option>
              {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="priority-filter" className="block text-sm font-medium text-gray-700">Priority</label>
            <select id="priority-filter" value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | 'ALL')} className={`mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}>
              <option value="ALL">All Priorities</option>
              {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="assignee-filter" className="block text-sm font-medium text-gray-700">Assignee</label>
            <select id="assignee-filter" value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} className={`mt-1 block w-full p-2 border-gray-300 rounded-md shadow-sm focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}>
              {technicians.map(tech => <option key={tech} value={tech}>{tech === 'ALL' ? 'All Technicians' : tech}</option>)}
            </select>
          </div>
          <div className="flex items-center">
             <FilterIcon className="h-5 w-5 text-gray-400 mr-2" />
             <span className="text-sm text-gray-600">{filteredTasks.length} tasks</span>
          </div>
        </div>
      </div>
      
      {filteredTasks.length > 0 ? (
        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Equipment</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        {(CURRENT_USER.role === UserRole.SUPERVISOR || CURRENT_USER.role === UserRole.MANAGER) &&
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        }
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTasks.map(task => (
                        <tr key={task.id} className={`border-l-4 ${getPriorityColorClass(task.priority)} hover:bg-gray-50 transition-colors`}>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-[${brandColors.secondary}]`}>{task.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.equipmentName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.assignedTo}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(task.dueDate).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`font-semibold ${getPriorityColorClass(task.priority).split(' ')[1]}`}>{task.priority}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(task.status)}`}>
                                    {task.status}
                                </span>
                            </td>
                            {(CURRENT_USER.role === UserRole.SUPERVISOR || CURRENT_USER.role === UserRole.MANAGER) &&
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button onClick={() => openModalForEdit(task)} className={`text-[${brandColors.secondary}] hover:text-[${brandColors.primary}] mr-3`}><EditIcon className="w-5 h-5 inline-block" /></button>
                                <button onClick={() => handleDeleteTask(task.id)} className="text-red-600 hover:text-red-800"><TrashIcon className="w-5 h-5 inline-block" /></button>
                            </td>
                            }
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      ) : (
        <div className="text-center py-10 bg-white rounded-lg shadow">
            <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or add a new maintenance task.</p>
        </div>
      )}

      {editingTask && (
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTask.id ? 'Edit Task' : 'Add New Task'}>
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
              <input type="text" id="description" value={editingTask.description || ''} onChange={(e) => handleInputChange('description', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
            </div>
            <div>
              <label htmlFor="equipmentId" className="block text-sm font-medium text-gray-700">Equipment</label>
              <select id="equipmentId" value={editingTask.equipmentId || ''} onChange={(e) => handleInputChange('equipmentId', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}>
                {equipmentList.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">Assigned To</label>
              <select id="assignedTo" value={editingTask.assignedTo || ''} onChange={(e) => handleInputChange('assignedTo', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}>
                 {users.map(user => <option key={user.id} value={user.name}>{user.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Due Date</label>
              <input type="date" id="dueDate" value={editingTask.dueDate ? (editingTask.dueDate.includes('T') ? editingTask.dueDate.split('T')[0] : editingTask.dueDate) : ''} onChange={(e) => handleInputChange('dueDate', e.target.value)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
            </div>
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
              <select id="priority" value={editingTask.priority || ''} onChange={(e) => handleInputChange('priority', e.target.value as TaskPriority)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}>
                {Object.values(TaskPriority).map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">Status</label>
              <select id="status" value={editingTask.status || ''} onChange={(e) => handleInputChange('status', e.target.value as TaskStatus)} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`}>
                {Object.values(TaskStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
             <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
              <textarea id="notes" value={editingTask.notes || ''} onChange={(e) => handleInputChange('notes', e.target.value)} rows={3} className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 focus:ring-[${brandColors.primary}] focus:border-[${brandColors.primary}]`} />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">Cancel</button>
              <button type="button" onClick={handleSaveTask} className={`px-4 py-2 text-sm font-medium text-[${brandColors.secondary}] bg-[${brandColors.primary}] rounded-md hover:brightness-90`}>Save Task</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default SchedulePage;
