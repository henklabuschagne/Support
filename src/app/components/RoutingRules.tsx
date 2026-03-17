import { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Pencil, Trash2, ArrowRight, Zap, Play, TestTube2, Mail, AlertTriangle, Layers } from 'lucide-react';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import type { DepartmentRoutingRule, TicketPriority } from '../types';

const PRIORITY_OPTIONS: { value: TicketPriority; label: string; color: string }[] = [
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'medium', label: 'Medium', color: 'bg-blue-100 text-blue-800' },
  { value: 'low', label: 'Low', color: 'bg-gray-100 text-gray-800' },
];

export function RoutingRules() {
  const { routingRules, departments, users, categories, tags: allTags, reads, actions } = useAppStore('routingRules', 'departments', 'users', 'categories', 'tags');
  const canManage = reads.hasPermission('manage_routing');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<DepartmentRoutingRule | null>(null);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [testSubject, setTestSubject] = useState('');
  const [testDescription, setTestDescription] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [testPriority, setTestPriority] = useState<string>('__none__');
  const [testCategory, setTestCategory] = useState('');
  const [testCategoryType, setTestCategoryType] = useState('');
  const [testResult, setTestResult] = useState<{ departmentId: string; autoAssignTo?: string } | null | undefined>(undefined);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDepartmentId, setFormDepartmentId] = useState('');
  const [formIsActive, setFormIsActive] = useState(true);
  const [formPriority, setFormPriority] = useState(10);
  const [formKeywords, setFormKeywords] = useState('');
  const [formCategories, setFormCategories] = useState('');
  const [formCategoryTypes, setFormCategoryTypes] = useState('');
  const [formEmailDomains, setFormEmailDomains] = useState('');
  const [formPriorityLevels, setFormPriorityLevels] = useState<TicketPriority[]>([]);
  const [formAutoAssign, setFormAutoAssign] = useState('__none__');

  const resetForm = () => {
    setFormName('');
    setFormDepartmentId('');
    setFormIsActive(true);
    setFormPriority(10);
    setFormKeywords('');
    setFormCategories('');
    setFormCategoryTypes('');
    setFormEmailDomains('');
    setFormPriorityLevels([]);
    setFormAutoAssign('__none__');
  };

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = (rule: DepartmentRoutingRule) => {
    setFormName(rule.name);
    setFormDepartmentId(rule.departmentId);
    setFormIsActive(rule.isActive);
    setFormPriority(rule.priority);
    setFormKeywords(rule.conditions.keywords?.join(', ') || '');
    setFormCategories(rule.conditions.categories?.join(', ') || '');
    setFormCategoryTypes(rule.conditions.categoryTypes?.join(', ') || '');
    setFormEmailDomains(rule.conditions.emailDomains?.join(', ') || '');
    setFormPriorityLevels(rule.conditions.priorityLevels || []);
    setFormAutoAssign(rule.autoAssignTo || '__none__');
    setEditingRule(rule);
  };

  const togglePriorityLevel = (p: TicketPriority) => {
    setFormPriorityLevels(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]
    );
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Rule name is required');
      return;
    }
    if (!formDepartmentId) {
      toast.error('Target department is required');
      return;
    }

    const keywords = formKeywords.split(',').map(k => k.trim()).filter(Boolean);
    const categories = formCategories.split(',').map(c => c.trim()).filter(Boolean);
    const categoryTypes = formCategoryTypes.split(',').map(ct => ct.trim()).filter(Boolean);
    const emailDomains = formEmailDomains.split(',').map(d => d.trim().toLowerCase()).filter(Boolean);

    if (keywords.length === 0 && categories.length === 0 && categoryTypes.length === 0 && emailDomains.length === 0 && formPriorityLevels.length === 0) {
      toast.error('At least one condition is required (keyword, category, category type, email domain, or priority level)');
      return;
    }

    const data = {
      name: formName.trim(),
      departmentId: formDepartmentId,
      isActive: formIsActive,
      priority: formPriority,
      conditions: {
        keywords: keywords.length > 0 ? keywords : undefined,
        categories: categories.length > 0 ? categories : undefined,
        categoryTypes: categoryTypes.length > 0 ? categoryTypes : undefined,
        emailDomains: emailDomains.length > 0 ? emailDomains : undefined,
        priorityLevels: formPriorityLevels.length > 0 ? formPriorityLevels : undefined,
      },
      autoAssignTo: formAutoAssign !== '__none__' ? formAutoAssign : undefined,
    };

    if (editingRule) {
      const result = await actions.updateRoutingRule(editingRule.id, data);
      if (result.success) {
        toast.success('Routing rule updated');
        setEditingRule(null);
      }
    } else {
      const result = await actions.createRoutingRule(data as Omit<DepartmentRoutingRule, 'id'>);
      if (result.success) {
        toast.success('Routing rule created');
        setIsCreateOpen(false);
      }
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const result = await actions.deleteRoutingRule(id);
    if (result.success) {
      toast.success('Routing rule deleted');
    }
  };

  const handleToggleActive = async (rule: DepartmentRoutingRule) => {
    await actions.updateRoutingRule(rule.id, { isActive: !rule.isActive });
    toast.success(`Rule ${!rule.isActive ? 'enabled' : 'disabled'}`);
  };

  const handleTest = async () => {
    if (!testSubject.trim() && !testDescription.trim() && !testEmail.trim() && testPriority === '__none__' && !testCategory.trim() && !testCategoryType.trim()) {
      toast.error('Enter at least one test parameter');
      return;
    }
    const result = await actions.evaluateRouting(
      testSubject,
      testDescription,
      testCategory || undefined,
      undefined,
      testEmail || undefined,
      testPriority !== '__none__' ? testPriority : undefined,
      testCategoryType || undefined,
    );
    if (result.success) {
      setTestResult(result.data);
    }
  };

  const activeDepts = departments.filter(d => d.isActive);
  const sortedRules = [...routingRules].sort((a, b) => a.priority - b.priority);

  const getConditionBadges = (rule: DepartmentRoutingRule) => {
    const badges: JSX.Element[] = [];

    if (rule.conditions.keywords && rule.conditions.keywords.length > 0) {
      badges.push(
        <div key="kw" className="flex flex-wrap gap-1">
          {rule.conditions.keywords.slice(0, 3).map(kw => (
            <Badge key={kw} variant="outline" className="text-xs">{kw}</Badge>
          ))}
          {rule.conditions.keywords.length > 3 && (
            <Badge variant="outline" className="text-xs">+{rule.conditions.keywords.length - 3}</Badge>
          )}
        </div>
      );
    }

    if (rule.conditions.categories && rule.conditions.categories.length > 0) {
      badges.push(
        <div key="cat" className="flex flex-wrap gap-1">
          {rule.conditions.categories.map(cat => (
            <Badge key={cat} className="text-xs bg-purple-100 text-purple-800">{cat}</Badge>
          ))}
        </div>
      );
    }

    if (rule.conditions.categoryTypes && rule.conditions.categoryTypes.length > 0) {
      badges.push(
        <div key="catType" className="flex flex-wrap gap-1">
          {rule.conditions.categoryTypes.map(catType => (
            <Badge key={catType} className="text-xs bg-indigo-100 text-indigo-800 gap-0.5">
              <Layers className="w-2.5 h-2.5" />
              {catType}
            </Badge>
          ))}
        </div>
      );
    }

    if (rule.conditions.emailDomains && rule.conditions.emailDomains.length > 0) {
      badges.push(
        <div key="email" className="flex flex-wrap gap-1">
          {rule.conditions.emailDomains.map(domain => (
            <Badge key={domain} className="text-xs bg-cyan-100 text-cyan-800 gap-0.5">
              <Mail className="w-2.5 h-2.5" />
              @{domain}
            </Badge>
          ))}
        </div>
      );
    }

    if (rule.conditions.priorityLevels && rule.conditions.priorityLevels.length > 0) {
      badges.push(
        <div key="priority" className="flex flex-wrap gap-1">
          {rule.conditions.priorityLevels.map(p => {
            const opt = PRIORITY_OPTIONS.find(o => o.value === p);
            return (
              <Badge key={p} className={`text-xs ${opt?.color || ''} gap-0.5`}>
                <AlertTriangle className="w-2.5 h-2.5" />
                {opt?.label || p}
              </Badge>
            );
          })}
        </div>
      );
    }

    return badges;
  };

  const formDialog = (
    <Dialog
      open={isCreateOpen || !!editingRule}
      onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingRule(null);
          resetForm();
        }
      }}
    >
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingRule ? 'Edit Routing Rule' : 'Create Routing Rule'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Rule Name *</Label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., Route bugs to Technical Support"
            />
          </div>
          <div>
            <Label>Target Department *</Label>
            <Select value={formDepartmentId} onValueChange={setFormDepartmentId}>
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                {activeDepts.map(dept => (
                  <SelectItem key={dept.id} value={dept.id}>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                      {dept.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Conditions Section */}
          <div className="border-t border-gray-100 pt-4">
            <h4 className="text-sm font-medium text-foreground/80 mb-3">Conditions (at least one required)</h4>

            <div className="space-y-4">
              <div>
                <Label>Keywords (comma-separated)</Label>
                <Textarea
                  value={formKeywords}
                  onChange={(e) => setFormKeywords(e.target.value)}
                  placeholder="bug, error, crash, not working"
                  rows={2}
                />
                <p className="text-xs text-muted-foreground mt-1">Matches in subject or description</p>
              </div>

              <div>
                <Label>Categories (comma-separated)</Label>
                <Input
                  value={formCategories}
                  onChange={(e) => setFormCategories(e.target.value)}
                  placeholder="Technical Issue, Bug Report"
                />
              </div>

              <div>
                <Label>Category Types (comma-separated)</Label>
                <Input
                  value={formCategoryTypes}
                  onChange={(e) => setFormCategoryTypes(e.target.value)}
                  placeholder="Support, Development"
                />
              </div>

              <div>
                <Label className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-600" />
                  Email Domains (comma-separated)
                </Label>
                <Input
                  value={formEmailDomains}
                  onChange={(e) => setFormEmailDomains(e.target.value)}
                  placeholder="acmecorp.com, bigenterprise.com"
                />
                <p className="text-xs text-muted-foreground mt-1">Match customer email domain (e.g., tickets from @acmecorp.com)</p>
              </div>

              <div>
                <Label className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                  Priority Levels
                </Label>
                <div className="flex flex-wrap gap-3 mt-2">
                  {PRIORITY_OPTIONS.map(opt => (
                    <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formPriorityLevels.includes(opt.value)}
                        onCheckedChange={() => togglePriorityLevel(opt.value)}
                      />
                      <Badge className={`${opt.color} text-xs`}>{opt.label}</Badge>
                    </label>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Route tickets matching these priority levels</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Evaluation Order (lower = first)</Label>
              <Input
                type="number"
                value={formPriority}
                onChange={(e) => setFormPriority(parseInt(e.target.value) || 0)}
                min={0}
                max={100}
              />
            </div>
            <div>
              <Label>Auto-Assign Agent</Label>
              <Select value={formAutoAssign} onValueChange={setFormAutoAssign}>
                <SelectTrigger>
                  <SelectValue placeholder="No auto-assign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No auto-assign</SelectItem>
                  {formDepartmentId && users
                    .filter(u => u.department === formDepartmentId || u.departments?.includes(formDepartmentId))
                    .map(u => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Active</Label>
              <p className="text-xs text-muted-foreground">Inactive rules won't be evaluated</p>
            </div>
            <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setIsCreateOpen(false); setEditingRule(null); resetForm(); }}>Cancel</Button>
          <Button onClick={handleSave}>{editingRule ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Department Routing Rules</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Define rules that automatically route tickets based on content, email domain, and priority
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsTestOpen(true)}>
                <TestTube2 className="w-4 h-4 mr-2" />
                Test Rules
              </Button>
              {canManage && (
                <Button onClick={openCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Rule
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {sortedRules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Zap className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
              <p>No routing rules configured</p>
              <p className="text-sm mt-1">Create rules to automatically route tickets to departments</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Order</TableHead>
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Conditions</TableHead>
                  <TableHead>Routes To</TableHead>
                  <TableHead>Auto-Assign</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedRules.map(rule => {
                  const dept = reads.getDepartmentById(rule.departmentId);
                  const assignee = rule.autoAssignTo ? reads.getUserById(rule.autoAssignTo) : null;
                  const conditionBadges = getConditionBadges(rule);

                  return (
                    <TableRow key={rule.id} className={!rule.isActive ? 'opacity-50' : ''}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono">{rule.priority}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{rule.name}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {conditionBadges.length > 0 ? conditionBadges : (
                            <span className="text-xs text-gray-400">No conditions</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {dept && (
                          <div className="flex items-center gap-2">
                            <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dept.color }} />
                            <span className="text-sm">{dept.name}</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {assignee?.name || '—'}
                      </TableCell>
                      <TableCell>
                        {canManage && (
                          <Switch
                            checked={rule.isActive}
                            onCheckedChange={() => handleToggleActive(rule)}
                          />
                        )}
                        {!canManage && (
                          <Badge variant={rule.isActive ? 'default' : 'outline'}>
                            {rule.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {canManage && (
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm" onClick={() => openEdit(rule)}>
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleDelete(rule.id)}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {formDialog}

      {/* Test Rules Dialog */}
      <Dialog open={isTestOpen} onOpenChange={(open) => { setIsTestOpen(open); if (!open) { setTestResult(undefined); setTestSubject(''); setTestDescription(''); setTestEmail(''); setTestPriority('__none__'); setTestCategory(''); setTestCategoryType(''); } }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TestTube2 className="w-5 h-5" />
              Test Routing Rules
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Enter sample ticket parameters to see which department it would be routed to.</p>
            <div>
              <Label>Subject</Label>
              <Input
                value={testSubject}
                onChange={(e) => setTestSubject(e.target.value)}
                placeholder="e.g., Login page shows error 500"
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                value={testDescription}
                onChange={(e) => setTestDescription(e.target.value)}
                placeholder="e.g., When I try to login, I get a blank page..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-cyan-600" />
                  Customer Email
                </Label>
                <Input
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="john@acmecorp.com"
                />
              </div>
              <div>
                <Label className="flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
                  Priority Level
                </Label>
                <Select value={testPriority} onValueChange={setTestPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">Not specified</SelectItem>
                    {PRIORITY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Input
                  value={testCategory}
                  onChange={(e) => setTestCategory(e.target.value)}
                  placeholder="Technical Issue, Bug Report"
                />
              </div>
              <div>
                <Label>Category Type</Label>
                <Input
                  value={testCategoryType}
                  onChange={(e) => setTestCategoryType(e.target.value)}
                  placeholder="Support, Development"
                />
              </div>
            </div>
            <Button onClick={handleTest} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              Run Test
            </Button>
            {testResult !== undefined && (
              <div className={`p-4 rounded-lg border ${testResult ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                {testResult ? (
                  <div>
                    <p className="font-medium text-green-800">Match found!</p>
                    <div className="flex items-center gap-2 mt-2">
                      <ArrowRight className="w-4 h-4 text-green-600" />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: reads.getDepartmentById(testResult.departmentId)?.color }} />
                      <span className="font-medium">{reads.getDepartmentName(testResult.departmentId)}</span>
                    </div>
                    {testResult.autoAssignTo && (
                      <p className="text-sm text-green-700 mt-1">
                        Auto-assign to: {reads.getUserName(testResult.autoAssignTo)}
                      </p>
                    )}
                  </div>
                ) : (
                  <div>
                    <p className="font-medium text-yellow-800">No matching rule found</p>
                    <p className="text-sm text-yellow-700 mt-1">This ticket would use the default department selection</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}