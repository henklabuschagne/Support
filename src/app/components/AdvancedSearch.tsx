import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Search, Filter, X } from 'lucide-react';
import { TicketStatus, TicketPriority } from '../types';

interface AdvancedSearchProps {
  onSearch: (filters: SearchFilters) => void;
  departments: Array<{ id: string; name: string }>;
  tags: Array<{ id: string; name: string }>;
  users: Array<{ id: string; name: string }>;
}

export interface SearchFilters {
  keyword?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  departmentId?: string;
  assignedTo?: string;
  createdByDate?: { from?: string; to?: string };
  tags?: string[];
  hasDueDate?: boolean;
  slaStatus?: string;
}

export function AdvancedSearch({ onSearch, departments, tags, users }: AdvancedSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({});

  const handleSearch = () => {
    onSearch(filters);
    setIsOpen(false);
  };

  const handleReset = () => {
    setFilters({});
    onSearch({});
  };

  const activeFilterCount = Object.keys(filters).filter(key => {
    const value = filters[key as keyof SearchFilters];
    return value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true);
  }).length;

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        className="relative"
      >
        <Filter className="w-4 h-4 mr-2" />
        Advanced Search
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Advanced Search</DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="col-span-2">
              <Label htmlFor="keyword">Keyword Search</Label>
              <Input
                id="keyword"
                placeholder="Search in subject, description..."
                value={filters.keyword || ''}
                onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filters.status || '__any__'} onValueChange={(val) => setFilters({ ...filters, status: val === '__any__' ? undefined : val as TicketStatus })}>
                <SelectTrigger id="status">
                  <SelectValue placeholder="Any status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any__">Any status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select value={filters.priority || '__any__'} onValueChange={(val) => setFilters({ ...filters, priority: val === '__any__' ? undefined : val as TicketPriority })}>
                <SelectTrigger id="priority">
                  <SelectValue placeholder="Any priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any__">Any priority</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="department">Department</Label>
              <Select value={filters.departmentId || '__any__'} onValueChange={(val) => setFilters({ ...filters, departmentId: val === '__any__' ? undefined : val })}>
                <SelectTrigger id="department">
                  <SelectValue placeholder="Any department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any__">Any department</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="assigned">Assigned To</Label>
              <Select value={filters.assignedTo || '__any__'} onValueChange={(val) => setFilters({ ...filters, assignedTo: val === '__any__' ? undefined : val })}>
                <SelectTrigger id="assigned">
                  <SelectValue placeholder="Anyone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any__">Anyone</SelectItem>
                  <SelectItem value="unassigned">Unassigned</SelectItem>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sla">SLA Status</Label>
              <Select value={filters.slaStatus || '__any__'} onValueChange={(val) => setFilters({ ...filters, slaStatus: val === '__any__' ? undefined : val })}>
                <SelectTrigger id="sla">
                  <SelectValue placeholder="Any SLA status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any__">Any SLA status</SelectItem>
                  <SelectItem value="met">Met</SelectItem>
                  <SelectItem value="at-risk">At Risk</SelectItem>
                  <SelectItem value="breached">Breached</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="has-due-date">Due Date</Label>
              <Select value={filters.hasDueDate ? 'yes' : filters.hasDueDate === false ? 'no' : '__any__'} onValueChange={(val) => setFilters({ ...filters, hasDueDate: val === 'yes' ? true : val === 'no' ? false : undefined })}>
                <SelectTrigger id="has-due-date">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__any__">Any</SelectItem>
                  <SelectItem value="yes">Has due date</SelectItem>
                  <SelectItem value="no">No due date</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="created-from">Created From</Label>
              <Input
                id="created-from"
                type="date"
                value={filters.createdByDate?.from || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  createdByDate: { ...filters.createdByDate, from: e.target.value }
                })}
              />
            </div>

            <div>
              <Label htmlFor="created-to">Created To</Label>
              <Input
                id="created-to"
                type="date"
                value={filters.createdByDate?.to || ''}
                onChange={(e) => setFilters({
                  ...filters,
                  createdByDate: { ...filters.createdByDate, to: e.target.value }
                })}
              />
            </div>
          </div>

          <DialogFooter className="flex items-center justify-between">
            <Button variant="ghost" onClick={handleReset}>
              <X className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}