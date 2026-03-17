import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';
import type { Department } from '../../types';

// POST /api/departments
export async function createDepartment(data: Omit<Department, 'id'>): Promise<ApiResult<Department>> {
  if (!data.name.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Department name is required');
  }
  return mockApiCall(() => appStore.createDepartment(data));
}

// PATCH /api/departments/:id
export async function updateDepartment(id: string, updates: Partial<Department>): Promise<ApiResult<Department>> {
  return mockApiCall(() => {
    const result = appStore.updateDepartment(id, updates);
    if (!result) throw new Error(`Department ${id} not found`);
    return result;
  });
}

// DELETE /api/departments/:id
export async function deleteDepartment(id: string): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const result = appStore.deleteDepartment(id);
    if (!result) throw new Error(`Cannot delete department ${id}. It may have active tickets.`);
    return result;
  });
}
