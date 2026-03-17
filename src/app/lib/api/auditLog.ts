import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';
import type { AuditLogEntry } from '../../types';

// POST /api/audit-log
export async function addAuditEntry(data: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<ApiResult<AuditLogEntry>> {
  return mockApiCall(() => appStore.addAuditEntry(data));
}

// GET /api/audit-log
export async function getAuditLog(): Promise<ApiResult<AuditLogEntry[]>> {
  return mockApiCall(() => appStore.getAuditLog());
}
