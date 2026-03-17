import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';
import type { KnowledgeBaseArticle } from '../../types';

// POST /api/knowledge-base
export async function createArticle(data: {
  title: string;
  content: string;
  ticketId?: string;
  departmentId: string;
  tags: string[];
  createdBy: string;
}): Promise<ApiResult<KnowledgeBaseArticle>> {
  if (!data.title.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Title is required');
  }
  if (!data.content.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Content is required');
  }
  return mockApiCall(() => appStore.createKBArticle(data));
}
