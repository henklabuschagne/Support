import { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Switch } from './ui/switch';
import { Plus, Pencil, Trash2, FolderOpen, ChevronDown, ChevronRight, Layers, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'sonner';
import type { Category, CategoryType } from '../types';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981',
  '#14b8a6', '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6',
  '#a855f7', '#ec4899', '#dc2626', '#6b7280',
];

export function CategorySetup() {
  const { categories, tickets, reads, actions } = useAppStore('categories', 'tickets');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [isTypeDialogOpen, setIsTypeDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<CategoryType | null>(null);
  const [typeCategoryId, setTypeCategoryId] = useState<string>('');
  const [typeName, setTypeName] = useState('');
  const [typeColor, setTypeColor] = useState('');

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const isAdmin = reads.hasPermission('manage_departments');

  const getTicketCount = (catName: string) =>
    tickets.filter(t => t.category === catName).length;

  const getTypeTicketCount = (catName: string, tName: string) =>
    tickets.filter(t => t.category === catName && t.categoryType === tName).length;

  const toggleExpanded = (catId: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) next.delete(catId); else next.add(catId);
      return next;
    });
  };

  // ── Category CRUD ──────────────────────────

  const openCreateDialog = () => {
    setEditingCategory(null);
    setName(''); setColor('#3b82f6'); setDescription(''); setIsActive(true);
    setIsDialogOpen(true);
  };

  const openEditDialog = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name); setColor(cat.color);
    setDescription(cat.description || ''); setIsActive(cat.isActive);
    setIsDialogOpen(true);
  };

  const handleSaveCategory = async () => {
    if (!name.trim()) { toast.error('Category name is required'); return; }
    const duplicate = categories.find(
      c => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== editingCategory?.id
    );
    if (duplicate) { toast.error('A category with this name already exists'); return; }

    if (editingCategory) {
      const oldName = editingCategory.name;
      await actions.updateCategory(editingCategory.id, {
        name: name.trim(), color, description: description.trim() || undefined, isActive,
      });
      if (oldName !== name.trim()) {
        const affected = tickets.filter(t => t.category === oldName);
        for (const t of affected) await actions.updateTicket(t.id, { category: name.trim() });
        if (affected.length > 0) toast.success(`Updated ${affected.length} ticket(s) with new category name`);
      }
      toast.success('Category updated');
    } else {
      await actions.createCategory({ name: name.trim(), color, description: description.trim() || undefined, isActive, types: [] });
      toast.success('Category created');
    }
    setIsDialogOpen(false);
  };

  const handleDeleteCategory = async (cat: Category) => {
    const count = getTicketCount(cat.name);
    if (count > 0) { toast.error(`Cannot delete "${cat.name}" — ${count} ticket(s) use this category`); return; }
    const result = await actions.deleteCategory(cat.id);
    if (result.data) toast.success(`Category "${cat.name}" deleted`);
    else toast.error('Failed to delete category');
  };

  const handleToggleActive = async (cat: Category) => {
    await actions.updateCategory(cat.id, { isActive: !cat.isActive });
    toast.success(`Category "${cat.name}" ${cat.isActive ? 'deactivated' : 'activated'}`);
  };

  // ── Type CRUD ──────────────────────────────

  const openCreateTypeDialog = (categoryId: string) => {
    setTypeCategoryId(categoryId); setEditingType(null);
    setTypeName(''); setTypeColor(''); setIsTypeDialogOpen(true);
  };

  const openEditTypeDialog = (categoryId: string, type: CategoryType) => {
    setTypeCategoryId(categoryId); setEditingType(type);
    setTypeName(type.name); setTypeColor(type.color || '');
    setIsTypeDialogOpen(true);
  };

  const handleSaveType = async () => {
    if (!typeName.trim()) { toast.error('Type name is required'); return; }
    const cat = categories.find(c => c.id === typeCategoryId);
    if (!cat) return;
    const existingTypes = cat.types || [];
    const duplicate = existingTypes.find(
      t => t.name.toLowerCase() === typeName.trim().toLowerCase() && t.id !== editingType?.id
    );
    if (duplicate) { toast.error('A type with this name already exists in this category'); return; }

    if (editingType) {
      const oldTypeName = editingType.name;
      const updatedTypes = existingTypes.map(t =>
        t.id === editingType.id ? { ...t, name: typeName.trim(), color: typeColor || undefined } : t
      );
      await actions.updateCategory(typeCategoryId, { types: updatedTypes });
      if (oldTypeName !== typeName.trim()) {
        const affected = tickets.filter(t => t.category === cat.name && t.categoryType === oldTypeName);
        for (const t of affected) await actions.updateTicket(t.id, { categoryType: typeName.trim() });
        if (affected.length > 0) toast.success(`Updated ${affected.length} ticket(s) with new type name`);
      }
      toast.success('Type updated');
    } else {
      const newType: CategoryType = { id: `CT-${Date.now()}`, name: typeName.trim(), color: typeColor || undefined };
      await actions.updateCategory(typeCategoryId, { types: [...existingTypes, newType] });
      toast.success('Type added');
    }
    setIsTypeDialogOpen(false);
  };

  const handleDeleteType = async (categoryId: string, type: CategoryType) => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;
    const count = getTypeTicketCount(cat.name, type.name);
    if (count > 0) { toast.error(`Cannot delete "${type.name}" — ${count} ticket(s) use this type`); return; }
    const updatedTypes = (cat.types || []).filter(t => t.id !== type.id);
    await actions.updateCategory(categoryId, { types: updatedTypes });
    toast.success(`Type "${type.name}" deleted`);
  };

  // ── Type Reordering ────────────────────────

  const handleMoveType = async (categoryId: string, typeId: string, direction: 'up' | 'down') => {
    const cat = categories.find(c => c.id === categoryId);
    if (!cat) return;
    const types = [...(cat.types || [])];
    const index = types.findIndex(t => t.id === typeId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= types.length) return;
    [types[index], types[targetIndex]] = [types[targetIndex], types[index]];
    await actions.updateCategory(categoryId, { types });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderOpen className="w-5 h-5" />
                Categories & Types
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Manage ticket categories and their associated types. Expand a category to manage its types.
              </p>
            </div>
            {isAdmin && (
              <Button onClick={openCreateDialog}>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-0 divide-y divide-gray-100">
            {categories.map(cat => {
              const count = getTicketCount(cat.name);
              const isExpanded = expandedCategories.has(cat.id);
              const types = cat.types || [];

              return (
                <div key={cat.id}>
                  {/* Category Row */}
                  <div className="flex items-center gap-3 py-3.5 group">
                    <button
                      className="p-0.5 rounded hover:bg-muted transition-colors"
                      onClick={() => toggleExpanded(cat.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      )}
                    </button>

                    <div className="w-3.5 h-3.5 rounded-full flex-shrink-0" style={{ backgroundColor: cat.color }} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">{cat.name}</span>
                        {cat.isActive ? (
                          <Badge className="bg-brand-success-light text-brand-success border-0 text-xs">Active</Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground text-xs">Inactive</Badge>
                        )}
                      </div>
                      {cat.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{cat.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Layers className="w-3.5 h-3.5" />
                        {types.length} type{types.length !== 1 ? 's' : ''}
                      </div>
                      <Badge variant="outline" className="text-xs">{count} ticket{count !== 1 ? 's' : ''}</Badge>
                      {isAdmin && (
                        <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEditDialog(cat)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => handleToggleActive(cat)}>
                            {cat.isActive ? 'Deactivate' : 'Activate'}
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500 hover:text-red-700" onClick={() => handleDeleteCategory(cat)} disabled={count > 0}>
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Types Panel */}
                  {isExpanded && (
                    <div className="ml-9 pb-4">
                      <div className="bg-muted/50 rounded-lg border border-border p-3">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                            Types for {cat.name}
                          </h4>
                          {isAdmin && (
                            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openCreateTypeDialog(cat.id)}>
                              <Plus className="w-3 h-3 mr-1" /> Add Type
                            </Button>
                          )}
                        </div>

                        {types.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            No types defined yet. Add types to create subcategories.
                          </p>
                        ) : (
                          <div className="space-y-1">
                            {types.map((type, idx) => {
                              const typeCount = getTypeTicketCount(cat.name, type.name);
                              const displayColor = type.color || cat.color;
                              return (
                                <div
                                  key={type.id}
                                  className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-card transition-colors group/type"
                                >
                                  {/* Reorder controls */}
                                  {isAdmin && types.length > 1 && (
                                    <div className="flex flex-col gap-0">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-5 p-0 text-gray-400 hover:text-gray-700"
                                        onClick={() => handleMoveType(cat.id, type.id, 'up')}
                                        disabled={idx === 0}
                                      >
                                        <ArrowUp className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-4 w-5 p-0 text-gray-400 hover:text-gray-700"
                                        onClick={() => handleMoveType(cat.id, type.id, 'down')}
                                        disabled={idx === types.length - 1}
                                      >
                                        <ArrowDown className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                  <div
                                    className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                                    style={{ backgroundColor: displayColor }}
                                  />
                                  <span className="flex-1 text-sm text-foreground/90">{type.name}</span>
                                  <span className="text-xs text-muted-foreground tabular-nums">#{idx + 1}</span>
                                  <Badge variant="outline" className="text-xs">{typeCount}</Badge>
                                  {isAdmin && (
                                    <div className="flex gap-0.5 opacity-0 group-hover/type:opacity-100 transition-opacity">
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => openEditTypeDialog(cat.id, type)}>
                                        <Pencil className="w-3 h-3" />
                                      </Button>
                                      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500 hover:text-red-700" onClick={() => handleDeleteType(cat.id, type)} disabled={typeCount > 0}>
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {categories.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <FolderOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
                <p>No categories configured yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Edit Category' : 'Create Category'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="cat-name">Name *</Label>
              <Input id="cat-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Technical Issue" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="cat-desc">Description</Label>
              <Input id="cat-desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Brief description of this category" className="mt-1" />
            </div>
            <div>
              <Label>Color</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {PRESET_COLORS.map(c => (
                  <button key={c} type="button" className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} onClick={() => setColor(c)} />
                ))}
                <Input type="color" value={color} onChange={e => setColor(e.target.value)} className="w-7 h-7 p-0 border-0 cursor-pointer" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={isActive} onCheckedChange={setIsActive} />
              <Label>Active</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCategory}>{editingCategory ? 'Save Changes' : 'Create Category'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Type Dialog */}
      <Dialog open={isTypeDialogOpen} onOpenChange={setIsTypeDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingType ? 'Edit Type' : 'Add Type'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-gray-500">
              Category: <span className="font-medium text-gray-800">{categories.find(c => c.id === typeCategoryId)?.name}</span>
            </p>
            <div>
              <Label htmlFor="type-name">Type Name *</Label>
              <Input id="type-name" value={typeName} onChange={e => setTypeName(e.target.value)} placeholder="e.g., Bug, Crash, Configuration Error" className="mt-1" />
            </div>
            <div>
              <Label>Color Override <span className="text-xs text-gray-400">(optional, inherits from category)</span></Label>
              <div className="flex flex-wrap gap-2 mt-2 items-center">
                <button
                  type="button"
                  className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center text-xs ${!typeColor ? 'border-gray-900 scale-110 bg-gray-100' : 'border-transparent hover:scale-105 bg-gray-50'}`}
                  onClick={() => setTypeColor('')}
                  title="Inherit from category"
                >
                  <span className="text-gray-500">-</span>
                </button>
                {PRESET_COLORS.slice(0, 8).map(c => (
                  <button key={c} type="button" className={`w-7 h-7 rounded-full border-2 transition-all ${typeColor === c ? 'border-gray-900 scale-110' : 'border-transparent hover:scale-105'}`} style={{ backgroundColor: c }} onClick={() => setTypeColor(c)} />
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTypeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveType}>{editingType ? 'Save Changes' : 'Add Type'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}