import * as tickets from './tickets';
import * as comments from './comments';
import * as knowledgeBase from './knowledgeBase';
import * as timeEntries from './timeEntries';
import * as activityLogs from './activityLogs';
import * as filters from './filters';
import * as departments from './departments';
import * as routingRules from './routingRules';
import * as usersApi from './users';
import * as auditLog from './auditLog';
import * as categories from './categories';

export const api = {
  tickets,
  comments,
  knowledgeBase,
  timeEntries,
  activityLogs,
  filters,
  departments,
  routingRules,
  users: usersApi,
  auditLog,
  categories,
};

export type { ApiResult, ApiError, PaginatedResult } from './types';