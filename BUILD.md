# Frontend-First Mock API Architecture Spec

**Purpose:** A reusable architectural blueprint for building fully functional frontend applications with a mock API layer and centralized data store — designed so a real backend can be swapped in with a single config change.

**Use this document as a prompt preamble when asking AI to build or migrate any application.**

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Layer Definitions](#2-layer-definitions)
3. [Building a New App (Greenfield)](#3-building-a-new-app-greenfield)
4. [Migrating an Existing App](#4-migrating-an-existing-app)
5. [Centralized Data Store Spec](#5-centralized-data-store-spec)
6. [Mock API Layer Spec](#6-mock-api-layer-spec)
7. [Hook Layer Spec](#7-hook-layer-spec)
8. [Component Integration Rules](#8-component-integration-rules)
9. [Loading, Error, and Optimistic UI Patterns](#9-loading-error-and-optimistic-ui-patterns)
10. [Backend Swap Strategy](#10-backend-swap-strategy)
11. [Verification Checklist](#11-verification-checklist)
12. [Quick-Start Prompt Template](#12-quick-start-prompt-template)

---

## 1. Architecture Overview

```
+--------------------------------------------------+
|                  React Components                 |
|  (read reactive state, call async actions only)   |
+--------------------------------------------------+
          |  reads (sync)       |  writes (async)
          v                     v
+-------------------+  +------------------------+
|   useAppStore()   |  |   Mock API Layer       |
|   hook            |  |   /lib/api/*.ts        |
|   (reactive       |  |   (async functions     |
|    subscriptions) |  |    with simulated      |
|                   |  |    latency + errors)   |
+-------------------+  +------------------------+
          |                     |
          v                     v
+--------------------------------------------------+
|            Centralized Data Store                 |
|            /lib/appStore.ts                       |
|  (in-memory state + pub/sub + business logic)    |
+--------------------------------------------------+
```

**The Golden Rule:** Components NEVER import or call the data store directly. All reads go through a reactive hook. All writes go through the async API layer.

**Why this works:**
- The frontend is fully functional and testable without any backend
- The mock API layer's function signatures mirror real REST/GraphQL endpoints
- When the real backend is ready, you swap mock implementations for `fetch()` calls — components don't change at all
- Simulated latency and error injection let you build proper loading/error states before the backend exists

---

## 2. Layer Definitions

### Layer 1: Centralized Data Store (`/lib/appStore.ts`)

- **What it is:** A plain TypeScript module that holds all application state in memory
- **What it does:** CRUD operations, business logic, computed properties, cross-domain side effects
- **Who can import it:** ONLY the API layer (`/lib/api/*.ts`) and the reactive hook (`/hooks/useAppStore.ts`)
- **Components NEVER import this file** (except for `type` imports)

### Layer 2: Mock API Layer (`/lib/api/*.ts`)

- **What it is:** Async functions organized by domain (e.g., `projects.ts`, `users.ts`, `orders.ts`)
- **What it does:** Wraps data store mutations in `async` functions with simulated latency, error injection, validation, and typed response envelopes
- **Function signatures match future backend endpoints** (e.g., `createProject(data)` maps to `POST /api/projects`)

### Layer 3: Hook Layer (`/hooks/useAppStore.ts` + `/hooks/useApi.ts`)

- **What it is:** React hooks that bridge components to the data and API layers
- **`useAppStore()`** — returns reactive state (re-renders on changes) + sync read helpers + async action methods
- **`useApiCall()`** — optional hook for query-style data fetching with loading/error states
- **`useApiMutation()`** — optional hook for mutation-style writes with loading/error states

### Layer 4: Components (`/components/**/*.tsx`)

- **Read** state via `useAppStore()` reactive properties
- **Write** state via `actions.*` methods (which route through the API layer)
- **Never** import `appStore` directly (type imports are OK)
- **Always** handle loading and error states for user-facing actions

---

## 3. Building a New App (Greenfield)

When asking AI to build a new app, follow this exact order:

### Step 1: Define Your Data Models

Before writing any code, define every entity your app manages.

**Prompt example:**
> Define TypeScript interfaces for all entities in this app. Each entity needs: a unique `id: string`, all required fields, and any relationships (foreign keys as string IDs). Put shared types in `/types/`.

**Example output:**
```typescript
// /types/project.types.ts
export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'active' | 'archived' | 'completed';
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Step 2: Build the Centralized Data Store

**Prompt example:**
> Build `/lib/appStore.ts` — a centralized in-memory data store following the spec in [Section 5](#5-centralized-data-store-spec). It should manage: [list your entities]. Include mock seed data, CRUD methods for each entity, computed getters, cross-domain side effects, and pub/sub for React reactivity.

### Step 3: Build the Mock API Layer

**Prompt example:**
> Build the mock API layer in `/lib/api/` following the spec in [Section 6](#6-mock-api-layer-spec). Create one file per domain. Every function must be `async`, use simulated latency, return `ApiResult<T>` envelopes, and call `appStore` methods internally.

### Step 4: Build the Hook Layer

**Prompt example:**
> Build `/hooks/useAppStore.ts` following the spec in [Section 7](#7-hook-layer-spec). It should subscribe to the data store for reactive reads, expose sync read helpers, and expose async actions that route through the API layer. Components should NEVER need to import `appStore` directly.

### Step 5: Build Components

**Prompt example:**
> Build all UI components. Every component must follow the rules in [Section 8](#8-component-integration-rules): read state from `useAppStore()`, write state through `actions.*` or `api.*`, include loading/disabled states on all action buttons, and handle errors with user-visible feedback.

### Step 6: Verify

> Run the verification checklist in [Section 11](#11-verification-checklist) and fix any violations.

---

## 4. Migrating an Existing App

If you already have a working frontend with scattered state management (direct mutations, prop drilling, mixed patterns), follow this migration path:

### Phase 1: Audit and Catalog

**Prompt:**
> Audit the entire codebase. Find every piece of mutable state and categorize it:
> - **Shared state:** Data used by multiple components or that persists across views (projects, users, notifications, preferences). This goes in the centralized store.
> - **Local state:** Data used by only one component (form inputs, UI toggles, modal open/close). This stays as `useState`.
> - **Derived state:** Data computed from shared state (unread count, filtered lists). This becomes computed getters on the store.
>
> List every file, every state variable, and its category.

### Phase 2: Build the Data Store

**Prompt:**
> Based on the audit, build `/lib/appStore.ts`. Migrate all shared state into a single centralized store with:
> 1. State properties for each entity collection
> 2. CRUD methods for each entity
> 3. Computed getters for derived state
> 4. Pub/sub notification so React hooks can trigger re-renders
> 5. Mock seed data that matches what the app currently renders
> 6. Cross-domain side effects (e.g., deleting a project also deletes its notifications)
>
> Do NOT change any components yet. The store should exist alongside existing code.

### Phase 3: Build the Mock API Layer

**Prompt:**
> Build `/lib/api/` with async wrapper functions for every mutation method on `appStore`. Follow the spec in [Section 6](#6-mock-api-layer-spec). Each function must:
> - Be `async` with simulated latency
> - Accept the same parameters the future REST endpoint will
> - Return `ApiResult<T>` with success/error discrimination
> - Call `appStore` methods internally
>
> Create: `/lib/api/types.ts`, `/lib/api/config.ts`, one file per domain, and `/lib/api/index.ts` barrel export.

### Phase 4: Build the Hook Layer

**Prompt:**
> Build `/hooks/useAppStore.ts` that:
> 1. Subscribes to `appStore` pub/sub for reactive re-renders
> 2. Returns reactive state properties (read-only)
> 3. Returns `reads` object with sync getter methods
> 4. Returns `actions` object with async methods that call the API layer
>
> Also build `/hooks/useApi.ts` with `useApiCall` and `useApiMutation` generic hooks.

### Phase 5: Migrate Components (One at a Time)

**Prompt:**
> Migrate components to the new architecture ONE FILE AT A TIME, in this order:
> 1. Start with the simplest read-only components
> 2. Then migrate components with 1-2 actions
> 3. Then migrate complex components with many actions
>
> For each component:
> - Replace any direct `appStore` imports with `useAppStore()` hook
> - Replace sync mutation calls with `await actions.*` or `api.*` calls
> - Add loading state (`useState<Set<string>>` or `useState<boolean>`) for each action
> - Add `disabled` prop to buttons during loading
> - Add spinner icons during loading
> - Add `toast.error()` for failed actions
> - Verify zero direct `appStore` mutation calls remain
>
> After each file, run a search to confirm no `appStore` mutations leaked through.

### Phase 6: Verify

> Run the full verification checklist in [Section 11](#11-verification-checklist).

---

## 5. Centralized Data Store Spec

File: `/lib/appStore.ts`

### Structure

```typescript
// ─── Type Definitions ──────────────────────────────────
// Define or import all entity interfaces

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  timestamp: Date;
  // ... domain-specific fields
}

// Repeat for every entity...

// ─── Subscriber System ─────────────────────────────────
// Pub/sub so React hooks re-render when state changes

type Slice = 'projects' | 'users' | 'notifications' | 'preferences'; // one per entity collection
type Listener = () => void;

const subscribers: Record<Slice, Set<Listener>> = {
  projects: new Set(),
  users: new Set(),
  notifications: new Set(),
  preferences: new Set(),
};

function notify(slice: Slice) {
  subscribers[slice].forEach(fn => fn());
}

// ─── State ─────────────────────────────────────────────
// All mutable state lives here

let projects: Project[] = [/* mock seed data */];
let notifications: AppNotification[] = [/* mock seed data */];
let preferences: UserPreferences = {/* defaults */};

// ─── CRUD Methods ──────────────────────────────────────
// Every mutation method must call notify() after changing state

function createProject(data: Omit<Project, 'id' | 'createdAt'>): Project {
  const project: Project = {
    id: generateId(),
    ...data,
    createdAt: new Date(),
  };
  projects = [...projects, project];
  notify('projects');
  return project;
}

function updateProject(id: string, updates: Partial<Project>): Project | null {
  const index = projects.findIndex(p => p.id === id);
  if (index === -1) return null;
  projects[index] = { ...projects[index], ...updates, updatedAt: new Date() };
  projects = [...projects]; // new reference for React
  notify('projects');
  return projects[index];
}

function deleteProject(id: string): boolean {
  const before = projects.length;
  projects = projects.filter(p => p.id !== id);
  if (projects.length < before) {
    // Cross-domain side effect: clean up related data
    notifications = notifications.filter(n => n.projectId !== id);
    notify('projects');
    notify('notifications');
    return true;
  }
  return false;
}

// ─── Computed Getters ──────────────────────────────────

function getProjectsByOrg(orgId: string): Project[] {
  return projects.filter(p => p.organizationId === orgId);
}

// ─── Public API ────────────────────────────────────────
// Single exported object — the ONLY way to access the store

export const appStore = {
  // Reactive state (read by hooks)
  get projects() { return projects; },
  get notifications() { return notifications; },
  get preferences() { return preferences; },

  // Computed
  get unreadNotificationCount() { return notifications.filter(n => !n.isRead).length; },
  getProjectsByOrg,

  // Mutations (called by API layer only)
  createProject,
  updateProject,
  deleteProject,
  // ... all CRUD methods

  // Pub/sub
  subscribe(slice: Slice, listener: Listener): () => void {
    subscribers[slice].add(listener);
    return () => subscribers[slice].delete(listener);
  },
};
```

### Key Rules

1. **All state is module-scoped** (not in a class, not in React state)
2. **Every mutation calls `notify(slice)`** so subscribers re-render
3. **Cross-domain side effects** happen inside mutation methods (e.g., delete project also deletes its notifications)
4. **Computed getters** are defined as methods or getter properties
5. **Single export:** `export const appStore = { ... }`
6. **Seed data** makes the app look real immediately

---

## 6. Mock API Layer Spec

### File Structure

```
/lib/api/
  types.ts        # Response envelope types
  config.ts       # Latency simulation, error injection, response builders
  projects.ts     # Domain: projects
  users.ts        # Domain: users
  notifications.ts # Domain: notifications
  preferences.ts  # Domain: preferences
  index.ts        # Barrel export
```

### types.ts

```typescript
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string[]>;
}

export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
```

### config.ts

```typescript
export const apiConfig = {
  /** Set to false to disable simulated latency */
  simulateLatency: true,
  /** Min latency in ms */
  minLatency: 100,
  /** Max latency in ms */
  maxLatency: 400,
  /** Probability of random error (0-1). Use 0.1-0.3 for stress testing. */
  errorRate: 0,
  /** Set to true when real backend is ready */
  useRealApi: false,
};

export async function simulateLatency(): Promise<void> {
  if (!apiConfig.simulateLatency) return;
  const delay = apiConfig.minLatency + Math.random() * (apiConfig.maxLatency - apiConfig.minLatency);
  await new Promise(r => setTimeout(r, delay));
}

export function shouldSimulateError(): boolean {
  return Math.random() < apiConfig.errorRate;
}

export function successResponse<T>(data: T): ApiResult<T> {
  return { success: true, data };
}

export function errorResponse(code: string, message: string): ApiResult<never> {
  return { success: false, error: { code, message } };
}

/**
 * Wraps a mock implementation in standard latency/error handling.
 * When useRealApi is true, this function would call fetch() instead.
 */
export async function mockApiCall<T>(
  fn: () => T,
  errorMessage = 'An unexpected error occurred'
): Promise<ApiResult<T>> {
  await simulateLatency();
  if (shouldSimulateError()) {
    return errorResponse('SIMULATED_ERROR', errorMessage);
  }
  try {
    const result = fn();
    return successResponse(result);
  } catch (e) {
    return errorResponse('INTERNAL_ERROR', e instanceof Error ? e.message : errorMessage);
  }
}
```

### Domain File Pattern (e.g., projects.ts)

```typescript
import { appStore } from '../appStore';
import { mockApiCall, errorResponse } from './config';
import type { ApiResult } from './types';
import type { Project } from '../../types/project.types';

// Function signature mirrors: POST /api/projects
export async function createProject(data: {
  name: string;
  description?: string;
  organizationId: string;
}): Promise<ApiResult<Project>> {
  // Validation (mirrors server-side validation)
  if (!data.name.trim()) {
    return errorResponse('VALIDATION_ERROR', 'Project name is required');
  }

  return mockApiCall(() => appStore.createProject(data));
}

// Function signature mirrors: PUT /api/projects/:id
export async function updateProject(
  id: string,
  data: Partial<Project>
): Promise<ApiResult<Project>> {
  return mockApiCall(() => {
    const result = appStore.updateProject(id, data);
    if (!result) throw new Error(`Project ${id} not found`);
    return result;
  });
}

// Function signature mirrors: DELETE /api/projects/:id
export async function deleteProject(id: string): Promise<ApiResult<boolean>> {
  return mockApiCall(() => {
    const result = appStore.deleteProject(id);
    if (!result) throw new Error(`Project ${id} not found`);
    return result;
  });
}

// Function signature mirrors: GET /api/projects?orgId=xxx
export async function getProjectsByOrg(orgId: string): Promise<ApiResult<Project[]>> {
  return mockApiCall(() => appStore.getProjectsByOrg(orgId));
}
```

### index.ts (Barrel Export)

```typescript
import * as projects from './projects';
import * as users from './users';
import * as notifications from './notifications';
import * as preferences from './preferences';

export const api = {
  projects,
  users,
  notifications,
  preferences,
};

export type { ApiResult, ApiError, PaginatedResult } from './types';
```

### Key Rules

1. **Every function is `async`** even though mock implementation is synchronous
2. **Every function returns `ApiResult<T>`** — never throws, never returns raw data
3. **Function signatures match future REST endpoints** — same parameter shape, same return shape
4. **Validation happens in the API layer** (not in components, not in the data store)
5. **`mockApiCall()` wraps all implementations** for consistent latency/error behavior
6. **One file per domain** — maps to one backend controller

---

## 7. Hook Layer Spec

### /hooks/useAppStore.ts

```typescript
import { useState, useEffect, useMemo, useCallback } from 'react';
import { appStore } from '../lib/appStore';
import { api } from '../lib/api';

type Slice = 'projects' | 'users' | 'notifications' | 'preferences';

export function useAppStore(...subscribeTo: Slice[]) {
  // Force re-render when subscribed slices change
  const [, bump] = useState(0);

  useEffect(() => {
    const unsubscribes = subscribeTo.map(slice =>
      appStore.subscribe(slice, () => bump(v => v + 1))
    );
    return () => unsubscribes.forEach(unsub => unsub());
  }, [/* subscribeTo is static per component */]);

  // ─── Reactive State (re-renders on change) ───────────
  // These simulate real-time updates (like SignalR/WebSocket)
  const projects = appStore.projects;
  const notifications = appStore.notifications;
  const preferences = appStore.preferences;
  const unreadCount = appStore.unreadNotificationCount;

  // ─── Sync Read Helpers ───────────────────────────────
  // For computed/filtered data that doesn't need its own subscription
  const reads = useMemo(() => ({
    getProjectsByOrg: (orgId: string) => appStore.getProjectsByOrg(orgId),
    // ... other sync getters
  }), []);

  // ─── Async Actions (routed through API layer) ───────
  // These simulate HTTP calls to the backend
  const actions = useMemo(() => ({
    createProject: (data: Parameters<typeof api.projects.createProject>[0]) =>
      api.projects.createProject(data),
    updateProject: (id: string, data: Parameters<typeof api.projects.updateProject>[1]) =>
      api.projects.updateProject(id, data),
    deleteProject: (id: string) =>
      api.projects.deleteProject(id),
    markNotificationRead: (id: string) =>
      api.notifications.markNotificationRead(id),
    // ... map every mutation to its API function
  }), []);

  return {
    // Reactive state
    projects,
    notifications,
    preferences,
    unreadCount,
    // Sync reads
    reads,
    // Async writes
    actions,
  };
}
```

### /hooks/useApi.ts (Optional utility hooks)

```typescript
import { useState, useCallback } from 'react';
import type { ApiResult } from '../lib/api';

/**
 * Hook for async data fetching with loading/error tracking.
 */
export function useApiCall<T>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (apiFn: () => Promise<ApiResult<T>>) => {
    setLoading(true);
    setError(null);
    const result = await apiFn();
    setLoading(false);
    if (result.success) {
      setData(result.data);
    } else {
      setError(result.error.message);
    }
    return result;
  }, []);

  return { data, loading, error, execute };
}

/**
 * Hook for async mutations with loading/error tracking.
 */
export function useApiMutation<TInput, TOutput>() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(async (
    apiFn: (input: TInput) => Promise<ApiResult<TOutput>>,
    input: TInput
  ) => {
    setLoading(true);
    setError(null);
    const result = await apiFn(input);
    setLoading(false);
    if (!result.success) {
      setError(result.error.message);
    }
    return result;
  }, []);

  return { loading, error, mutate };
}
```

---

## 8. Component Integration Rules

### What Components CAN Do

```typescript
// 1. Import and use the hook
import { useAppStore } from '../hooks/useAppStore';

// 2. Read reactive state
const { projects, notifications, actions, reads } = useAppStore('projects', 'notifications');

// 3. Call async actions with loading states
const [saving, setSaving] = useState(false);

const handleSave = async () => {
  setSaving(true);
  const result = await actions.updateProject(id, { name: newName });
  setSaving(false);
  if (result.success) {
    toast.success('Saved!');
  } else {
    toast.error(result.error.message);
  }
};

// 4. Import `api` directly for fire-and-forget side effects
import { api } from '../lib/api';

// After a primary action succeeds, log activity (non-blocking)
api.activity.addActivity({ type: 'update', title: 'Project updated', ... });
```

### What Components CANNOT Do

```typescript
// NEVER import appStore directly (except for types)
import { appStore } from '../lib/appStore'; // FORBIDDEN

// NEVER call appStore methods
appStore.createProject(data); // FORBIDDEN

// NEVER mutate state synchronously
appStore.projects.push(newProject); // FORBIDDEN
```

### Fire-and-Forget vs. Awaited Calls

| Pattern | When to Use | Example |
|---|---|---|
| `await actions.*()`  | Primary action — user needs feedback | Save, Delete, Approve |
| `api.*.*()`           | Side effect — logging, notifications | Activity log, notification creation |

**Rule:** If the user clicked a button and expects to know if it worked, `await` it. If it's a background side effect, fire-and-forget.

---

## 9. Loading, Error, and Optimistic UI Patterns

### Per-Item Loading (for lists)

When a list has individual action buttons (e.g., approve, delete per row):

```typescript
const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

const handleAction = async (id: string) => {
  setLoadingIds(prev => new Set(prev).add(id));
  const result = await actions.doSomething(id);
  setLoadingIds(prev => { const next = new Set(prev); next.delete(id); return next; });

  if (result.success) toast.success('Done!');
  else toast.error(result.error.message);
};

// In JSX:
<Button disabled={loadingIds.has(item.id)} onClick={() => handleAction(item.id)}>
  {loadingIds.has(item.id) ? <Loader2 className="animate-spin" /> : <Check />}
  Approve
</Button>
```

### Single-Action Loading (for forms)

```typescript
const [saving, setSaving] = useState(false);

const handleSave = async () => {
  setSaving(true);
  const result = await actions.save(data);
  setSaving(false);
  // handle result...
};

<Button disabled={saving}>
  {saving ? <Loader2 className="animate-spin" /> : <Save />}
  Save
</Button>
```

### Batch Loading (for "Mark All Read" style actions)

```typescript
const [processing, setProcessing] = useState(false);

const handleBatch = async () => {
  setProcessing(true);
  await actions.markAllRead();
  setProcessing(false);
};
```

### Error Display

- **Toast:** For action failures (save failed, delete failed)
- **Inline:** For form validation errors
- **Banner:** For page-load failures

---

## 10. Backend Swap Strategy

When the real backend is ready, the swap happens in ONE place:

### Option A: Config Switch (Recommended)

In `/lib/api/config.ts`:

```typescript
export const apiConfig = {
  useRealApi: true, // Flip this switch
  baseUrl: 'https://api.yourapp.com',
};
```

Then in each domain file, add a real implementation branch:

```typescript
export async function createProject(data: CreateProjectInput): Promise<ApiResult<Project>> {
  if (apiConfig.useRealApi) {
    // Real implementation
    const response = await fetch(`${apiConfig.baseUrl}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      return errorResponse(err.code, err.message);
    }
    return successResponse(await response.json());
  }

  // Mock implementation (existing code)
  return mockApiCall(() => appStore.createProject(data));
}
```

### Option B: Module Replacement

Create `/lib/api/real/` with the same file structure and swap the import in `index.ts`:

```typescript
// index.ts
const USE_REAL = process.env.REACT_APP_USE_REAL_API === 'true';

export const api = USE_REAL
  ? require('./real').api
  : require('./mock').api;
```

### What Stays the Same

- All component code
- All hook code
- All type definitions
- All loading/error patterns

### What Changes

- API function implementations (mock -> fetch)
- Data store becomes unnecessary (real DB replaces it)
- Pub/sub may be replaced by WebSocket/SignalR for real-time

---

## 11. Verification Checklist

Run these checks after building or migrating. Every check must pass.

### Architecture Integrity

```bash
# 1. Zero direct appStore mutation calls in components
Search: appStore\.(create|update|delete|add|mark|clear|approve|reject|submit)
Files:  **/*.tsx
Expected: 0 matches

# 2. Zero runtime appStore imports in components
Search: import { appStore
Files:  **/*.tsx
Expected: 0 matches (type-only imports are OK)

# 3. All appStore mutations are exclusively in /lib/api/
Search: appStore\.(create|update|delete|add|mark|clear)
Files:  **/*.ts (excluding /lib/api/)
Expected: 0 matches outside /lib/api/

# 4. All API functions are async
Search: export function .* \{  (without async)
Files:  /lib/api/*.ts
Expected: 0 non-async exported functions

# 5. All API functions return ApiResult<T>
Search: Promise<ApiResult
Files:  /lib/api/*.ts
Expected: Every exported function has this return type
```

### Component Quality

```bash
# 6. Every action button has a loading state
# Manual check: search for onClick handlers that call actions.* or api.*
# Each should have a corresponding disabled={loading} and spinner

# 7. Every awaited action has error handling
# Search for: await actions.
# Each should be followed by success/error branching

# 8. No orphaned toast-only stubs
# Search for: toast.success( or toast.error(
# Each toast should be the RESULT of an API call, not a standalone stub
```

### Data Flow

```bash
# 9. useAppStore consumers are correct
Search: useAppStore
Files:  **/*.tsx
# Verify each component subscribes to the slices it reads

# 10. Fire-and-forget calls are intentional
Search: api\.(activity|notifications)\.(add|create)
Files:  **/*.tsx
# These should NOT be awaited (side effects)

# 11. Primary actions are awaited
Search: await (actions\.|api\.projects|api\.deliverables)
Files:  **/*.tsx
# These SHOULD be awaited (user-facing)
```

---

## 12. Quick-Start Prompt Template

Copy and paste this when asking AI to build a new app:

---

**Prompt:**

> Build a [describe your app] using React + TypeScript + Tailwind CSS.
>
> Follow this architecture exactly:
>
> **1. Centralized Data Store (`/lib/appStore.ts`):**
> A plain TypeScript module with in-memory state, CRUD methods for each entity, computed getters, pub/sub for React reactivity, cross-domain side effects, and mock seed data. Export a single `appStore` object.
>
> **2. Mock API Layer (`/lib/api/`):**
> Async wrapper functions organized by domain (one file per entity type). Each function: is `async`, uses simulated latency (100-400ms configurable), returns `ApiResult<T>` (discriminated union of `{success: true, data: T}` | `{success: false, error: ApiError}`), validates inputs, and calls `appStore` methods internally. Include `/lib/api/types.ts` for response types, `/lib/api/config.ts` for latency/error simulation, and `/lib/api/index.ts` barrel export. Function signatures should mirror REST endpoints (e.g., `createProject(data)` = `POST /api/projects`).
>
> **3. Hook Layer (`/hooks/useAppStore.ts`):**
> A React hook that subscribes to `appStore` pub/sub for reactive re-renders. Returns: reactive state properties (for rendering), a `reads` object with sync getter methods (for computed data), and an `actions` object with async methods that route through the API layer.
>
> **4. Component Rules:**
> - Components NEVER import `appStore` directly (type imports OK)
> - All reads go through `useAppStore()` reactive properties
> - All writes go through `actions.*` (awaited, with error handling) or `api.*` (fire-and-forget for side effects)
> - Every action button has loading/disabled states with spinners
> - Every awaited action has error handling with user-visible feedback (toast)
>
> **5. Backend Swap:**
> When a real backend is ready, only the API layer implementation changes (mock -> fetch). Components and hooks remain untouched. Include a `useRealApi` config flag in `/lib/api/config.ts`.
>
> The app should be fully functional with mock data, feel real with simulated latency, and have proper loading/error states everywhere.
>
> The entities in this app are: [list your entities]
> The features are: [list your features]

---

## Appendix: File Tree Reference

```
/lib/
  appStore.ts                  # Centralized data store
  api/
    types.ts                   # ApiResult, ApiError, PaginatedResult
    config.ts                  # simulateLatency, mockApiCall, apiConfig
    projects.ts                # Domain: projects (mirrors ProjectsController)
    users.ts                   # Domain: users (mirrors UsersController)
    notifications.ts           # Domain: notifications
    activity.ts                # Domain: activity/audit log
    preferences.ts             # Domain: user preferences
    index.ts                   # Barrel: export const api = { projects, users, ... }

/hooks/
  useAppStore.ts               # Reactive reads + sync helpers + async actions
  useApi.ts                    # useApiCall + useApiMutation utility hooks

/types/
  project.types.ts             # Shared TypeScript interfaces
  user.types.ts
  ...

/components/
  ...                          # All UI components (never import appStore)
```
