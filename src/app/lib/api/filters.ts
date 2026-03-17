import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';
import type { SavedFilter } from '../../types';

// POST /api/saved-filters
export async function createSavedFilter(data: {
  name: string;
  userId: string;
  filters: SavedFilter['filters'];
  isDefault?: boolean;
  isShared?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<ApiResult<SavedFilter>> {
  if (!data.name.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Filter name is required');
  }
  return mockApiCall(() => appStore.createSavedFilter(data));
}

// PATCH /api/saved-filters/:id
export async function updateSavedFilter(id: string, updates: Partial<SavedFilter>): Promise<ApiResult<SavedFilter>> {
  return mockApiCall(() => {
    const result = appStore.updateSavedFilter(id, updates);
    if (!result) throw new Error(`Filter ${id} not found`);
    return result;
  });
}

// DELETE /api/saved-filters/:id
export async function deleteSavedFilter(id: string): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const result = appStore.deleteSavedFilter(id);
    if (!result) throw new Error(`Filter ${id} not found`);
    return result;
  });
}

// POST /api/saved-filters/:id/set-default
export async function setDefaultFilter(id: string, userId: string): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    appStore.setDefaultFilter(id, userId);
    return true;
  });
}
