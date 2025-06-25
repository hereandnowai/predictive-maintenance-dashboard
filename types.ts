
export enum EquipmentStatus {
  OK = 'OK',
  WARNING = 'Warning',
  CRITICAL = 'Critical',
  OFFLINE = 'Offline',
  MAINTENANCE = 'Maintenance'
}

export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  OVERDUE = 'Overdue'
}

export enum TaskPriority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum AlertSeverity {
  INFO = 'Info',
  WARNING = 'Warning',
  ERROR = 'Error'
}

export enum UserRole {
  TECHNICIAN = 'Technician',
  SUPERVISOR = 'Supervisor',
  MANAGER = 'Manager'
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  location: string;
  status: EquipmentStatus;
  lastServiceDate: string; // ISO Date string
  nextServiceDate?: string; // ISO Date string, potentially predicted
  purchaseDate: string; // ISO Date string
  notes?: string;
  assignedTechnicianId?: string;
}

export interface HealthMetric {
  timestamp: number; // Unix timestamp
  vibration: number; // e.g., mm/s
  temperature: number; // Celsius
  usageHours: number; // Cumulative hours
  energyConsumption: number; // kWh
}

export interface EquipmentHealthMetrics extends Equipment {
  metrics: HealthMetric[];
  predictedFailureRisk?: 'Low' | 'Medium' | 'High';
}

export interface MaintenanceTask {
  id: string;
  equipmentId: string;
  equipmentName: string;
  description: string;
  assignedTo: string; // Technician name or ID
  dueDate: string; // ISO Date string
  status: TaskStatus;
  priority: TaskPriority;
  notes?: string;
  createdAt: string; // ISO Date string
}

export interface Alert {
  id: string;
  equipmentId: string;
  equipmentName: string;
  message: string;
  timestamp: string; // ISO Date string
  severity: AlertSeverity;
  acknowledged: boolean;
}

export interface MaintenanceLogEntry {
  id:string;
  equipmentId: string;
  equipmentName: string;
  taskId?: string;
  date: string; // ISO Date string
  performedBy: string; // Technician name
  description: string;
  partsUsed: Array<{ partId: string; partName: string; quantity: number }>;
  durationHours: number;
}

export interface SparePart {
  id: string;
  name: string;
  sku: string;
  quantityInStock: number;
  reorderLevel: number;
  supplier: string;
  price: number; // per unit
  location?: string; // e.g. Shelf A-12
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
}

export interface ReportData {
  title: string;
  generatedDate: string;
  data: unknown; // Can be specific based on report type
}

// Chart data point structure
export interface ChartDataPoint {
  date: string; // Formatted date string for x-axis
  value: number;
}
