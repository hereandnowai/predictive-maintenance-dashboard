import { Equipment, EquipmentHealthMetrics, MaintenanceTask, Alert, MaintenanceLogEntry, SparePart, User, EquipmentStatus, TaskStatus, TaskPriority, AlertSeverity, UserRole, HealthMetric } from './types';

export const APP_NAME = "HERE AND NOW AI";

export const MOCK_USERS: User[] = [
  { id: 'user-1', name: 'Alice Smith', role: UserRole.MANAGER, email: 'alice@example.com' },
  { id: 'user-2', name: 'Bob Johnson', role: UserRole.SUPERVISOR, email: 'bob@example.com' },
  { id: 'user-3', name: 'Charlie Brown', role: UserRole.TECHNICIAN, email: 'charlie@example.com' },
  { id: 'user-4', name: 'Diana Prince', role: UserRole.TECHNICIAN, email: 'diana@example.com' },
];

export const MOCK_EQUIPMENT: Equipment[] = [
  { id: 'eq-1', name: 'Office Printer X1000', type: 'Printer', location: 'Floor 1, Copy Room', status: EquipmentStatus.OK, lastServiceDate: '2024-05-15T00:00:00.000Z', purchaseDate: '2023-01-10T00:00:00.000Z', assignedTechnicianId: 'user-3' },
  { id: 'eq-2', name: 'Conference Room AC Unit', type: 'HVAC', location: 'Floor 2, Meeting Room A', status: EquipmentStatus.WARNING, lastServiceDate: '2024-04-20T00:00:00.000Z', purchaseDate: '2022-07-01T00:00:00.000Z', assignedTechnicianId: 'user-4' },
  { id: 'eq-3', name: 'CEO Office Projector', type: 'Projector', location: 'Floor 3, CEO Office', status: EquipmentStatus.CRITICAL, lastServiceDate: '2024-03-10T00:00:00.000Z', purchaseDate: '2023-05-20T00:00:00.000Z', notes: 'Flickering image reported' },
  { id: 'eq-4', name: 'Kitchen Refrigerator', type: 'Appliance', location: 'Floor 1, Break Room', status: EquipmentStatus.OK, lastServiceDate: '2024-06-01T00:00:00.000Z', purchaseDate: '2023-02-15T00:00:00.000Z' },
  { id: 'eq-5', name: 'Server Rack Fan Array', type: 'IT Hardware', location: 'Data Center, Rack 3', status: EquipmentStatus.MAINTENANCE, lastServiceDate: '2024-07-10T00:00:00.000Z', purchaseDate: '2022-11-05T00:00:00.000Z', assignedTechnicianId: 'user-3'},
];

const generateMockMetrics = (baseUsage: number, days: number): HealthMetric[] => {
  const metrics: HealthMetric[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const timestamp = new Date(now.getTime() - (days - 1 - i) * 24 * 60 * 60 * 1000).getTime();
    metrics.push({
      timestamp,
      vibration: parseFloat((Math.random() * 0.5 + 0.1).toFixed(2)), // 0.1 - 0.6 mm/s
      temperature: parseFloat((Math.random() * 10 + 20).toFixed(1)), // 20 - 30 C
      usageHours: baseUsage + i * 8 + parseFloat(Math.random().toFixed(2)), // Approx 8 hours usage per day
      energyConsumption: parseFloat((Math.random() * 2 + 1).toFixed(2)), // 1 - 3 kWh per "day" segment
    });
  }
  return metrics;
};

export const MOCK_EQUIPMENT_HEALTH: EquipmentHealthMetrics[] = MOCK_EQUIPMENT.map((eq, index) => {
  const metrics = generateMockMetrics(index * 1000, 30); // 30 days of metrics
  let predictedFailureRisk: 'Low' | 'Medium' | 'High' = 'Low';
  let nextServiceDate = new Date(eq.lastServiceDate);
  nextServiceDate.setMonth(nextServiceDate.getMonth() + 6); // Default 6 months

  const latestMetric = metrics[metrics.length -1];
  if(latestMetric) {
    if(latestMetric.vibration > 0.4 || latestMetric.temperature > 28) {
      predictedFailureRisk = 'Medium';
      nextServiceDate.setMonth(nextServiceDate.getMonth() - 1); // Advance service by 1 month
    }
    if(latestMetric.vibration > 0.5 || latestMetric.temperature > 29.5) {
      predictedFailureRisk = 'High';
      nextServiceDate.setMonth(new Date(eq.lastServiceDate).getMonth() + 1); // Service urgently
    }
  }
  if (eq.status === EquipmentStatus.CRITICAL) predictedFailureRisk = 'High';
  if (eq.status === EquipmentStatus.WARNING) predictedFailureRisk = 'Medium';
  
  return {
    ...eq,
    metrics,
    predictedFailureRisk,
    nextServiceDate: eq.status !== EquipmentStatus.MAINTENANCE ? nextServiceDate.toISOString() : undefined,
  };
});


export const MOCK_MAINTENANCE_TASKS: MaintenanceTask[] = [
  { id: 'task-1', equipmentId: 'eq-2', equipmentName: 'Conference Room AC Unit', description: 'Annual AC service and filter change', assignedTo: 'user-4', dueDate: '2024-07-25T00:00:00.000Z', status: TaskStatus.PENDING, priority: TaskPriority.MEDIUM, createdAt: '2024-07-01T00:00:00.000Z' },
  { id: 'task-2', equipmentId: 'eq-3', equipmentName: 'CEO Office Projector', description: 'Investigate flickering image issue', assignedTo: 'user-3', dueDate: '2024-07-22T00:00:00.000Z', status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, createdAt: '2024-07-10T00:00:00.000Z' },
  { id: 'task-3', equipmentId: 'eq-1', equipmentName: 'Office Printer X1000', description: 'Replace toner cartridge (Black)', assignedTo: 'user-3', dueDate: '2024-07-30T00:00:00.000Z', status: TaskStatus.PENDING, priority: TaskPriority.LOW, createdAt: '2024-07-15T00:00:00.000Z' },
  { id: 'task-4', equipmentId: 'eq-5', equipmentName: 'Server Rack Fan Array', description: 'Complete fan replacement', assignedTo: 'user-3', dueDate: '2024-07-15T00:00:00.000Z', status: TaskStatus.COMPLETED, priority: TaskPriority.HIGH, createdAt: '2024-07-10T00:00:00.000Z' }
];

export const MOCK_ALERTS: Alert[] = [
  { id: 'alert-1', equipmentId: 'eq-2', equipmentName: 'Conference Room AC Unit', message: 'High temperature detected: 32°C', timestamp: '2024-07-20T10:30:00.000Z', severity: AlertSeverity.WARNING, acknowledged: false },
  { id: 'alert-2', equipmentId: 'eq-3', equipmentName: 'CEO Office Projector', message: 'Equipment offline unexpectedly', timestamp: '2024-07-19T15:00:00.000Z', severity: AlertSeverity.ERROR, acknowledged: true },
  { id: 'alert-3', equipmentId: 'eq-1', equipmentName: 'Office Printer X1000', message: 'Low toner warning', timestamp: '2024-07-21T09:00:00.000Z', severity: AlertSeverity.INFO, acknowledged: false },
];

export const MOCK_SPARE_PARTS: SparePart[] = [
  { id: 'part-1', name: 'Printer Toner Cartridge - Black X1000', sku: 'TN-X1000-BLK', quantityInStock: 15, reorderLevel: 5, supplier: 'PrintSupply Co.', price: 75.99, location: 'Shelf B-3' },
  { id: 'part-2', name: 'AC Filter Medium Size', sku: 'ACF-M-2024', quantityInStock: 30, reorderLevel: 10, supplier: 'HVAC Parts Inc.', price: 12.50, location: 'Shelf C-1' },
  { id: 'part-3', name: 'Projector Lamp PL-500', sku: 'LP-PL500', quantityInStock: 5, reorderLevel: 2, supplier: 'AVWorld', price: 120.00, location: 'Shelf A-5' },
  { id: 'part-4', name: 'Server Fan 120mm', sku: 'SF-120MM-HQ', quantityInStock: 22, reorderLevel: 10, supplier: 'ITCooling Solutions', price: 25.00, location: 'Shelf D-7' },
];

export const MOCK_MAINTENANCE_LOGS: MaintenanceLogEntry[] = [
  { id: 'log-1', equipmentId: 'eq-1', equipmentName: 'Office Printer X1000', date: '2024-05-15T00:00:00.000Z', performedBy: 'Charlie Brown', description: 'Routine maintenance, cleaned rollers, checked connections.', partsUsed: [], durationHours: 1 },
  { id: 'log-2', equipmentId: 'eq-2', equipmentName: 'Conference Room AC Unit', date: '2024-04-20T00:00:00.000Z', performedBy: 'Diana Prince', description: 'Cleaned coils and replaced air filter.', partsUsed: [{ partId: 'part-2', partName: 'AC Filter Medium Size', quantity: 1 }], durationHours: 2.5 },
  { id: 'log-3', equipmentId: 'eq-5', equipmentName: 'Server Rack Fan Array', taskId: 'task-4', date: '2024-07-15T00:00:00.000Z', performedBy: 'Charlie Brown', description: 'Replaced all fans in array as per task-4. Tested airflow.', partsUsed: [{partId: 'part-4', partName:'Server Fan 120mm', quantity: 8}], durationHours: 4 },
];

export const CURRENT_USER: User = MOCK_USERS[0]; // Default to Manager for demo


export const BRAND_CONFIG = {
  brand: {
    shortName: "HERE AND NOW AI",
    longName: "HERE AND NOW AI - Artificial Intelligence Research Institute",
    website: "https://hereandnowai.com",
    email: "info@hereandnowai.com",
    mobile: "+91 996 296 1000",
    slogan: "designed with passion for innovation",
    colors: {
      primary: "#FFDF00", // Golden Yellow
      secondary: "#004040" // Teal
    },
    logo: {
      title: "https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/HNAI%20Title%20-Teal%20%26%20Golden%20Logo%20-%20DESIGN%203%20-%20Raj-07.png",
      favicon: "https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/favicon-logo-with-name.png"
    },
    chatbot: {
      avatar: "https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/caramel.jpeg",
      face: "https://raw.githubusercontent.com/hereandnowai/images/refs/heads/main/logos/caramel-face.jpeg"
    },
    socialMedia: {
      blog: "https://hereandnowai.com/blog",
      linkedin: "https://www.linkedin.com/company/hereandnowai/",
      instagram: "https://instagram.com/hereandnow_ai",
      github: "https://github.com/hereandnowai",
      x: "https://x.com/hereandnow_ai",
      youtube: "https://youtube.com/@hereandnow_ai"
    }
  }
};
