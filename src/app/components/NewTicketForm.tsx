import { useForm } from 'react-hook-form';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { useAppStore } from '../hooks/useAppStore';
import { TicketPriority } from '../types';
import { Checkbox } from './ui/checkbox';
import { useState, useEffect, useCallback } from 'react';
import { Zap, ArrowRight, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface TicketFormData {
  subject: string;
  description: string;
  priority: TicketPriority;
  departmentId: string;
  assignedTo?: string;
}

export function NewTicketForm({ onSuccess }: { onSuccess: () => void }) {
  const { departments, users, tags: allTags, categories, currentUserId, reads, actions } = useAppStore('tickets', 'routingRules', 'currentUser', 'categories', 'departments', 'users', 'tags');
  const { register, handleSubmit, watch, formState: { errors } } = useForm<TicketFormData>();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedPriority, setSelectedPriority] = useState<TicketPriority>('medium');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('1');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedCategoryType, setSelectedCategoryType] = useState<string>('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewType, setShowNewType] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [routingSuggestion, setRoutingSuggestion] = useState<{ departmentId: string; autoAssignTo?: string } | null>(null);
  const [autoRouteApplied, setAutoRouteApplied] = useState(false);

  const subject = watch('subject', '');
  const description = watch('description', '');

  const activeCategories = categories.filter(c => c.isActive);

  // Get types for the selected category
  const selectedCategoryObj = activeCategories.find(c => c.name === selectedCategory);
  const availableTypes = selectedCategoryObj?.types || [];

  // Debounced routing evaluation
  useEffect(() => {
    if (autoRouteApplied) return;

    const timeout = setTimeout(() => {
      if (subject.length > 3 || description.length > 10) {
        const result = reads.evaluateRoutingRules(subject, description, selectedCategory || undefined, selectedTags, undefined, selectedPriority, selectedCategoryType || undefined);
        setRoutingSuggestion(result);
      } else {
        setRoutingSuggestion(null);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [subject, description, selectedTags, selectedPriority, selectedCategory, selectedCategoryType, reads, autoRouteApplied]);

  const applyRoutingSuggestion = () => {
    if (!routingSuggestion) return;
    setSelectedDepartment(routingSuggestion.departmentId);
    if (routingSuggestion.autoAssignTo) {
      setSelectedAssignee(routingSuggestion.autoAssignTo);
    }
    setAutoRouteApplied(true);
    toast.success('Auto-routing applied');
  };

  const onSubmit = (data: TicketFormData) => {
    actions.createTicket({
      subject: data.subject,
      description: data.description,
      priority: selectedPriority,
      departmentId: selectedDepartment,
      assignedTo: selectedAssignee && selectedAssignee !== '__none__' ? selectedAssignee : undefined,
      category: selectedCategory || undefined,
      categoryType: selectedCategoryType || undefined,
      status: 'open',
      createdBy: currentUserId,
      tags: selectedTags,
    });
    onSuccess();
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
    setAutoRouteApplied(false); // Re-evaluate routing when tags change
  };

  const activeDepts = departments.filter(d => d.isActive);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <Label htmlFor="subject">Subject *</Label>
        <Input
          id="subject"
          {...register('subject', { required: 'Subject is required' })}
          placeholder="Brief description of the issue"
        />
        {errors.subject && (
          <p className="text-sm text-destructive mt-1">{errors.subject.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          {...register('description', { required: 'Description is required' })}
          placeholder="Detailed description of the issue"
          rows={4}
        />
        {errors.description && (
          <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* Auto-Routing Suggestion */}
      {routingSuggestion && !autoRouteApplied && (
        <div className="flex items-center gap-3 p-3 bg-brand-primary-light border border-brand-secondary rounded-lg">
          <Zap className="w-5 h-5 text-brand-primary flex-shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-brand-main">Smart Routing Suggestion</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <ArrowRight className="w-3.5 h-3.5 text-brand-primary" />
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: reads.getDepartmentById(routingSuggestion.departmentId)?.color }}
              />
              <span className="text-sm text-brand-primary">
                {reads.getDepartmentName(routingSuggestion.departmentId)}
              </span>
              {routingSuggestion.autoAssignTo && (
                <span className="text-sm text-brand-primary">
                  → {reads.getUserName(routingSuggestion.autoAssignTo)}
                </span>
              )}
            </div>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={applyRoutingSuggestion}
            className="text-brand-primary border-brand-secondary hover:bg-brand-primary-light"
          >
            Apply
          </Button>
        </div>
      )}

      {autoRouteApplied && (
        <div className="flex items-center gap-2 p-2 bg-brand-success-light border border-brand-success-mid rounded-lg">
          <Zap className="w-4 h-4 text-brand-success" />
          <span className="text-sm text-brand-success">Auto-routing applied</span>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="text-brand-success h-6 text-xs"
            onClick={() => setAutoRouteApplied(false)}
          >
            Revert
          </Button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priority">Priority *</Label>
          <Select value={selectedPriority} onValueChange={(value) => setSelectedPriority(value as TicketPriority)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="category">Category</Label>
          {showNewCategory ? (
            <div className="flex gap-2 mt-1">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={async () => {
                  if (!newCategoryName.trim()) return;
                  const result = await actions.createCategory({
                    name: newCategoryName.trim(),
                    color: '#3b82f6',
                    isActive: true,
                  });
                  if (result.data) {
                    setSelectedCategory(result.data.name);
                    setSelectedCategoryType('');
                    toast.success(`Category "${result.data.name}" created`);
                  }
                  setNewCategoryName('');
                  setShowNewCategory(false);
                }}
              >
                Add
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setShowNewCategory(false); setNewCategoryName(''); }}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Select value={selectedCategory} onValueChange={(v) => { const val = v === '__none__' ? '' : v; setSelectedCategory(val); setSelectedCategoryType(''); setAutoRouteApplied(false); }}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {activeCategories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                          {cat.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" size="sm" variant="outline" className="mb-0" onClick={() => setShowNewCategory(true)}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Category Type - appears when category is selected and has types */}
      {selectedCategory && availableTypes.length > 0 && (
        <div>
          <Label htmlFor="categoryType">Type</Label>
          {showNewType ? (
            <div className="flex gap-2 mt-1">
              <Input
                value={newTypeName}
                onChange={(e) => setNewTypeName(e.target.value)}
                placeholder="New type name"
                className="flex-1"
              />
              <Button
                type="button"
                size="sm"
                onClick={async () => {
                  if (!newTypeName.trim() || !selectedCategoryObj) return;
                  const newType = { id: `CT-${Date.now()}`, name: newTypeName.trim() };
                  await actions.updateCategory(selectedCategoryObj.id, {
                    types: [...availableTypes, newType],
                  });
                  setSelectedCategoryType(newType.name);
                  toast.success(`Type "${newType.name}" added`);
                  setNewTypeName('');
                  setShowNewType(false);
                }}
              >
                Add
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setShowNewType(false); setNewTypeName(''); }}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Select value={selectedCategoryType} onValueChange={(v) => setSelectedCategoryType(v === '__none__' ? '' : v)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">None</SelectItem>
                    {availableTypes.map(type => (
                      <SelectItem key={type.id} value={type.name}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: type.color || selectedCategoryObj?.color }} />
                          {type.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button type="button" size="sm" variant="outline" className="mb-0" onClick={() => setShowNewType(true)}>
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="department">Department *</Label>
          <Select
            value={selectedDepartment}
            onValueChange={(v) => {
              setSelectedDepartment(v);
              setSelectedAssignee('');
              setAutoRouteApplied(false);
            }}
          >
            <SelectTrigger>
              <SelectValue />
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

        <div>
          <Label htmlFor="assignee">Assign To</Label>
          <Select value={selectedAssignee} onValueChange={setSelectedAssignee}>
            <SelectTrigger>
              <SelectValue placeholder="Unassigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Unassigned</SelectItem>
              {users.filter(u => u.department === selectedDepartment || u.departments?.includes(selectedDepartment)).map(user => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {allTags.map(tag => (
            <div key={tag.id} className="flex items-center">
              <Checkbox
                id={`tag-${tag.id}`}
                checked={selectedTags.includes(tag.id)}
                onCheckedChange={() => toggleTag(tag.id)}
              />
              <label
                htmlFor={`tag-${tag.id}`}
                className="ml-2 text-sm cursor-pointer px-2 py-1 rounded"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.name}
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onSuccess}>
          Cancel
        </Button>
        <Button type="submit">Create Ticket</Button>
      </div>
    </form>
  );
}