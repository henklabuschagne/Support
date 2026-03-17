import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { ApiResult } from './types';
import type { User } from '../../types';

// PATCH /api/users/:id
export async function updateUser(id: string, updates: Partial<User>): Promise<ApiResult<User>> {
  return mockApiCall(() => {
    const result = appStore.updateUser(id, updates);
    if (!result) throw new Error(`User ${id} not found`);
    return result;
  });
}

// POST /api/auth/switch-user
export async function switchUser(userId: string): Promise<ApiResult<User>> {
  return mockApiCall(() => {
    appStore.setCurrentUser(userId);
    const user = appStore.getCurrentUser();
    if (!user) throw new Error('User not found');
    return user;
  });
}
