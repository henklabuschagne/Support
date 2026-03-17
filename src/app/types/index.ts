export type TicketStatus = 'open' | 'in-progress' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type SLAStatus = 'met' | 'at-risk' | 'breached';
export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer';

export type PermissionAction =
  | 'view_all'
  | 'view_settings'
  | 'view_reports'
  | 'view_operations'
  | 'create'
  | 'edit'
  | 'create_tickets'
  | 'bulk_actions'
  | 'delete'
  | 'manage_departments'
  | 'manage_routing'
  | 'manage_users'
  | 'view_audit_log';

export interface CustomPermissions {
  grants?: PermissionAction[];   // explicitly allowed beyond role defaults
  revokes?: PermissionAction[];  // explicitly denied despite role defaults
}

export interface Department {
  id: string;
  name: string;
  color: string;
  description?: string;
  managerId?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  description?: string;
  isActive: boolean;
  types: CategoryType[];
}

export interface CategoryType {
  id: string;
  name: string;
  color?: string; // optional override; inherits category color if absent
}

export interface DepartmentRoutingRule {
  id: string;
  name: string;
  departmentId: string;
  isActive: boolean;
  priority: number; // lower = higher priority (evaluated first)
  conditions: {
    keywords?: string[];        // match in subject/description
    categories?: string[];      // match ticket category
    categoryTypes?: string[];   // match ticket category type
    tags?: string[];            // match ticket tags
    emailDomains?: string[];    // match customer email domain
    priorityLevels?: TicketPriority[]; // match ticket priority
  };
  autoAssignTo?: string; // optional auto-assign agent
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  department: string;
  role: UserRole;
  status?: 'online' | 'offline' | 'busy';
  departments?: string[]; // additional department access
  customPermissions?: CustomPermissions;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  createdAt: string;
  lastContactDate?: string;
  totalTickets: number;
  satisfactionScore?: number;
}

export interface Comment {
  id: string;
  ticketId: string;
  userId: string;
  content: string;
  createdAt: string;
  isInternal: boolean;
}

export interface Attachment {
  id: string;
  ticketId: string;
  name: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

export interface TimeEntry {
  id: string;
  ticketId: string;
  userId: string;
  hours: number;
  description: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  ticketId: string;
  userId: string;
  action: string;
  changes?: Record<string, { from: any; to: any }>;
  createdAt: string;
}

export interface SLA {
  id: string;
  name: string;
  departmentId?: string;
  priority?: TicketPriority;
  firstResponseTime: number; // in hours
  resolutionTime: number; // in hours
  isActive: boolean;
}

export interface WorkflowRule {
  id: string;
  name: string;
  isActive: boolean;
  trigger: 'ticket_created' | 'status_changed' | 'priority_changed' | 'overdue';
  conditions: {
    departmentId?: string;
    priority?: TicketPriority;
    status?: TicketStatus;
    tags?: string[];
  };
  actions: {
    assignTo?: string;
    changeStatus?: TicketStatus;
    changePriority?: TicketPriority;
    addTags?: string[];
    sendNotification?: boolean;
  };
}

export interface CannedResponse {
  id: string;
  name: string;
  subject?: string;
  content: string;
  departmentId?: string;
  tags?: string[];
  createdBy: string;
  createdAt: string;
}

export interface SavedFilter {
  id: string;
  name: string;
  userId: string;
  filters: {
    status?: TicketStatus[];
    priority?: TicketPriority[];
    departmentId?: string[];
    assignedTo?: string[];
    tags?: string[];
    categories?: string[];
    categoryTypes?: string[];
    searchQuery?: string;
  };
  isDefault?: boolean;
  isShared?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  createdAt?: string;
}

export interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  departmentId: string;
  assignedTo?: string;
  createdBy: string;
  customerId?: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  closedAt?: string;
  closedBy?: string;
  resolutionNotes?: string;
  category?: string;
  categoryType?: string;
  dueDate?: string;
  firstResponseAt?: string;
  slaStatus?: SLAStatus;
  satisfactionRating?: number;
  satisfactionComment?: string;
  customFields?: Record<string, any>;
}

export interface KnowledgeBaseArticle {
  id: string;
  title: string;
  content: string;
  ticketId?: string;
  departmentId: string;
  tags: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  views: number;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;        // who performed the action
  targetUserId?: string;  // user being modified (if applicable)
  action: AuditAction;
  details: Record<string, any>;
}

export type AuditAction =
  | 'role_changed'
  | 'permissions_changed'
  | 'department_changed'
  | 'user_switched'
  | 'user_created'
  | 'user_deactivated'
  | 'department_created'
  | 'department_updated'
  | 'department_deleted'
  | 'routing_rule_created'
  | 'routing_rule_updated'
  | 'routing_rule_deleted';

export interface TicketMetrics {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  averageResolutionTime: number;
  ticketsByDepartment: { department: string; count: number }[];
  ticketsByStatus: { status: string; count: number }[];
  ticketsByPriority: { priority: string; count: number }[];
  ticketTrends: { date: string; count: number }[];
}