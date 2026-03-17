import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';
import type { TimeEntry } from '../../types';

// POST /api/time-entries
export async function addTimeEntry(data: {
  ticketId: string;
  userId: string;
  hours: number;
  description: string;
}): Promise<ApiResult<TimeEntry>> {
  if (data.hours <= 0) {
    return errorResponse('VALIDATION_ERROR', 'Hours must be greater than 0');
  }
  return mockApiCall(() => appStore.addTimeEntry(data));
}
