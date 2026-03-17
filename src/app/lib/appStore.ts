// ─── Centralized Data Store ────────────────────────────────
// Single source of truth for all application state.
// Components NEVER import this file directly (type imports OK).
// Only the API layer and the useAppStore hook may import this.

import type {
  Ticket, Comment, Attachment, KnowledgeBaseArticle,
  TimeEntry, ActivityLog, SLA, WorkflowRule,
  CannedResponse, SavedFilter, Customer, Department, DepartmentRoutingRule,
  Tag, User, UserRole, AuditLogEntry, AuditAction, PermissionAction,
  TicketStatus, TicketPriority, Category, CategoryType,
} from '../types';

import {
  tickets as seedTickets,
  comments as seedComments,
  attachments as seedAttachments,
  knowledgeBase as seedKB,
  timeEntries as seedTimeEntries,
  activityLogs as seedActivityLogs,
  slas as seedSLAs,
  workflowRules as seedWorkflowRules,
  cannedResponses as seedCannedResponses,
  savedFilters as seedSavedFilters,
  customers as seedCustomers,
  departments as seedDepartments,
  departmentRoutingRules as seedRoutingRules,
  tags as seedTags,
  users as seedUsers,
  auditLogEntries as seedAuditLogs,
  categories as seedCategories,
} from '../data/mockData';

// ─── LocalStorage Persistence ──────────────────────────────

const LS_PREFIX = 'helpdesk_pro_';

const LS_KEYS = {
  tickets: `${LS_PREFIX}tickets`,
  comments: `${LS_PREFIX}comments`,
  attachments: `${LS_PREFIX}attachments`,
  knowledgeBase: `${LS_PREFIX}knowledgeBase`,
  timeEntries: `${LS_PREFIX}timeEntries`,
  activityLogs: `${LS_PREFIX}activityLogs`,
  slas: `${LS_PREFIX}slas`,
  workflowRules: `${LS_PREFIX}workflowRules`,
  cannedResponses: `${LS_PREFIX}cannedResponses`,
  savedFilters: `${LS_PREFIX}savedFilters`,
  customers: `${LS_PREFIX}customers`,
  departments: `${LS_PREFIX}departments`,
  routingRules: `${LS_PREFIX}routingRules`,
  tags: `${LS_PREFIX}tags`,
  users: `${LS_PREFIX}users`,
  currentUserId: `${LS_PREFIX}currentUserId`,
  auditLog: `${LS_PREFIX}auditLog`,
  idCounter: `${LS_PREFIX}idCounter`,
  categories: `${LS_PREFIX}categories`,
} as const;

function persistToLS(key: string, data: any): void {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch { /* skip */ }
}

function loadFromLS<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch { return fallback; }
}

function getSliceData(slice: Slice): { key: string; data: any } | null {
  switch (slice) {
    case 'tickets': return { key: LS_KEYS.tickets, data: tickets };
    case 'comments': return { key: LS_KEYS.comments, data: comments };
    case 'attachments': return { key: LS_KEYS.attachments, data: attachments };
    case 'knowledgeBase': return { key: LS_KEYS.knowledgeBase, data: knowledgeBase };
    case 'timeEntries': return { key: LS_KEYS.timeEntries, data: timeEntries };
    case 'activityLogs': return { key: LS_KEYS.activityLogs, data: activityLogs };
    case 'slas': return { key: LS_KEYS.slas, data: slas };
    case 'workflowRules': return { key: LS_KEYS.workflowRules, data: workflowRules };
    case 'cannedResponses': return { key: LS_KEYS.cannedResponses, data: cannedResponses };
    case 'savedFilters': return { key: LS_KEYS.savedFilters, data: savedFilters };
    case 'customers': return { key: LS_KEYS.customers, data: customers };
    case 'departments': return { key: LS_KEYS.departments, data: departments };
    case 'tags': return { key: LS_KEYS.tags, data: tags };
    case 'users': return { key: LS_KEYS.users, data: users };
    case 'routingRules': return { key: LS_KEYS.routingRules, data: routingRules };
    case 'currentUser': return { key: LS_KEYS.currentUserId, data: currentUserId };
    case 'auditLog': return { key: LS_KEYS.auditLog, data: auditLogEntries };
    case 'categories': return { key: LS_KEYS.categories, data: categoriesData };
    default: return null;
  }
}

// ─── Subscriber System ─────────────────────────────────────

export type Slice =
  | 'tickets' | 'comments' | 'attachments' | 'knowledgeBase'
  | 'timeEntries' | 'activityLogs' | 'slas' | 'workflowRules'
  | 'cannedResponses' | 'savedFilters' | 'customers'
  | 'departments' | 'tags' | 'users' | 'routingRules' | 'currentUser'
  | 'auditLog' | 'categories';

type Listener = () => void;

const subscribers: Record<Slice, Set<Listener>> = {
  tickets: new Set(), comments: new Set(), attachments: new Set(),
  knowledgeBase: new Set(), timeEntries: new Set(), activityLogs: new Set(),
  slas: new Set(), workflowRules: new Set(), cannedResponses: new Set(),
  savedFilters: new Set(), customers: new Set(), departments: new Set(),
  tags: new Set(), users: new Set(), routingRules: new Set(),
  currentUser: new Set(), auditLog: new Set(), categories: new Set(),
};

function notify(slice: Slice) {
  const sliceInfo = getSliceData(slice);
  if (sliceInfo) persistToLS(sliceInfo.key, sliceInfo.data);
  subscribers[slice].forEach(fn => fn());
}

// ─── State ─────────────────────────────────────────────────

let tickets: Ticket[] = loadFromLS(LS_KEYS.tickets, [...seedTickets]);
let comments: Comment[] = loadFromLS(LS_KEYS.comments, [...seedComments]);
let attachments: Attachment[] = loadFromLS(LS_KEYS.attachments, [...seedAttachments]);
let knowledgeBase: KnowledgeBaseArticle[] = loadFromLS(LS_KEYS.knowledgeBase, [...seedKB]);
let timeEntries: TimeEntry[] = loadFromLS(LS_KEYS.timeEntries, [...seedTimeEntries]);
let activityLogs: ActivityLog[] = loadFromLS(LS_KEYS.activityLogs, [...seedActivityLogs]);
let slas: SLA[] = loadFromLS(LS_KEYS.slas, [...seedSLAs]);
let workflowRules: WorkflowRule[] = loadFromLS(LS_KEYS.workflowRules, [...seedWorkflowRules]);
let cannedResponses: CannedResponse[] = loadFromLS(LS_KEYS.cannedResponses, [...seedCannedResponses]);
let savedFilters: SavedFilter[] = loadFromLS(LS_KEYS.savedFilters, [...seedSavedFilters]);
let customers: Customer[] = loadFromLS(LS_KEYS.customers, [...seedCustomers]);
let departments: Department[] = loadFromLS(LS_KEYS.departments, [...seedDepartments]);
let routingRules: DepartmentRoutingRule[] = loadFromLS(LS_KEYS.routingRules, [...seedRoutingRules]);
let tags: Tag[] = loadFromLS(LS_KEYS.tags, [...seedTags]);
let users: User[] = loadFromLS(LS_KEYS.users, [...seedUsers]);
let currentUserId: string = loadFromLS(LS_KEYS.currentUserId, '1');
let auditLogEntries: AuditLogEntry[] = loadFromLS(LS_KEYS.auditLog, [...seedAuditLogs]);
let categoriesData: Category[] = loadFromLS(LS_KEYS.categories, [...seedCategories]);

// ─── ID Generation ─────────────────────────────────────────

let idCounter = loadFromLS(LS_KEYS.idCounter, Date.now());
function generateId(prefix = '') {
  idCounter++;
  persistToLS(LS_KEYS.idCounter, idCounter);
  return prefix ? `${prefix}-${idCounter}` : String(idCounter);
}

// ─── Current User ──────────────────────────────────────────

function setCurrentUser(userId: string): void {
  const user = users.find(u => u.id === userId);
  if (user) { currentUserId = userId; notify('currentUser'); }
}

function getCurrentUser(): User | undefined {
  return users.find(u => u.id === currentUserId);
}

function hasPermission(action: PermissionAction): boolean {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.customPermissions) {
    if (user.customPermissions.revokes?.includes(action)) return false;
    if (user.customPermissions.grants?.includes(action)) return true;
  }
  const role = user.role;
  switch (action) {
    case 'view_all': case 'view_settings': return role === 'admin' || role === 'manager';
    case 'view_reports': return role !== 'viewer';
    case 'view_operations': return role === 'admin' || role === 'manager';
    case 'view_audit_log': return role === 'admin';
    case 'create': case 'edit': case 'create_tickets': case 'bulk_actions': return role !== 'viewer';
    case 'delete': case 'manage_departments': case 'manage_routing': case 'manage_users': return role === 'admin';
    default: return false;
  }
}

function getRoleDefaultPermission(role: UserRole, action: PermissionAction): boolean {
  switch (action) {
    case 'view_all': case 'view_settings': return role === 'admin' || role === 'manager';
    case 'view_reports': return role !== 'viewer';
    case 'view_operations': return role === 'admin' || role === 'manager';
    case 'view_audit_log': return role === 'admin';
    case 'create': case 'edit': case 'create_tickets': case 'bulk_actions': return role !== 'viewer';
    case 'delete': case 'manage_departments': case 'manage_routing': case 'manage_users': return role === 'admin';
    default: return false;
  }
}

function userHasPermission(userId: string, action: PermissionAction): boolean {
  const user = users.find(u => u.id === userId);
  if (!user) return false;
  if (user.customPermissions) {
    if (user.customPermissions.revokes?.includes(action)) return false;
    if (user.customPermissions.grants?.includes(action)) return true;
  }
  return getRoleDefaultPermission(user.role, action);
}

function getVisibleTickets(): Ticket[] {
  const user = getCurrentUser();
  if (!user) return tickets;
  if (user.role === 'admin' || user.role === 'manager') return tickets;
  const deptIds = new Set<string>();
  deptIds.add(user.department);
  if (user.departments) user.departments.forEach(d => deptIds.add(d));
  return tickets.filter(t => deptIds.has(t.departmentId));
}

// ─── Category CRUD ─────────────────────────────────────────

function createCategory(data: Omit<Category, 'id'>): Category {
  const newCat: Category = { ...data, types: data.types || [], id: generateId('CAT') };
  categoriesData = [...categoriesData, newCat];
  notify('categories');
  return newCat;
}

function updateCategory(id: string, updates: Partial<Category>): Category | null {
  const index = categoriesData.findIndex(c => c.id === id);
  if (index === -1) return null;
  categoriesData[index] = { ...categoriesData[index], ...updates };
  categoriesData = [...categoriesData];
  notify('categories');
  return categoriesData[index];
}

function deleteCategory(id: string): boolean {
  // Don't delete categories that are in use by tickets
  const cat = categoriesData.find(c => c.id === id);
  if (cat && tickets.some(t => t.category === cat.name)) return false;
  const before = categoriesData.length;
  categoriesData = categoriesData.filter(c => c.id !== id);
  if (categoriesData.length < before) { notify('categories'); return true; }
  return false;
}

function getCategoryByName(name: string): Category | undefined {
  return categoriesData.find(c => c.name.toLowerCase() === name.toLowerCase());
}

// ─── Department CRUD ───────────────────────────────────────

function createDepartment(data: Omit<Department, 'id'>): Department {
  const newDept: Department = { ...data, id: generateId('DEPT') };
  departments = [...departments, newDept];
  notify('departments');
  return newDept;
}

function updateDepartment(id: string, updates: Partial<Department>): Department | null {
  const index = departments.findIndex(d => d.id === id);
  if (index === -1) return null;
  departments[index] = { ...departments[index], ...updates };
  departments = [...departments];
  notify('departments');
  return departments[index];
}

function deleteDepartment(id: string): boolean {
  const hasTickets = tickets.some(t => t.departmentId === id);
  if (hasTickets) return false;
  const before = departments.length;
  departments = departments.filter(d => d.id !== id);
  if (departments.length < before) { notify('departments'); return true; }
  return false;
}

// ─── Routing Rules CRUD ───────────────────────────────────

function createRoutingRule(data: Omit<DepartmentRoutingRule, 'id'>): DepartmentRoutingRule {
  const newRule: DepartmentRoutingRule = { ...data, id: generateId('DR') };
  routingRules = [...routingRules, newRule];
  notify('routingRules');
  return newRule;
}

function updateRoutingRule(id: string, updates: Partial<DepartmentRoutingRule>): DepartmentRoutingRule | null {
  const index = routingRules.findIndex(r => r.id === id);
  if (index === -1) return null;
  routingRules[index] = { ...routingRules[index], ...updates };
  routingRules = [...routingRules];
  notify('routingRules');
  return routingRules[index];
}

function deleteRoutingRule(id: string): boolean {
  const before = routingRules.length;
  routingRules = routingRules.filter(r => r.id !== id);
  if (routingRules.length < before) { notify('routingRules'); return true; }
  return false;
}

function evaluateRoutingRules(subject: string, description: string, category?: string, ticketTags?: string[], customerEmail?: string, ticketPriority?: TicketPriority, categoryType?: string): { departmentId: string; autoAssignTo?: string } | null {
  const text = `${subject} ${description}`.toLowerCase();
  const activeRules = routingRules.filter(r => r.isActive).sort((a, b) => a.priority - b.priority);
  for (const rule of activeRules) {
    const dept = departments.find(d => d.id === rule.departmentId);
    if (!dept || !dept.isActive) continue;
    let matched = false;
    if (rule.conditions.keywords?.length && rule.conditions.keywords.some(kw => text.includes(kw.toLowerCase()))) matched = true;
    if (!matched && rule.conditions.categories?.length && category && rule.conditions.categories.some(c => c.toLowerCase() === category.toLowerCase())) matched = true;
    if (!matched && rule.conditions.categoryTypes?.length && categoryType && rule.conditions.categoryTypes.some(ct => ct.toLowerCase() === categoryType.toLowerCase())) matched = true;
    if (!matched && rule.conditions.tags?.length && ticketTags && rule.conditions.tags.some(t => ticketTags.includes(t))) matched = true;
    if (!matched && rule.conditions.emailDomains?.length && customerEmail) {
      const emailDomain = customerEmail.split('@')[1]?.toLowerCase();
      if (emailDomain && rule.conditions.emailDomains.some(d => d.toLowerCase() === emailDomain)) matched = true;
    }
    if (!matched && rule.conditions.priorityLevels?.length && ticketPriority && rule.conditions.priorityLevels.includes(ticketPriority)) matched = true;
    if (matched) return { departmentId: rule.departmentId, autoAssignTo: rule.autoAssignTo };
  }
  return null;
}

// ─── User CRUD ─────────────────────────────────────────────

function updateUser(id: string, updates: Partial<User>): User | null {
  const index = users.findIndex(u => u.id === id);
  if (index === -1) return null;
  users[index] = { ...users[index], ...updates };
  users = [...users];
  notify('users');
  return users[index];
}

// ─── Ticket CRUD ───────────────────────────────────────────

function createTicket(data: Omit<Ticket, 'id' | 'createdAt' | 'updatedAt'>): Ticket {
  const ticketNumber = `TCK-${1000 + tickets.length + 1}`;
  const now = new Date().toISOString();
  const newTicket: Ticket = { ...data, id: ticketNumber, createdAt: now, updatedAt: now };
  tickets = [newTicket, ...tickets];
  notify('tickets');
  _addActivityLog({ ticketId: ticketNumber, userId: data.createdBy, action: 'Ticket created' });
  _applyWorkflowRules(ticketNumber, 'ticket_created');
  return newTicket;
}

function updateTicket(id: string, updates: Partial<Ticket>): Ticket | null {
  const index = tickets.findIndex(t => t.id === id);
  if (index === -1) return null;
  tickets[index] = { ...tickets[index], ...updates, updatedAt: new Date().toISOString() };
  tickets = [...tickets];
  notify('tickets');
  return tickets[index];
}

function bulkUpdateTickets(ids: string[], updates: Partial<Ticket>): number {
  let count = 0;
  const now = new Date().toISOString();
  tickets = tickets.map(ticket => {
    if (ids.includes(ticket.id)) { count++; return { ...ticket, ...updates, updatedAt: now }; }
    return ticket;
  });
  if (count > 0) notify('tickets');
  return count;
}

function closeTicket(id: string, closedBy: string, resolutionNotes: string): Ticket | null {
  const result = updateTicket(id, { status: 'closed' as TicketStatus, closedAt: new Date().toISOString(), closedBy, resolutionNotes });
  if (result) _addActivityLog({ ticketId: id, userId: closedBy, action: 'Ticket closed', changes: { status: { from: 'open', to: 'closed' } } });
  return result;
}

function rateTicket(ticketId: string, rating: number, comment?: string): Ticket | null {
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) return null;
  const result = updateTicket(ticketId, { satisfactionRating: rating, satisfactionComment: comment });
  if (result) _addActivityLog({ ticketId, userId: ticket.createdBy, action: `Rated ticket ${rating}/5` });
  return result;
}

// ─── Comment CRUD ──────────────────────────────────────────

function addComment(data: Omit<Comment, 'id' | 'createdAt'>): Comment {
  const newComment: Comment = { ...data, id: generateId('comment'), createdAt: new Date().toISOString() };
  comments = [...comments, newComment];
  notify('comments');
  updateTicket(data.ticketId, {});
  _addActivityLog({ ticketId: data.ticketId, userId: data.userId, action: data.isInternal ? 'Added internal note' : 'Added comment' });
  return newComment;
}

// ─── Attachment CRUD ───────────────────────────────────────

function addAttachment(data: Omit<Attachment, 'id'>): Attachment {
  const newAttachment: Attachment = { ...data, id: generateId('attach') };
  attachments = [...attachments, newAttachment];
  notify('attachments');
  return newAttachment;
}

// ─── Knowledge Base CRUD ───────────────────────────────────

function createKBArticle(data: Omit<KnowledgeBaseArticle, 'id' | 'createdAt' | 'updatedAt' | 'views'>): KnowledgeBaseArticle {
  const now = new Date().toISOString();
  const newArticle: KnowledgeBaseArticle = { ...data, id: `KB-${String(knowledgeBase.length + 1).padStart(3, '0')}`, createdAt: now, updatedAt: now, views: 0 };
  knowledgeBase = [newArticle, ...knowledgeBase];
  notify('knowledgeBase');
  return newArticle;
}

// ─── Time Entry CRUD ───────────────────────────────────────

function addTimeEntry(data: Omit<TimeEntry, 'id' | 'createdAt'>): TimeEntry {
  const newEntry: TimeEntry = { ...data, id: `TIME-${String(timeEntries.length + 1).padStart(3, '0')}`, createdAt: new Date().toISOString() };
  timeEntries = [...timeEntries, newEntry];
  notify('timeEntries');
  _addActivityLog({ ticketId: data.ticketId, userId: data.userId, action: `Logged ${data.hours} hours` });
  return newEntry;
}

// ─── Activity Log ──────────────────────────────────────────

function _addActivityLog(data: Omit<ActivityLog, 'id' | 'createdAt'>): ActivityLog {
  const newLog: ActivityLog = { ...data, id: generateId('ACT'), createdAt: new Date().toISOString() };
  activityLogs = [...activityLogs, newLog];
  notify('activityLogs');
  return newLog;
}

function addActivityLog(data: Omit<ActivityLog, 'id' | 'createdAt'>): ActivityLog {
  return _addActivityLog(data);
}

// ─── Saved Filter CRUD ─────────────────────────────────────

function createSavedFilter(data: Omit<SavedFilter, 'id'>): SavedFilter {
  const newFilter: SavedFilter = { ...data, id: generateId('SF'), createdAt: data.createdAt || new Date().toISOString() };
  savedFilters = [...savedFilters, newFilter];
  notify('savedFilters');
  return newFilter;
}

function updateSavedFilter(id: string, updates: Partial<SavedFilter>): SavedFilter | null {
  const index = savedFilters.findIndex(f => f.id === id);
  if (index === -1) return null;
  savedFilters[index] = { ...savedFilters[index], ...updates };
  savedFilters = [...savedFilters];
  notify('savedFilters');
  return savedFilters[index];
}

function deleteSavedFilter(id: string): boolean {
  const before = savedFilters.length;
  savedFilters = savedFilters.filter(f => f.id !== id);
  if (savedFilters.length < before) { notify('savedFilters'); return true; }
  return false;
}

function setDefaultFilter(id: string, userId: string): void {
  savedFilters = savedFilters.map(f => ({ ...f, isDefault: f.userId === userId ? f.id === id : f.isDefault }));
  notify('savedFilters');
}

// ─── Workflow Rules Engine ─────────────────────────────────

function _applyWorkflowRules(ticketId: string, trigger: string): void {
  const ticket = tickets.find(t => t.id === ticketId);
  if (!ticket) return;
  const applicableRules = workflowRules.filter(rule =>
    rule.isActive && rule.trigger === trigger &&
    (!rule.conditions.departmentId || rule.conditions.departmentId === ticket.departmentId) &&
    (!rule.conditions.priority || rule.conditions.priority === ticket.priority) &&
    (!rule.conditions.status || rule.conditions.status === ticket.status)
  );
  applicableRules.forEach(rule => {
    const updates: Partial<Ticket> = {};
    if (rule.actions.assignTo) {
      updates.assignedTo = rule.actions.assignTo;
      _addActivityLog({ ticketId, userId: '1', action: `Auto-assigned by workflow: ${rule.name}` });
    }
    if (rule.actions.changeStatus) updates.status = rule.actions.changeStatus;
    if (rule.actions.changePriority) updates.priority = rule.actions.changePriority;
    if (rule.actions.addTags?.length) updates.tags = [...new Set([...ticket.tags, ...rule.actions.addTags])];
    if (Object.keys(updates).length > 0) updateTicket(ticketId, updates);
  });
}

// ─── Computed Getters ──────────────────────────────────────

function getTicketById(id: string) { return tickets.find(t => t.id === id); }
function getCommentsByTicket(ticketId: string) { return comments.filter(c => c.ticketId === ticketId); }
function getAttachmentsByTicket(ticketId: string) { return attachments.filter(a => a.ticketId === ticketId); }
function getActivityLogsByTicket(ticketId: string) { return activityLogs.filter(a => a.ticketId === ticketId); }
function getTimeEntriesByTicket(ticketId: string) { return timeEntries.filter(e => e.ticketId === ticketId); }
function getTicketsByCustomer(customerId: string) { return tickets.filter(t => t.customerId === customerId); }
function getCustomerById(id: string) { return customers.find(c => c.id === id); }
function getUserById(id: string) { return users.find(u => u.id === id); }
function getDepartmentById(id: string) { return departments.find(d => d.id === id); }
function getUsersByDepartment(departmentId: string) { return users.filter(u => u.department === departmentId || u.departments?.includes(departmentId)); }
function getRoutingRulesByDepartment(departmentId: string) { return routingRules.filter(r => r.departmentId === departmentId); }

// ─── Audit Log ─────────────────────────────────────────────

function addAuditEntry(data: Omit<AuditLogEntry, 'id' | 'timestamp'>): AuditLogEntry {
  const entry: AuditLogEntry = { ...data, id: generateId('AUD'), timestamp: new Date().toISOString() };
  auditLogEntries = [entry, ...auditLogEntries];
  notify('auditLog');
  return entry;
}

function getAuditLog(): AuditLogEntry[] { return auditLogEntries; }

// ─── Reset / Stats ─────────────────────────────────────────

function resetAllData(): void {
  Object.values(LS_KEYS).forEach(key => { try { localStorage.removeItem(key); } catch { /* */ } });
  window.location.reload();
}

function getPersistenceStats(): { keyCount: number; totalBytes: number; keys: string[] } {
  const keys = Object.values(LS_KEYS);
  let totalBytes = 0;
  const activeKeys: string[] = [];
  keys.forEach(key => {
    try {
      const val = localStorage.getItem(key);
      if (val !== null) { totalBytes += key.length + val.length; activeKeys.push(key); }
    } catch { /* */ }
  });
  return { keyCount: activeKeys.length, totalBytes, keys: activeKeys };
}

// ─── Public API ────────────────────────────────────────────

export const appStore = {
  // Reactive state
  get tickets() { return tickets; },
  get comments() { return comments; },
  get attachments() { return attachments; },
  get knowledgeBase() { return knowledgeBase; },
  get timeEntries() { return timeEntries; },
  get activityLogs() { return activityLogs; },
  get slas() { return slas; },
  get workflowRules() { return workflowRules; },
  get cannedResponses() { return cannedResponses; },
  get savedFilters() { return savedFilters; },
  get customers() { return customers; },
  get departments() { return departments; },
  get tags() { return tags; },
  get users() { return users; },
  get routingRules() { return routingRules; },
  get currentUserId() { return currentUserId; },
  get currentUser() { return getCurrentUser(); },
  get categories() { return categoriesData; },

  // Computed
  get openTicketCount() { return tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length; },
  get urgentTicketCount() { return tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed').length; },
  getTicketById, getCommentsByTicket, getAttachmentsByTicket, getActivityLogsByTicket,
  getTimeEntriesByTicket, getTicketsByCustomer, getCustomerById, getUserById,
  getDepartmentById, getUsersByDepartment, getRoutingRulesByDepartment,
  evaluateRoutingRules, hasPermission, getCurrentUser, getVisibleTickets,
  getRoleDefaultPermission, userHasPermission, getCategoryByName,

  // Mutations
  createTicket, updateTicket, bulkUpdateTickets, closeTicket, rateTicket,
  addComment, addAttachment, createKBArticle, addTimeEntry, addActivityLog,
  createSavedFilter, updateSavedFilter, deleteSavedFilter, setDefaultFilter,
  setCurrentUser, createDepartment, updateDepartment, deleteDepartment,
  createRoutingRule, updateRoutingRule, deleteRoutingRule, updateUser,
  createCategory, updateCategory, deleteCategory,
  addAuditEntry, getAuditLog, resetAllData, getPersistenceStats,

  // Pub/sub
  subscribe(slice: Slice, listener: Listener): () => void {
    subscribers[slice].add(listener);
    return () => subscribers[slice].delete(listener);
  },
};