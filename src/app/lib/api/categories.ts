import { appStore } from '../appStore';
import { mockApiCall } from './config';
import type { Category } from '../../types';

export function createCategory(data: Omit<Category, 'id' | 'types'> & { types?: Category['types'] }) {
  return mockApiCall(() => appStore.createCategory(data as Omit<Category, 'id'>));
}

export function updateCategory(id: string, updates: Partial<Category>) {
  return mockApiCall(() => appStore.updateCategory(id, updates));
}

export function deleteCategory(id: string) {
  return mockApiCall(() => appStore.deleteCategory(id));
}