import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';
import type { DepartmentRoutingRule } from '../../types';

// POST /api/routing-rules
export async function createRoutingRule(data: Omit<DepartmentRoutingRule, 'id'>): Promise<ApiResult<DepartmentRoutingRule>> {
  if (!data.name.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Rule name is required');
  }
  if (!data.departmentId) {
    return errorResponse('VALIDATION_ERROR', 'Target department is required');
  }
  return mockApiCall(() => appStore.createRoutingRule(data));
}

// PATCH /api/routing-rules/:id
export async function updateRoutingRule(id: string, updates: Partial<DepartmentRoutingRule>): Promise<ApiResult<DepartmentRoutingRule>> {
  return mockApiCall(() => {
    const result = appStore.updateRoutingRule(id, updates);
    if (!result) throw new Error(`Rule ${id} not found`);
    return result;
  });
}

// DELETE /api/routing-rules/:id
export async function deleteRoutingRule(id: string): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const result = appStore.deleteRoutingRule(id);
    if (!result) throw new Error(`Rule ${id} not found`);
    return result;
  });
}

// POST /api/routing-rules/evaluate
export async function evaluateRouting(subject: string, description: string, category?: string, tags?: string[], customerEmail?: string, ticketPriority?: string, categoryType?: string): Promise<ApiResult<{ departmentId: string; autoAssignTo?: string } | null>> {
  return mockApiCall(() => appStore.evaluateRoutingRules(subject, description, category, tags, customerEmail, ticketPriority as any, categoryType));
}