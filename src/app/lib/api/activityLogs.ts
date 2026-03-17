import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';
import type { ActivityLog } from '../../types';

// POST /api/activity-logs (fire-and-forget side effect)
export async function addActivityLog(data: {
  ticketId: string;
  userId: string;
  action: string;
  changes?: Record<string, { from: any; to: any }>;
}): Promise<ApiResult<ActivityLog>> {
  return mockApiCall(() => appStore.addActivityLog(data));
}
