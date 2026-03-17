import { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Pencil, Trash2, Users, Ticket, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import type { Department } from '../types';

export function DepartmentSetup() {
  const { departments, users, tickets, reads, actions } = useAppStore('departments', 'users', 'tickets');
  const canManage = reads.hasPermission('manage_departments');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formColor, setFormColor] = useState('#3b82f6');
  const [formManager, setFormManager] = useState('__none__');
  const [formIsActive, setFormIsActive] = useState(true);

  const resetForm = () => {
    setFormName('');
    setFormDescription('');
    setFormColor('#3b82f6');
    setFormManager('__none__');
    setFormIsActive(true);
  };

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEdit = (dept: Department) => {
    setFormName(dept.name);
    setFormDescription(dept.description || '');
    setFormColor(dept.color);
    setFormManager(dept.managerId || '__none__');
    setFormIsActive(dept.isActive);
    setEditingDept(dept);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast.error('Department name is required');
      return;
    }

    const data = {
      name: formName.trim(),
      description: formDescription.trim() || undefined,
      color: formColor,
      managerId: formManager !== '__none__' ? formManager : undefined,
      isActive: formIsActive,
    };

    if (editingDept) {
      const result = await actions.updateDepartment(editingDept.id, data);
      if (result.success) {
        toast.success('Department updated');
        setEditingDept(null);
      } else {
        toast.error('Failed to update department');
      }
    } else {
      const result = await actions.createDepartment(data as Omit<Department, 'id'>);
      if (result.success) {
        toast.success('Department created');
        setIsCreateOpen(false);
      } else {
        toast.error('Failed to create department');
      }
    }
    resetForm();
  };

  const handleDelete = async (id: string) => {
    const result = await actions.deleteDepartment(id);
    if (result.success) {
      toast.success('Department deleted');
    } else {
      toast.error('Cannot delete department with active tickets');
    }
    setDeleteConfirm(null);
  };

  const getDeptStats = (deptId: string) => {
    const deptTickets = tickets.filter(t => t.departmentId === deptId);
    const deptUsers = users.filter(u => u.department === deptId || u.departments?.includes(deptId));
    const openCount = deptTickets.filter(t => t.status !== 'closed' && t.status !== 'resolved').length;
    return { totalTickets: deptTickets.length, openTickets: openCount, agents: deptUsers.length };
  };

  const colorPresets = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#ef4444', '#06b6d4', '#84cc16', '#f97316', '#6366f1'];

  const formDialog = (
    <Dialog
      open={isCreateOpen || !!editingDept}
      onOpenChange={(open) => {
        if (!open) {
          setIsCreateOpen(false);
          setEditingDept(null);
          resetForm();
        }
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingDept ? 'Edit Department' : 'Create Department'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="dept-name">Name *</Label>
            <Input
              id="dept-name"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g., Technical Support"
            />
          </div>
          <div>
            <Label htmlFor="dept-desc">Description</Label>
            <Textarea
              id="dept-desc"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="What this department handles..."
              rows={2}
            />
          </div>
          <div>
            <Label>Color</Label>
            <div className="flex items-center gap-2 mt-2">
              {colorPresets.map(c => (
                <button
                  key={c}
                  type="button"
                  className={`w-7 h-7 rounded-full border-2 transition-all ${formColor === c ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setFormColor(c)}
                />
              ))}
              <Input
                type="color"
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                className="w-10 h-8 p-0 border-0 cursor-pointer"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="dept-manager">Department Manager</Label>
            <Select value={formManager} onValueChange={setFormManager}>
              <SelectTrigger>
                <SelectValue placeholder="Select manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">No Manager</SelectItem>
                {users.filter(u => u.role === 'admin' || u.role === 'manager').map(u => (
                  <SelectItem key={u.id} value={u.id}>{u.name} ({u.role})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label>Active</Label>
              <p className="text-xs text-gray-500">Inactive departments won't receive new tickets</p>
            </div>
            <Switch checked={formIsActive} onCheckedChange={setFormIsActive} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setIsCreateOpen(false); setEditingDept(null); resetForm(); }}>Cancel</Button>
          <Button onClick={handleSave}>{editingDept ? 'Update' : 'Create'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Department Management</CardTitle>
            {canManage && (
              <Button onClick={openCreate}>
                <Plus className="w-4 h-4 mr-2" />
                Add Department
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead>Agents</TableHead>
                <TableHead>Open Tickets</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departments.map(dept => {
                const stats = getDeptStats(dept.id);
                const manager = dept.managerId ? reads.getUserById(dept.managerId) : null;
                return (
                  <TableRow key={dept.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                        <span className="font-medium">{dept.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                      {dept.description || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {manager?.name || '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        {stats.agents}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Ticket className="w-3.5 h-3.5 text-gray-400" />
                        <span>{stats.openTickets}</span>
                        <span className="text-gray-400">/ {stats.totalTickets}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {dept.isActive ? (
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {canManage ? (
                        <div className="flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(dept)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => setDeleteConfirm(dept.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {formDialog}

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              Delete Department
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-4">
            Are you sure you want to delete this department? This action cannot be undone.
            Departments with active tickets cannot be deleted.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}