import { useState, useEffect, useMemo } from 'react';
import { appStore, type Slice } from '../lib/appStore';
import { api } from '../lib/api';

export function useAppStore(...subscribeTo: Slice[]) {
  // Force re-render when subscribed slices change
  const [, bump] = useState(0);

  useEffect(() => {
    const unsubscribes = subscribeTo.map(slice =>
      appStore.subscribe(slice, () => bump(v => v + 1))
    );
    return () => unsubscribes.forEach(unsub => unsub());
    // subscribeTo is static per component call site
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Reactive State ──────────────────────────────────────
  const tickets = appStore.tickets;
  const comments = appStore.comments;
  const attachments = appStore.attachments;
  const knowledgeBase = appStore.knowledgeBase;
  const timeEntries = appStore.timeEntries;
  const activityLogs = appStore.activityLogs;
  const slas = appStore.slas;
  const workflowRules = appStore.workflowRules;
  const cannedResponses = appStore.cannedResponses;
  const savedFilters = appStore.savedFilters;
  const customers = appStore.customers;
  const departments = appStore.departments;
  const tags = appStore.tags;
  const users = appStore.users;
  const routingRules = appStore.routingRules;
  const currentUser = appStore.currentUser;
  const currentUserId = appStore.currentUserId;
  const auditLog = appStore.getAuditLog();
  const categories = appStore.categories;

  // ─── Sync Read Helpers ───────────────────────────────────
  const reads = useMemo(() => ({
    getTicketById: (id: string) => appStore.getTicketById(id),
    getCommentsByTicket: (ticketId: string) => appStore.getCommentsByTicket(ticketId),
    getAttachmentsByTicket: (ticketId: string) => appStore.getAttachmentsByTicket(ticketId),
    getActivityLogsByTicket: (ticketId: string) => appStore.getActivityLogsByTicket(ticketId),
    getTimeEntriesByTicket: (ticketId: string) => appStore.getTimeEntriesByTicket(ticketId),
    getTicketsByCustomer: (customerId: string) => appStore.getTicketsByCustomer(customerId),
    getCustomerById: (id: string) => appStore.getCustomerById(id),
    getUserById: (id: string) => appStore.getUserById(id),
    getDepartmentById: (id: string) => appStore.getDepartmentById(id),
    getUserName: (id: string) => appStore.getUserById(id)?.name || 'Unassigned',
    getDepartmentName: (id: string) => appStore.getDepartmentById(id)?.name || 'Unknown',
    getUsersByDepartment: (deptId: string) => appStore.getUsersByDepartment(deptId),
    getRoutingRulesByDepartment: (deptId: string) => appStore.getRoutingRulesByDepartment(deptId),
    evaluateRoutingRules: (subject: string, desc: string, category?: string, tags?: string[], customerEmail?: string, ticketPriority?: string, categoryType?: string) =>
      appStore.evaluateRoutingRules(subject, desc, category, tags, customerEmail, ticketPriority as any, categoryType),
    hasPermission: (action: Parameters<typeof appStore.hasPermission>[0]) =>
      appStore.hasPermission(action),
    getCurrentUser: () => appStore.getCurrentUser(),
    getVisibleTickets: () => appStore.getVisibleTickets(),
    getRoleDefaultPermission: (role: Parameters<typeof appStore.getRoleDefaultPermission>[0], action: Parameters<typeof appStore.getRoleDefaultPermission>[1]) =>
      appStore.getRoleDefaultPermission(role, action),
    userHasPermission: (userId: string, action: Parameters<typeof appStore.userHasPermission>[1]) =>
      appStore.userHasPermission(userId, action),
    getAuditLog: () => appStore.getAuditLog(),
    getCategoryByName: (name: string) => appStore.getCategoryByName(name),
  }), []);

  // ─── Async Actions (routed through API layer) ────────────
  const actions = useMemo(() => ({
    // Tickets
    createTicket: (data: Parameters<typeof api.tickets.createTicket>[0]) =>
      api.tickets.createTicket(data),
    updateTicket: (id: string, updates: Parameters<typeof api.tickets.updateTicket>[1]) =>
      api.tickets.updateTicket(id, updates),
    bulkUpdateTickets: (ids: string[], updates: Parameters<typeof api.tickets.bulkUpdateTickets>[1]) =>
      api.tickets.bulkUpdateTickets(ids, updates),
    closeTicket: (id: string, closedBy: string, resolutionNotes: string) =>
      api.tickets.closeTicket(id, closedBy, resolutionNotes),
    rateTicket: (ticketId: string, rating: number, comment?: string) =>
      api.tickets.rateTicket(ticketId, rating, comment),

    // Comments
    addComment: (data: Parameters<typeof api.comments.addComment>[0]) =>
      api.comments.addComment(data),

    // Knowledge Base
    createKBArticle: (data: Parameters<typeof api.knowledgeBase.createArticle>[0]) =>
      api.knowledgeBase.createArticle(data),

    // Time Entries
    addTimeEntry: (data: Parameters<typeof api.timeEntries.addTimeEntry>[0]) =>
      api.timeEntries.addTimeEntry(data),

    // Activity Logs (fire-and-forget)
    addActivityLog: (data: Parameters<typeof api.activityLogs.addActivityLog>[0]) =>
      api.activityLogs.addActivityLog(data),

    // Saved Filters
    createSavedFilter: (data: Parameters<typeof api.filters.createSavedFilter>[0]) =>
      api.filters.createSavedFilter(data),
    updateSavedFilter: (id: string, updates: Parameters<typeof api.filters.updateSavedFilter>[1]) =>
      api.filters.updateSavedFilter(id, updates),
    deleteSavedFilter: (id: string) =>
      api.filters.deleteSavedFilter(id),
    setDefaultFilter: (id: string, userId: string) =>
      api.filters.setDefaultFilter(id, userId),

    // Departments
    createDepartment: (data: Parameters<typeof api.departments.createDepartment>[0]) =>
      api.departments.createDepartment(data),
    updateDepartment: (id: string, updates: Parameters<typeof api.departments.updateDepartment>[1]) =>
      api.departments.updateDepartment(id, updates),
    deleteDepartment: (id: string) =>
      api.departments.deleteDepartment(id),

    // Routing Rules
    createRoutingRule: (data: Parameters<typeof api.routingRules.createRoutingRule>[0]) =>
      api.routingRules.createRoutingRule(data),
    updateRoutingRule: (id: string, updates: Parameters<typeof api.routingRules.updateRoutingRule>[1]) =>
      api.routingRules.updateRoutingRule(id, updates),
    deleteRoutingRule: (id: string) =>
      api.routingRules.deleteRoutingRule(id),
    evaluateRouting: (subject: string, description: string, category?: string, tags?: string[], customerEmail?: string, ticketPriority?: string, categoryType?: string) =>
      api.routingRules.evaluateRouting(subject, description, category, tags, customerEmail, ticketPriority, categoryType),

    // Users
    updateUser: (id: string, updates: Parameters<typeof api.users.updateUser>[1]) =>
      api.users.updateUser(id, updates),
    switchUser: (userId: string) =>
      api.users.switchUser(userId),

    // Audit Log
    addAuditEntry: (data: Parameters<typeof api.auditLog.addAuditEntry>[0]) =>
      api.auditLog.addAuditEntry(data),

    // Categories
    createCategory: (data: Parameters<typeof api.categories.createCategory>[0]) =>
      api.categories.createCategory(data),
    updateCategory: (id: string, updates: Parameters<typeof api.categories.updateCategory>[1]) =>
      api.categories.updateCategory(id, updates),
    deleteCategory: (id: string) =>
      api.categories.deleteCategory(id),
  }), []);

  return {
    // Reactive state
    tickets,
    comments,
    attachments,
    knowledgeBase,
    timeEntries,
    activityLogs,
    slas,
    workflowRules,
    cannedResponses,
    savedFilters,
    customers,
    departments,
    tags,
    users,
    routingRules,
    currentUser,
    currentUserId,
    auditLog,
    categories,
    // Sync reads
    reads,
    // Async writes
    actions,
  };
}