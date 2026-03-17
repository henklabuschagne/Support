import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';
import type { Comment } from '../../types';

// POST /api/comments
export async function addComment(data: {
  ticketId: string;
  userId: string;
  content: string;
  isInternal: boolean;
}): Promise<ApiResult<Comment>> {
  if (!data.content.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Comment content is required');
  }
  return mockApiCall(() => appStore.addComment(data));
}
