import { useState, useMemo } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Link } from 'react-router';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Checkbox } from '../components/ui/checkbox';
import { Switch } from '../components/ui/switch';
import { Search, Download, Save, PanelLeftClose, PanelLeft, X, Filter, Eye, EyeOff } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { BulkActions } from '../components/BulkActions';
import { SLAIndicator } from '../components/SLAIndicator';
import { SavedViewsPanel } from '../components/SavedViewsPanel';
import { MultiSelect, type MultiSelectOption } from '../components/MultiSelect';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import type { SavedFilter, TicketStatus, TicketPriority } from '../types';

export function TicketsEnhanced() {
  const { tickets, slas, savedFilters, departments, users, tags: allTags, categories, currentUser, currentUserId, reads, actions } = useAppStore('tickets', 'savedFilters', 'currentUser', 'categories', 'departments', 'users', 'tags', 'slas');

  // Multi-value filter state (arrays instead of single strings)
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [departmentFilters, setDepartmentFilters] = useState<string[]>([]);
  const [priorityFilters, setPriorityFilters] = useState<string[]>([]);
  const [assignedToFilters, setAssignedToFilters] = useState<string[]>([]);
  const [tagFilters, setTagFilters] = useState<string[]>([]);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [categoryTypeFilters, setCategoryTypeFilters] = useState<string[]>([]);
  const [selectedTickets, setSelectedTickets] = useState<Set<string>>(new Set());
  const [isSaveFilterOpen, setIsSaveFilterOpen] = useState(false);
  const [filterName, setFilterName] = useState('');
  const [filterIsShared, setFilterIsShared] = useState(false);
  const [showViewsPanel, setShowViewsPanel] = useState(true);
  const [activeFilterId, setActiveFilterId] = useState<string | undefined>(undefined);
  const [showAllTickets, setShowAllTickets] = useState(false);

  // Role-based access
  const canViewAll = reads.hasPermission('view_all');
  const canBulkAction = reads.hasPermission('bulk_actions');
  const canCreateTickets = reads.hasPermission('create_tickets');
  const isRestricted = !canViewAll && !showAllTickets;

  const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || 'Unknown';
  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unassigned';

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-brand-primary-light text-brand-primary',
      'in-progress': 'bg-brand-warning-light text-brand-warning',
      pending: 'bg-brand-warning-light text-brand-warning',
      resolved: 'bg-brand-success-light text-brand-success',
      closed: 'bg-secondary text-muted-foreground',
    };
    return colors[status as keyof typeof colors] || 'bg-secondary text-muted-foreground';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-secondary text-muted-foreground',
      medium: 'bg-brand-primary-light text-brand-primary',
      high: 'bg-brand-warning-light text-brand-warning',
      urgent: 'bg-brand-error-light text-brand-error',
    };
    return colors[priority as keyof typeof colors] || 'bg-secondary text-muted-foreground';
  };

  // Build options for multi-selects
  const statusOptions: MultiSelectOption[] = [
    { value: 'open', label: 'Open' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'pending', label: 'Pending' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'closed', label: 'Closed' },
  ];

  const priorityOptions: MultiSelectOption[] = [
    { value: 'urgent', label: 'Urgent' },
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  const departmentOptions: MultiSelectOption[] = departments
    .filter(d => d.isActive)
    .map(d => ({ value: d.id, label: d.name, color: d.color }));

  const assigneeOptions: MultiSelectOption[] = users.map(u => ({
    value: u.id,
    label: u.name,
  }));

  const tagOptions: MultiSelectOption[] = allTags.map(t => ({
    value: t.id,
    label: t.name,
    color: t.color,
  }));

  const categoryOptions: MultiSelectOption[] = categories.map(c => ({
    value: c.id,
    label: c.name,
    color: c.color,
  }));

  // Dependent type options: show types from selected categories, or all types if no category filter
  const categoryTypeOptions: MultiSelectOption[] = useMemo(() => {
    const opts: MultiSelectOption[] = [];
    const relevantCategories = categoryFilters.length > 0
      ? categories.filter(c => categoryFilters.includes(c.id))
      : categories;
    relevantCategories.forEach(cat => {
      (cat.types || []).forEach(type => {
        // Use "catId::typeName" as value to ensure uniqueness across categories
        const key = `${cat.id}::${type.name}`;
        if (!opts.some(o => o.value === key)) {
          opts.push({
            value: key,
            label: categoryFilters.length > 0 ? type.name : `${type.name} (${cat.name})`,
            color: type.color || cat.color,
          });
        }
      });
    });
    return opts;
  }, [categories, categoryFilters]);

  // Get base tickets based on role
  const baseTickets = useMemo(() => {
    if (canViewAll || showAllTickets) return tickets;
    return reads.getVisibleTickets();
  }, [tickets, canViewAll, showAllTickets, reads]);

  const filteredTickets = useMemo(() => {
    return baseTickets.filter(ticket => {
      const matchesSearch =
        searchQuery === '' ||
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.description.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilters.length === 0 || statusFilters.includes(ticket.status);
      const matchesDepartment = departmentFilters.length === 0 || departmentFilters.includes(ticket.departmentId);
      const matchesPriority = priorityFilters.length === 0 || priorityFilters.includes(ticket.priority);
      const matchesAssignee = assignedToFilters.length === 0 || (ticket.assignedTo && assignedToFilters.includes(ticket.assignedTo));
      const matchesTag = tagFilters.length === 0 || ticket.tags.some(t => tagFilters.includes(t));
      const matchesCategory = categoryFilters.length === 0 || (
        ticket.category && categoryFilters.some(catId => {
          const cat = categories.find(c => c.id === catId);
          return cat && cat.name === ticket.category;
        })
      );

      // Type filter: values are "catId::typeName"
      const matchesCategoryType = categoryTypeFilters.length === 0 || (
        ticket.categoryType && categoryTypeFilters.some(key => {
          const [catId, typeName] = key.split('::');
          const cat = categories.find(c => c.id === catId);
          return cat && cat.name === ticket.category && typeName === ticket.categoryType;
        })
      );

      return matchesSearch && matchesStatus && matchesDepartment && matchesPriority && matchesAssignee && matchesTag && matchesCategory && matchesCategoryType;
    });
  }, [baseTickets, searchQuery, statusFilters, departmentFilters, priorityFilters, assignedToFilters, tagFilters, categoryFilters, categoryTypeFilters, categories]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const toggleTicketSelection = (ticketId: string) => {
    const newSelection = new Set(selectedTickets);
    if (newSelection.has(ticketId)) {
      newSelection.delete(ticketId);
    } else {
      newSelection.add(ticketId);
    }
    setSelectedTickets(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedTickets.size === filteredTickets.length) {
      setSelectedTickets(new Set());
    } else {
      setSelectedTickets(new Set(filteredTickets.map(t => t.id)));
    }
  };

  const handleBulkUpdateStatus = (status: any) => {
    actions.bulkUpdateTickets(Array.from(selectedTickets), { status });
    setSelectedTickets(new Set());
  };

  const handleBulkUpdatePriority = (priority: any) => {
    actions.bulkUpdateTickets(Array.from(selectedTickets), { priority });
    setSelectedTickets(new Set());
  };

  const handleBulkAssign = (userId: string) => {
    actions.bulkUpdateTickets(Array.from(selectedTickets), { assignedTo: userId });
    setSelectedTickets(new Set());
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Subject', 'Status', 'Priority', 'Department', 'Assigned To', 'Created', 'Updated'];
    const rows = filteredTickets.map(ticket => [
      ticket.id,
      ticket.subject,
      ticket.status,
      ticket.priority,
      getDepartmentName(ticket.departmentId),
      getUserName(ticket.assignedTo || ''),
      formatDate(ticket.createdAt),
      formatDate(ticket.updatedAt),
    ]);

    const csv = [headers, ...rows].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tickets-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Exported to CSV');
  };

  const applySavedFilter = (filter: SavedFilter) => {
    setActiveFilterId(filter.id);
    // Reset all filters first
    setStatusFilters([]);
    setPriorityFilters([]);
    setDepartmentFilters([]);
    setAssignedToFilters([]);
    setTagFilters([]);
    setCategoryFilters([]);
    setCategoryTypeFilters([]);
    setSearchQuery('');

    // Apply multi-value filters directly from the saved filter
    if (filter.filters.status && filter.filters.status.length > 0) {
      setStatusFilters([...filter.filters.status]);
    }
    if (filter.filters.priority && filter.filters.priority.length > 0) {
      setPriorityFilters([...filter.filters.priority]);
    }
    if (filter.filters.departmentId && filter.filters.departmentId.length > 0) {
      setDepartmentFilters([...filter.filters.departmentId]);
    }
    if (filter.filters.assignedTo && filter.filters.assignedTo.length > 0) {
      setAssignedToFilters([...filter.filters.assignedTo]);
    }
    if (filter.filters.tags && filter.filters.tags.length > 0) {
      setTagFilters([...filter.filters.tags]);
    }
    if (filter.filters.categories && filter.filters.categories.length > 0) {
      setCategoryFilters([...filter.filters.categories]);
    }
    if (filter.filters.categoryTypes && filter.filters.categoryTypes.length > 0) {
      setCategoryTypeFilters([...filter.filters.categoryTypes]);
    }
    if (filter.filters.searchQuery) {
      setSearchQuery(filter.filters.searchQuery);
    }
    toast.success(`Applied view: ${filter.name}`);
  };

  const clearFilters = () => {
    setStatusFilters([]);
    setPriorityFilters([]);
    setDepartmentFilters([]);
    setAssignedToFilters([]);
    setTagFilters([]);
    setCategoryFilters([]);
    setCategoryTypeFilters([]);
    setSearchQuery('');
    setActiveFilterId(undefined);
  };

  const hasActiveFilters = statusFilters.length > 0 || priorityFilters.length > 0 || departmentFilters.length > 0 || assignedToFilters.length > 0 || tagFilters.length > 0 || categoryFilters.length > 0 || categoryTypeFilters.length > 0 || searchQuery !== '';

  const saveCurrentFilter = () => {
    if (!filterName.trim()) {
      toast.error('Please enter a view name');
      return;
    }

    const filter: SavedFilter['filters'] = {};
    if (statusFilters.length > 0) filter.status = statusFilters as TicketStatus[];
    if (priorityFilters.length > 0) filter.priority = priorityFilters as TicketPriority[];
    if (departmentFilters.length > 0) filter.departmentId = departmentFilters;
    if (assignedToFilters.length > 0) filter.assignedTo = assignedToFilters;
    if (tagFilters.length > 0) filter.tags = tagFilters;
    if (categoryFilters.length > 0) filter.categories = categoryFilters;
    if (categoryTypeFilters.length > 0) filter.categoryTypes = categoryTypeFilters;
    if (searchQuery) filter.searchQuery = searchQuery;

    actions.createSavedFilter({
      name: filterName,
      userId: currentUserId,
      filters: filter,
      isShared: filterIsShared,
    });

    setFilterName('');
    setFilterIsShared(false);
    setIsSaveFilterOpen(false);
    toast.success('View saved successfully');
  };

  const activeFilterCount = [statusFilters, priorityFilters, departmentFilters, assignedToFilters, tagFilters, categoryFilters, categoryTypeFilters].filter(f => f.length > 0).length + (searchQuery ? 1 : 0);

  return (
    <div className="flex h-full">
      {/* Saved Views Sidebar */}
      {showViewsPanel && (
        <div className="w-64 border-r border-border bg-card flex flex-col flex-shrink-0">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-sm font-medium text-foreground/80">Saved Views</h2>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setShowViewsPanel(false)}>
              <PanelLeftClose className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex-1 overflow-auto p-3">
            {/* All Tickets (reset) */}
            <div
              className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors mb-2 ${
                !activeFilterId && !hasActiveFilters ? 'bg-brand-primary-light border border-brand-secondary' : 'hover:bg-muted border border-transparent'
              }`}
              onClick={clearFilters}
            >
              <Filter className={`w-4 h-4 ${!activeFilterId && !hasActiveFilters ? 'text-brand-primary' : 'text-muted-foreground'}`} />
              <span className={`text-sm ${!activeFilterId && !hasActiveFilters ? 'font-medium text-brand-primary' : 'text-foreground/80'}`}>
                {isRestricted ? 'My Department Tickets' : 'All Tickets'}
              </span>
              <Badge variant="outline" className="ml-auto text-xs">{baseTickets.length}</Badge>
            </div>

            <SavedViewsPanel
              onApplyFilter={applySavedFilter}
              activeFilterId={activeFilterId}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {!showViewsPanel && (
              <Button variant="ghost" size="sm" onClick={() => setShowViewsPanel(true)}>
                <PanelLeft className="w-4 h-4" />
              </Button>
            )}
            <div>
              <h1 className="text-3xl mb-2">
                {isRestricted ? 'My Department Tickets' : 'All Tickets'}
              </h1>
              <p className="text-muted-foreground mt-1">
                {isRestricted
                  ? `Showing tickets for ${currentUser ? reads.getDepartmentName(currentUser.department) : 'your department'}`
                  : 'Manage and track support tickets'
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle for agents/viewers to see all tickets (read-only preview) */}
            {!canViewAll && (
              <Button
                variant={showAllTickets ? 'default' : 'outline'}
                size="sm"
                onClick={() => setShowAllTickets(!showAllTickets)}
                className="gap-1.5"
              >
                {showAllTickets ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showAllTickets ? 'My Dept Only' : 'Show All'}
              </Button>
            )}
            <Button onClick={exportToCSV} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters - now using multi-select */}
        <div className="bg-card p-4 rounded-lg border border-border mb-6">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets by ID, subject, or description..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setActiveFilterId(undefined); }}
                className="pl-10"
              />
            </div>
            <MultiSelect
              options={statusOptions}
              selected={statusFilters}
              onChange={(v) => { setStatusFilters(v); setActiveFilterId(undefined); }}
              allLabel="All Status"
              className="w-40"
            />
            <MultiSelect
              options={departmentOptions}
              selected={departmentFilters}
              onChange={(v) => { setDepartmentFilters(v); setActiveFilterId(undefined); }}
              allLabel="All Depts"
              className="w-44"
            />
            <MultiSelect
              options={priorityOptions}
              selected={priorityFilters}
              onChange={(v) => { setPriorityFilters(v); setActiveFilterId(undefined); }}
              allLabel="All Priority"
              className="w-40"
            />
            <MultiSelect
              options={assigneeOptions}
              selected={assignedToFilters}
              onChange={(v) => { setAssignedToFilters(v); setActiveFilterId(undefined); }}
              allLabel="All Agents"
              className="w-40"
              enableSearch
              searchPlaceholder="Search agents..."
            />
            <MultiSelect
              options={tagOptions}
              selected={tagFilters}
              onChange={(v) => { setTagFilters(v); setActiveFilterId(undefined); }}
              allLabel="All Tags"
              className="w-36"
              enableSearch
              searchPlaceholder="Search tags..."
            />
            <MultiSelect
              options={categoryOptions}
              selected={categoryFilters}
              onChange={(v) => {
                setCategoryFilters(v);
                // Clear type filters that no longer belong to any selected category
                if (v.length > 0) {
                  setCategoryTypeFilters(prev => prev.filter(key => {
                    const [catId] = key.split('::');
                    return v.includes(catId);
                  }));
                }
                setActiveFilterId(undefined);
              }}
              allLabel="All Categories"
              className="w-40"
              enableSearch
              searchPlaceholder="Search categories..."
            />
            {categoryTypeOptions.length > 0 && (
              <MultiSelect
                options={categoryTypeOptions}
                selected={categoryTypeFilters}
                onChange={(v) => { setCategoryTypeFilters(v); setActiveFilterId(undefined); }}
                allLabel="All Types"
                className="w-40"
                enableSearch
                searchPlaceholder="Search types..."
              />
            )}
          </div>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Showing {filteredTickets.length} of {baseTickets.length} tickets
              </span>
              {activeFilterCount > 0 && (
                <Badge variant="outline" className="text-xs">
                  {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''} active
                </Badge>
              )}
              {isRestricted && (
                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                  Department view
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="text-muted-foreground">
                  <X className="w-3.5 h-3.5 mr-1" />
                  Clear filters
                </Button>
              )}
              {hasActiveFilters && canCreateTickets && (
                <Button variant="outline" size="sm" onClick={() => setIsSaveFilterOpen(true)}>
                  <Save className="w-3.5 h-3.5 mr-1" />
                  Save as View
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                {canBulkAction && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTickets.size === filteredTickets.length && filteredTickets.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                )}
                <TableHead>Ticket ID</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>SLA</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={canBulkAction ? 9 : 8} className="text-center py-8 text-muted-foreground">
                    No tickets found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTickets.map(ticket => (
                  <TableRow
                    key={ticket.id}
                    className={`hover:bg-muted/50 ${selectedTickets.has(ticket.id) ? 'bg-brand-primary-light' : ''}`}
                  >
                    {canBulkAction && (
                      <TableCell>
                        <Checkbox
                          checked={selectedTickets.has(ticket.id)}
                          onCheckedChange={() => toggleTicketSelection(ticket.id)}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="font-mono text-brand-primary hover:text-brand-primary/80 hover:underline"
                      >
                        {ticket.id}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link
                        to={`/tickets/${ticket.id}`}
                        className="font-medium text-foreground hover:text-brand-primary"
                      >
                        {ticket.subject}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ticket.status)}>
                        {ticket.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(ticket.priority)}>
                        {ticket.priority}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: departments.find(d => d.id === ticket.departmentId)?.color }}
                        />
                        <span className="text-sm text-muted-foreground">{getDepartmentName(ticket.departmentId)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {getUserName(ticket.assignedTo || '')}
                    </TableCell>
                    <TableCell>
                      <SLAIndicator ticket={ticket} slas={slas} />
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(ticket.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Bulk Actions - only for non-viewers */}
        {canBulkAction && (
          <BulkActions
            selectedCount={selectedTickets.size}
            onUpdateStatus={handleBulkUpdateStatus}
            onUpdatePriority={handleBulkUpdatePriority}
            onAssign={handleBulkAssign}
            onClearSelection={() => setSelectedTickets(new Set())}
            users={users}
          />
        )}

        {/* Save Filter Dialog */}
        <Dialog open={isSaveFilterOpen} onOpenChange={setIsSaveFilterOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Save Current Filters as View</DialogTitle>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="filterName">View Name *</Label>
                <Input
                  id="filterName"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  placeholder="e.g., My High Priority Tickets"
                  onKeyDown={(e) => e.key === 'Enter' && saveCurrentFilter()}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Share with team</Label>
                  <p className="text-xs text-muted-foreground">Make this view visible to all team members</p>
                </div>
                <Switch checked={filterIsShared} onCheckedChange={setFilterIsShared} />
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-foreground/80 font-medium mb-2">Active filters:</p>
                <div className="flex flex-wrap gap-2">
                  {statusFilters.length > 0 && (
                    <Badge variant="outline">Status: {statusFilters.join(', ')}</Badge>
                  )}
                  {priorityFilters.length > 0 && (
                    <Badge variant="outline">Priority: {priorityFilters.join(', ')}</Badge>
                  )}
                  {departmentFilters.length > 0 && (
                    <Badge variant="outline">
                      Dept: {departmentFilters.map(id => getDepartmentName(id)).join(', ')}
                    </Badge>
                  )}
                  {assignedToFilters.length > 0 && (
                    <Badge variant="outline">
                      Agent: {assignedToFilters.map(id => getUserName(id)).join(', ')}
                    </Badge>
                  )}
                  {tagFilters.length > 0 && (
                    <Badge variant="outline">
                      Tags: {tagFilters.map(id => allTags.find(t => t.id === id)?.name).join(', ')}
                    </Badge>
                  )}
                  {categoryFilters.length > 0 && (
                    <Badge variant="outline">
                      Categories: {categoryFilters.map(id => categories.find(c => c.id === id)?.name).join(', ')}
                    </Badge>
                  )}
                  {categoryTypeFilters.length > 0 && (
                    <Badge variant="outline">
                      Types: {categoryTypeFilters.map(key => key.split('::')[1]).join(', ')}
                    </Badge>
                  )}
                  {searchQuery && (
                    <Badge variant="outline">Search: "{searchQuery}"</Badge>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsSaveFilterOpen(false)}>
                Cancel
              </Button>
              <Button onClick={saveCurrentFilter}>
                Save View
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}