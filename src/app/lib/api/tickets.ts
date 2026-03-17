import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';
import type { Ticket, TicketStatus, TicketPriority } from '../../types';

// POST /api/tickets
export async function createTicket(data: {
  subject: string;
  description: string;
  priority: TicketPriority;
  departmentId: string;
  assignedTo?: string;
  category?: string;
  status: TicketStatus;
  createdBy: string;
  tags: string[];
  customerId?: string;
}): Promise<ApiResult<Ticket>> {
  if (!data.subject.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Subject is required');
  }
  if (!data.description.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Description is required');
  }
  return mockApiCall(() => appStore.createTicket(data));
}

// PUT /api/tickets/:id
export async function updateTicket(
  id: string,
  updates: Partial<Ticket>
): Promise<ApiResult<Ticket>> {
  return mockApiCall(() => {
    const result = appStore.updateTicket(id, updates);
    if (!result) throw new Error(`Ticket ${id} not found`);
    return result;
  });
}

// PUT /api/tickets/bulk
export async function bulkUpdateTickets(
  ids: string[],
  updates: Partial<Ticket>
): Promise<ApiResult<number>> {
  if (ids.length === 0) {
    return errorResponse('VALIDATION_ERROR', 'No tickets selected');
  }
  return mockApiCall(() => appStore.bulkUpdateTickets(ids, updates));
}

// POST /api/tickets/:id/close
export async function closeTicket(
  id: string,
  closedBy: string,
  resolutionNotes: string
): Promise<ApiResult<Ticket>> {
  if (!resolutionNotes.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Resolution notes are required');
  }
  return mockApiCall(() => {
    const result = appStore.closeTicket(id, closedBy, resolutionNotes);
    if (!result) throw new Error(`Ticket ${id} not found`);
    return result;
  });
}

// POST /api/tickets/:id/rate
export async function rateTicket(
  ticketId: string,
  rating: number,
  comment?: string
): Promise<ApiResult<Ticket>> {
  if (rating < 1 || rating > 5) {
    return errorResponse('VALIDATION_ERROR', 'Rating must be between 1 and 5');
  }
  return mockApiCall(() => {
    const result = appStore.rateTicket(ticketId, rating, comment);
    if (!result) throw new Error(`Ticket ${ticketId} not found`);
    return result;
  });
}
