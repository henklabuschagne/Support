import { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Settings as SettingsIcon, Clock, Zap, MessageSquareText, FileText, Users, Bell, Building2, Route, Shield, ShieldCheck, ShieldAlert, Eye, ScrollText, Search, Filter, ChevronDown, ChevronUp, AlertTriangle, FolderOpen } from 'lucide-react';
import { DepartmentSetup } from '../components/DepartmentSetup';
import { RoutingRules } from '../components/RoutingRules';
import { CategorySetup } from '../components/CategorySetup';
import { toast } from 'sonner';
import type { UserRole, PermissionAction, AuditAction, CustomPermissions } from '../types';

const ALL_PERMISSIONS: { action: PermissionAction; label: string; description: string; category: string }[] = [
  { action: 'view_all', label: 'View All Tickets', description: 'See tickets across all departments', category: 'Viewing' },
  { action: 'view_settings', label: 'View Settings', description: 'Access the Settings page', category: 'Viewing' },
  { action: 'view_reports', label: 'View Reports', description: 'Access reports and analytics', category: 'Viewing' },
  { action: 'view_operations', label: 'View Operations', description: 'Access Operations Dashboard and Smart Queue', category: 'Viewing' },
  { action: 'view_audit_log', label: 'View Audit Log', description: 'Access the audit trail', category: 'Viewing' },
  { action: 'create_tickets', label: 'Create Tickets', description: 'Create new support tickets', category: 'Actions' },
  { action: 'create', label: 'Create Content', description: 'Create comments, KB articles, etc.', category: 'Actions' },
  { action: 'edit', label: 'Edit Tickets', description: 'Modify ticket status, priority, and fields', category: 'Actions' },
  { action: 'bulk_actions', label: 'Bulk Actions', description: 'Perform operations on multiple tickets', category: 'Actions' },
  { action: 'delete', label: 'Delete', description: 'Delete tickets, comments, and data', category: 'Admin' },
  { action: 'manage_departments', label: 'Manage Departments', description: 'Create, edit, and delete departments', category: 'Admin' },
  { action: 'manage_routing', label: 'Manage Routing', description: 'Configure ticket routing rules', category: 'Admin' },
  { action: 'manage_users', label: 'Manage Users', description: 'Edit user roles and permissions', category: 'Admin' },
];

const AUDIT_ACTION_LABELS: Record<AuditAction, string> = {
  role_changed: 'Role Changed',
  permissions_changed: 'Permissions Changed',
  department_changed: 'Department Changed',
  user_switched: 'User Switched',
  user_created: 'User Created',
  user_deactivated: 'User Deactivated',
  department_created: 'Department Created',
  department_updated: 'Department Updated',
  department_deleted: 'Department Deleted',
  routing_rule_created: 'Routing Rule Created',
  routing_rule_updated: 'Routing Rule Updated',
  routing_rule_deleted: 'Routing Rule Deleted',
};

const AUDIT_ACTION_COLORS: Record<string, string> = {
  role_changed: 'bg-brand-primary-light text-brand-primary',
  permissions_changed: 'bg-brand-secondary-light text-brand-primary',
  department_changed: 'bg-brand-primary-light text-brand-primary',
  user_switched: 'bg-secondary text-muted-foreground',
  user_created: 'bg-brand-success-light text-brand-success',
  user_deactivated: 'bg-brand-error-light text-brand-error',
  department_created: 'bg-brand-success-light text-brand-success',
  department_updated: 'bg-brand-warning-light text-brand-warning',
  department_deleted: 'bg-brand-error-light text-brand-error',
  routing_rule_created: 'bg-brand-primary-light text-brand-primary',
  routing_rule_updated: 'bg-brand-primary-light text-brand-primary',
  routing_rule_deleted: 'bg-brand-error-light text-brand-error',
};

export function Settings() {
  const { slas, workflowRules, cannedResponses, users, departments, currentUser, auditLog, reads, actions } = useAppStore('slas', 'workflowRules', 'cannedResponses', 'users', 'departments', 'currentUser', 'auditLog');
  const [activeTab, setActiveTab] = useState('departments');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('agent');
  const [editDept, setEditDept] = useState<string>('1');
  const [editGrants, setEditGrants] = useState<PermissionAction[]>([]);
  const [editRevokes, setEditRevokes] = useState<PermissionAction[]>([]);
  const [showPermissions, setShowPermissions] = useState(false);

  // Audit log filters
  const [auditSearchQuery, setAuditSearchQuery] = useState('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');

  const isAdmin = currentUser?.role === 'admin';
  const canManageUsers = reads.hasPermission('manage_users');
  const canViewAuditLog = reads.hasPermission('view_audit_log');

  const getPriorityBadge = (priority?: string) => {
    if (!priority) return <Badge variant="outline">All Priorities</Badge>;
    const colors = {
      low: 'bg-secondary text-muted-foreground',
      medium: 'bg-brand-primary-light text-brand-primary',
      high: 'bg-brand-warning-light text-brand-warning',
      urgent: 'bg-brand-error-light text-brand-error',
    };
    return <Badge className={colors[priority as keyof typeof colors]}>{priority}</Badge>;
  };

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin': return <ShieldCheck className="w-3.5 h-3.5" />;
      case 'manager': return <Shield className="w-3.5 h-3.5" />;
      case 'agent': return <Users className="w-3.5 h-3.5" />;
      case 'viewer': return <Eye className="w-3.5 h-3.5" />;
    }
  };

  const getRoleBadge = (role: UserRole) => {
    const styles = {
      admin: 'bg-brand-error-light text-brand-error',
      manager: 'bg-brand-primary-light text-brand-primary',
      agent: 'bg-secondary text-muted-foreground',
      viewer: 'bg-brand-warning-light text-brand-warning',
    };
    return (
      <Badge className={`${styles[role]} gap-1`}>
        {getRoleIcon(role)}
        <span className="capitalize">{role}</span>
      </Badge>
    );
  };

  const openEditUser = (userId: string) => {
    const user = reads.getUserById(userId);
    if (user) {
      setEditRole(user.role);
      setEditDept(user.department);
      setEditGrants(user.customPermissions?.grants || []);
      setEditRevokes(user.customPermissions?.revokes || []);
      setShowPermissions(false);
      setEditingUserId(userId);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUserId) return;
    const prevUser = reads.getUserById(editingUserId);
    if (!prevUser) return;

    const customPermissions: CustomPermissions | undefined =
      (editGrants.length > 0 || editRevokes.length > 0)
        ? { grants: editGrants.length > 0 ? editGrants : undefined, revokes: editRevokes.length > 0 ? editRevokes : undefined }
        : undefined;

    await actions.updateUser(editingUserId, { role: editRole, department: editDept, customPermissions });

    // Log audit entries for changes
    if (prevUser.role !== editRole) {
      await actions.addAuditEntry({
        actorId: currentUser?.id || '1',
        targetUserId: editingUserId,
        action: 'role_changed',
        details: { from: prevUser.role, to: editRole },
      });
    }

    if (prevUser.department !== editDept) {
      const fromDept = reads.getDepartmentName(prevUser.department);
      const toDept = reads.getDepartmentName(editDept);
      await actions.addAuditEntry({
        actorId: currentUser?.id || '1',
        targetUserId: editingUserId,
        action: 'department_changed',
        details: { from: fromDept, to: toDept },
      });
    }

    const prevGrants = prevUser.customPermissions?.grants || [];
    const prevRevokes = prevUser.customPermissions?.revokes || [];
    if (JSON.stringify(prevGrants.sort()) !== JSON.stringify(editGrants.sort()) ||
        JSON.stringify(prevRevokes.sort()) !== JSON.stringify(editRevokes.sort())) {
      const addedGrants = editGrants.filter(g => !prevGrants.includes(g));
      const removedGrants = prevGrants.filter(g => !editGrants.includes(g));
      const addedRevokes = editRevokes.filter(r => !prevRevokes.includes(r));
      const removedRevokes = prevRevokes.filter(r => !editRevokes.includes(r));
      await actions.addAuditEntry({
        actorId: currentUser?.id || '1',
        targetUserId: editingUserId,
        action: 'permissions_changed',
        details: {
          granted: addedGrants,
          ungrantedGrants: removedGrants,
          revoked: addedRevokes,
          unrevokedRevokes: removedRevokes,
        },
      });
    }

    toast.success('User updated');
    setEditingUserId(null);
  };

  const handleSwitchUser = async (userId: string) => {
    await actions.switchUser(userId);
    toast.success(`Switched to ${reads.getUserName(userId)}`);
  };

  const toggleGrant = (action: PermissionAction) => {
    // If currently granted, remove the grant
    if (editGrants.includes(action)) {
      setEditGrants(editGrants.filter(a => a !== action));
    } else {
      // Grant it, and remove from revokes if present
      setEditGrants([...editGrants, action]);
      setEditRevokes(editRevokes.filter(a => a !== action));
    }
  };

  const toggleRevoke = (action: PermissionAction) => {
    // If currently revoked, remove the revoke
    if (editRevokes.includes(action)) {
      setEditRevokes(editRevokes.filter(a => a !== action));
    } else {
      // Revoke it, and remove from grants if present
      setEditRevokes([...editRevokes, action]);
      setEditGrants(editGrants.filter(a => a !== action));
    }
  };

  const getPermissionState = (action: PermissionAction): 'default' | 'granted' | 'revoked' => {
    if (editGrants.includes(action)) return 'granted';
    if (editRevokes.includes(action)) return 'revoked';
    return 'default';
  };

  const getEffectivePermission = (action: PermissionAction): boolean => {
    if (editRevokes.includes(action)) return false;
    if (editGrants.includes(action)) return true;
    return reads.getRoleDefaultPermission(editRole, action);
  };

  // Audit log filtering
  const filteredAuditLog = auditLog.filter(entry => {
    if (auditActionFilter !== 'all' && entry.action !== auditActionFilter) return false;
    if (auditSearchQuery.trim()) {
      const q = auditSearchQuery.toLowerCase();
      const actor = reads.getUserById(entry.actorId);
      const target = entry.targetUserId ? reads.getUserById(entry.targetUserId) : null;
      const match =
        (actor?.name.toLowerCase().includes(q)) ||
        (target?.name.toLowerCase().includes(q)) ||
        entry.action.toLowerCase().includes(q) ||
        JSON.stringify(entry.details).toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const formatTimestamp = (ts: string) => {
    const date = new Date(ts);
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit',
    });
  };

  const renderAuditDetails = (entry: typeof auditLog[0]) => {
    const d = entry.details;
    switch (entry.action) {
      case 'role_changed':
        return (
          <span>
            Role changed from <Badge variant="outline" className="text-xs mx-0.5">{d.from}</Badge> to <Badge variant="outline" className="text-xs mx-0.5">{d.to}</Badge>
            {d.reason && <span className="text-gray-500 ml-1">({d.reason})</span>}
          </span>
        );
      case 'permissions_changed': {
        const parts: string[] = [];
        if (d.granted?.length) parts.push(`Granted: ${d.granted.join(', ')}`);
        if (d.revoked?.length) parts.push(`Revoked: ${d.revoked.join(', ')}`);
        if (d.ungrantedGrants?.length) parts.push(`Removed grants: ${d.ungrantedGrants.join(', ')}`);
        if (d.unrevokedRevokes?.length) parts.push(`Removed revokes: ${d.unrevokedRevokes.join(', ')}`);
        return <span className="text-sm">{parts.join(' | ') || 'No changes'}</span>;
      }
      case 'department_changed':
        return <span>Department changed from <strong>{d.from}</strong> to <strong>{d.to}</strong></span>;
      case 'department_created':
        return <span>Created department <strong>{d.departmentName}</strong></span>;
      case 'department_updated':
        return <span>Updated department <strong>{d.departmentName}</strong></span>;
      case 'department_deleted':
        return <span>Deleted department <strong>{d.departmentName}</strong></span>;
      case 'routing_rule_created':
        return <span>Created routing rule <strong>{d.ruleName}</strong></span>;
      case 'routing_rule_updated':
        return <span>Updated routing rule <strong>{d.ruleName}</strong>{d.changes && `: ${d.changes}`}</span>;
      case 'routing_rule_deleted':
        return <span>Deleted routing rule <strong>{d.ruleName}</strong></span>;
      case 'user_switched':
        return <span>Switched to user session</span>;
      default:
        return <span className="text-sm text-gray-500">{JSON.stringify(d)}</span>;
    }
  };

  // Count custom permission overrides for a user
  const getOverrideCount = (userId: string) => {
    const user = reads.getUserById(userId);
    if (!user?.customPermissions) return 0;
    return (user.customPermissions.grants?.length || 0) + (user.customPermissions.revokes?.length || 0);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">
          <SettingsIcon className="w-8 h-8 inline-block mr-3 align-middle" />
          Settings & Configuration
        </h1>
        <p className="text-muted-foreground mt-2">Manage departments, routing, roles, SLAs, workflows, and system settings</p>
        {currentUser && (
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm text-gray-500">Logged in as:</span>
            <span className="text-sm font-medium">{currentUser.name}</span>
            {getRoleBadge(currentUser.role)}
            {!isAdmin && (
              <span className="text-xs text-gray-400 ml-2">(Some features require Admin role)</span>
            )}
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 flex-wrap">
          <TabsTrigger value="departments" className="gap-2">
            <Building2 className="w-4 h-4" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="categories" className="gap-2">
            <FolderOpen className="w-4 h-4" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="routing" className="gap-2">
            <Route className="w-4 h-4" />
            Routing Rules
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="agents" className="gap-2">
              <Users className="w-4 h-4" />
              Users & Roles
            </TabsTrigger>
          )}
          {canViewAuditLog && (
            <TabsTrigger value="audit" className="gap-2">
              <ScrollText className="w-4 h-4" />
              Audit Log ({auditLog.length})
            </TabsTrigger>
          )}
          <TabsTrigger value="slas" className="gap-2">
            <Clock className="w-4 h-4" />
            SLAs ({slas.length})
          </TabsTrigger>
          <TabsTrigger value="workflows" className="gap-2">
            <Zap className="w-4 h-4" />
            Workflows ({workflowRules.length})
          </TabsTrigger>
          <TabsTrigger value="canned" className="gap-2">
            <MessageSquareText className="w-4 h-4" />
            Canned Responses
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="w-4 h-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Departments Tab */}
        <TabsContent value="departments">
          <DepartmentSetup />
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories">
          <CategorySetup />
        </TabsContent>

        {/* Routing Rules Tab */}
        <TabsContent value="routing">
          <RoutingRules />
        </TabsContent>

        {/* Users & Roles Tab */}
        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Users & Role Management</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Manage agent roles, department assignments, and custom permissions</p>
                </div>
                <Button>Invite User</Button>
              </div>
            </CardHeader>
            <CardContent>
              {/* Role Legend */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Role Defaults (overridable per user)</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-red-600" />
                      <span className="text-sm font-medium">Admin</span>
                    </div>
                    <p className="text-xs text-gray-500">Full access, manage departments, users, routing rules</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium">Manager</span>
                    </div>
                    <p className="text-xs text-gray-500">View all tickets, manage department agents, reports</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium">Agent</span>
                    </div>
                    <p className="text-xs text-gray-500">Create, edit, and resolve tickets in their department</p>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium">Viewer</span>
                    </div>
                    <p className="text-xs text-gray-500">Read-only access to tickets and reports</p>
                  </div>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Primary Department</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Custom Overrides</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(user => {
                    const dept = reads.getDepartmentById(user.department);
                    const overrideCount = getOverrideCount(user.id);

                    return (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {user.name}
                            {user.id === currentUser?.id && (
                              <Badge variant="outline" className="text-xs">You</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-gray-600">{user.email}</TableCell>
                        <TableCell>
                          {dept && (
                            <div className="flex items-center gap-1.5">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                              <span className="text-sm">{dept.name}</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                        <TableCell>
                          {overrideCount > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {(user.customPermissions?.grants || []).map(g => (
                                <Badge key={g} className="bg-green-100 text-green-800 text-xs">+{g.replace(/_/g, ' ')}</Badge>
                              ))}
                              {(user.customPermissions?.revokes || []).map(r => (
                                <Badge key={r} className="bg-red-100 text-red-800 text-xs">-{r.replace(/_/g, ' ')}</Badge>
                              ))}
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Role defaults</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              user.status === 'online' ? 'bg-green-500' :
                              user.status === 'busy' ? 'bg-yellow-500' : 'bg-gray-400'
                            }`} />
                            <span className="text-sm capitalize">{user.status || 'offline'}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEditUser(user.id)}>
                              Edit
                            </Button>
                            {user.id !== currentUser?.id && (
                              <Button variant="ghost" size="sm" className="text-blue-600" onClick={() => handleSwitchUser(user.id)}>
                                Switch
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <ScrollText className="w-5 h-5" />
                    Audit Trail
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-1">Track all role changes, permission modifications, and administrative actions</p>
                </div>
                <Badge variant="outline">{filteredAuditLog.length} entries</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Search by user, action, or details..."
                    value={auditSearchQuery}
                    onChange={(e) => setAuditSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Select value={auditActionFilter} onValueChange={setAuditActionFilter}>
                  <SelectTrigger className="w-52">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="All actions" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Actions</SelectItem>
                    {(Object.keys(AUDIT_ACTION_LABELS) as AuditAction[]).map(action => (
                      <SelectItem key={action} value={action}>
                        {AUDIT_ACTION_LABELS[action]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Timeline */}
              <div className="space-y-0">
                {filteredAuditLog.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <ScrollText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No audit log entries found</p>
                  </div>
                ) : (
                  filteredAuditLog.map((entry, idx) => {
                    const actor = reads.getUserById(entry.actorId);
                    const target = entry.targetUserId ? reads.getUserById(entry.targetUserId) : null;

                    return (
                      <div
                        key={entry.id}
                        className={`flex gap-4 py-3 ${idx < filteredAuditLog.length - 1 ? 'border-b border-gray-100' : ''}`}
                      >
                        {/* Timeline dot */}
                        <div className="flex flex-col items-center pt-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-400 flex-shrink-0" />
                          {idx < filteredAuditLog.length - 1 && (
                            <div className="w-px flex-1 bg-gray-200 mt-1" />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={`text-xs ${AUDIT_ACTION_COLORS[entry.action] || 'bg-gray-100 text-gray-800'}`}>
                              {AUDIT_ACTION_LABELS[entry.action as AuditAction] || entry.action}
                            </Badge>
                            <span className="text-xs text-gray-500">{formatTimestamp(entry.timestamp)}</span>
                          </div>
                          <div className="text-sm text-gray-700">
                            <span className="font-medium">{actor?.name || 'Unknown'}</span>
                            {target && (
                              <>
                                {' '}<span className="text-gray-400">→</span>{' '}
                                <span className="font-medium">{target.name}</span>
                              </>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 mt-0.5">
                            {renderAuditDetails(entry)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SLAs Tab */}
        <TabsContent value="slas">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Service Level Agreements</CardTitle>
                <Button>Add New SLA</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>First Response</TableHead>
                    <TableHead>Resolution Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {slas.map(sla => (
                    <TableRow key={sla.id}>
                      <TableCell className="font-medium">{sla.name}</TableCell>
                      <TableCell>{getPriorityBadge(sla.priority)}</TableCell>
                      <TableCell>{sla.firstResponseTime}h</TableCell>
                      <TableCell>{sla.resolutionTime}h</TableCell>
                      <TableCell>
                        {sla.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflows Tab */}
        <TabsContent value="workflows">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Workflow Automation Rules</CardTitle>
                <Button>Create Workflow</Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Trigger</TableHead>
                    <TableHead>Conditions</TableHead>
                    <TableHead>Actions</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workflowRules.map(rule => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {rule.trigger.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {rule.conditions.priority && `Priority: ${rule.conditions.priority}`}
                        {rule.conditions.status && ` · Status: ${rule.conditions.status}`}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {rule.actions.assignTo && 'Auto-assign'}
                        {rule.actions.changeStatus && ' · Change status'}
                        {rule.actions.changePriority && ' · Change priority'}
                      </TableCell>
                      <TableCell>
                        {rule.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="outline">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">Edit</Button>
                          <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Canned Responses Tab */}
        <TabsContent value="canned">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Canned Responses</CardTitle>
                <Button>Add Response</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cannedResponses.map(response => (
                  <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-medium text-gray-900">{response.name}</h3>
                        {response.subject && (
                          <p className="text-sm text-gray-600 mt-1">Subject: {response.subject}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">Edit</Button>
                        <Button variant="ghost" size="sm" className="text-red-600">Delete</Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">{response.content}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Ticket Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Ticket Templates</CardTitle>
                <Button>Create Template</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">Bug Report Template</h3>
                      <p className="text-sm text-gray-600 mt-1">For technical issues and bugs</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Use Template</Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Default Priority:</strong> High</p>
                    <p><strong>Default Department:</strong> Technical Support</p>
                    <p><strong>Required Fields:</strong> Steps to reproduce, Expected behavior, Actual behavior</p>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">Feature Request Template</h3>
                      <p className="text-sm text-gray-600 mt-1">For new feature suggestions</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Use Template</Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Default Priority:</strong> Medium</p>
                    <p><strong>Default Department:</strong> Product</p>
                    <p><strong>Required Fields:</strong> Feature description, Use case, Business value</p>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-medium text-gray-900">Billing Inquiry Template</h3>
                      <p className="text-sm text-gray-600 mt-1">For billing and payment questions</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">Edit</Button>
                      <Button variant="outline" size="sm">Use Template</Button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p><strong>Default Priority:</strong> Medium</p>
                    <p><strong>Default Department:</strong> Billing</p>
                    <p><strong>Required Fields:</strong> Account number, Invoice number (if applicable)</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Ticket Assigned</p>
                    <p className="text-sm text-gray-500">Notify agents when a ticket is assigned to them</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Ticket Status Changed</p>
                    <p className="text-sm text-gray-500">Notify customers when ticket status changes</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SLA Breach Warning</p>
                    <p className="text-sm text-gray-500">Alert when SLA is at risk of being breached</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Comment Added</p>
                    <p className="text-sm text-gray-500">Notify when someone comments on your ticket</p>
                  </div>
                  <Badge variant="outline">Disabled</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Integration Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <SettingsLabel>Support Email Address</SettingsLabel>
                  <p className="text-sm text-gray-600 mt-1">support@yourcompany.com</p>
                  <p className="text-xs text-gray-500 mt-1">Emails sent to this address will create tickets</p>
                </div>
                <div>
                  <SettingsLabel>Email Signature</SettingsLabel>
                  <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                    Best regards,{'\n'}
                    Support Team{'\n'}
                    Your Company
                  </p>
                </div>
                <Button variant="outline" className="w-full">Configure Email Settings</Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit User Dialog with Custom Permissions */}
      <Dialog open={!!editingUserId} onOpenChange={(open) => !open && setEditingUserId(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {editingUserId && (
              <p className="text-sm text-gray-600">
                Editing: <span className="font-medium">{reads.getUserName(editingUserId)}</span>
              </p>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <SettingsLabel>Role</SettingsLabel>
                <Select value={editRole} onValueChange={(v) => setEditRole(v as UserRole)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin - Full access</SelectItem>
                    <SelectItem value="manager">Manager - Department management</SelectItem>
                    <SelectItem value="agent">Agent - Ticket handling</SelectItem>
                    <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <SettingsLabel>Primary Department</SettingsLabel>
                <Select value={editDept} onValueChange={setEditDept}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.filter(d => d.isActive).map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Custom Permissions Section */}
            <div className="border border-gray-200 rounded-lg">
              <button
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setShowPermissions(!showPermissions)}
              >
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-sm">Custom Permission Overrides</span>
                  {(editGrants.length > 0 || editRevokes.length > 0) && (
                    <Badge variant="outline" className="text-xs">
                      {editGrants.length + editRevokes.length} override{editGrants.length + editRevokes.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                {showPermissions ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {showPermissions && (
                <div className="px-4 pb-4 space-y-4">
                  <div className="flex items-start gap-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>
                      Custom overrides take priority over role defaults. <strong>Grant</strong> adds permissions beyond the role,
                      <strong> Revoke</strong> removes permissions the role normally has.
                    </span>
                  </div>

                  {['Viewing', 'Actions', 'Admin'].map(category => (
                    <div key={category}>
                      <h5 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">{category}</h5>
                      <div className="space-y-1">
                        {ALL_PERMISSIONS.filter(p => p.category === category).map(perm => {
                          const roleDefault = reads.getRoleDefaultPermission(editRole, perm.action);
                          const state = getPermissionState(perm.action);
                          const effective = getEffectivePermission(perm.action);

                          return (
                            <div
                              key={perm.action}
                              className={`flex items-center justify-between p-2 rounded border ${
                                state === 'granted' ? 'border-green-200 bg-green-50' :
                                state === 'revoked' ? 'border-red-200 bg-red-50' :
                                'border-gray-100 bg-white'
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">{perm.label}</span>
                                  <span className={`w-2 h-2 rounded-full ${effective ? 'bg-green-500' : 'bg-gray-300'}`} />
                                  {state !== 'default' && (
                                    <Badge className={`text-xs ${
                                      state === 'granted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                      {state === 'granted' ? 'Custom Grant' : 'Custom Revoke'}
                                    </Badge>
                                  )}
                                  {state === 'default' && (
                                    <span className="text-xs text-gray-400">
                                      {roleDefault ? 'Role default: allowed' : 'Role default: denied'}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{perm.description}</p>
                              </div>
                              <div className="flex items-center gap-1 ml-3 flex-shrink-0">
                                {!roleDefault && (
                                  <Button
                                    size="sm"
                                    variant={state === 'granted' ? 'default' : 'outline'}
                                    className={`h-7 text-xs px-2 ${state === 'granted' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                                    onClick={() => toggleGrant(perm.action)}
                                  >
                                    Grant
                                  </Button>
                                )}
                                {roleDefault && (
                                  <Button
                                    size="sm"
                                    variant={state === 'revoked' ? 'destructive' : 'outline'}
                                    className="h-7 text-xs px-2"
                                    onClick={() => toggleRevoke(perm.action)}
                                  >
                                    Revoke
                                  </Button>
                                )}
                                {state !== 'default' && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 text-xs px-2 text-gray-500"
                                    onClick={() => {
                                      setEditGrants(editGrants.filter(a => a !== perm.action));
                                      setEditRevokes(editRevokes.filter(a => a !== perm.action));
                                    }}
                                  >
                                    Reset
                                  </Button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingUserId(null)}>Cancel</Button>
            <Button onClick={handleUpdateUser}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SettingsLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={`block text-sm font-medium ${className}`}>{children}</label>;
}