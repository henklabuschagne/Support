import { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { Star, StarOff, MoreHorizontal, Pencil, Trash2, Share2, Globe, Lock, Eye } from 'lucide-react';
import { toast } from 'sonner';
import type { SavedFilter, TicketStatus, TicketPriority } from '../types';

interface SavedViewsPanelProps {
  onApplyFilter: (filter: SavedFilter) => void;
  activeFilterId?: string;
}

export function SavedViewsPanel({ onApplyFilter, activeFilterId }: SavedViewsPanelProps) {
  const { savedFilters, currentUserId, departments, users, actions } = useAppStore('savedFilters', 'currentUser', 'departments', 'users');
  const [editingFilter, setEditingFilter] = useState<SavedFilter | null>(null);
  const [editName, setEditName] = useState('');

  // Separate into my views and shared views
  const myViews = savedFilters.filter(f => f.userId === currentUserId);
  const sharedViews = savedFilters.filter(f => f.isShared && f.userId !== currentUserId);

  const handleSetDefault = async (filter: SavedFilter) => {
    await actions.setDefaultFilter(filter.id, currentUserId);
    toast.success(`"${filter.name}" set as default view`);
  };

  const handleToggleShare = async (filter: SavedFilter) => {
    await actions.updateSavedFilter(filter.id, { isShared: !filter.isShared });
    toast.success(filter.isShared ? 'View made private' : 'View shared with team');
  };

  const handleRename = async () => {
    if (!editingFilter || !editName.trim()) return;
    await actions.updateSavedFilter(editingFilter.id, { name: editName.trim() });
    toast.success('View renamed');
    setEditingFilter(null);
  };

  const handleDelete = async (filter: SavedFilter) => {
    await actions.deleteSavedFilter(filter.id);
    toast.success(`"${filter.name}" deleted`);
  };

  const getFilterSummary = (filter: SavedFilter) => {
    const parts: string[] = [];
    if (filter.filters.status?.length) {
      parts.push(filter.filters.status.length === 1
        ? filter.filters.status[0]
        : `${filter.filters.status.length} statuses`
      );
    }
    if (filter.filters.priority?.length) {
      parts.push(filter.filters.priority.length === 1
        ? filter.filters.priority[0]
        : `${filter.filters.priority.length} priorities`
      );
    }
    if (filter.filters.departmentId?.length) {
      const names = filter.filters.departmentId.map(id =>
        departments.find(d => d.id === id)?.name || id
      );
      parts.push(names.length === 1 ? names[0] : `${names.length} depts`);
    }
    if (filter.filters.assignedTo?.length) {
      parts.push(`${filter.filters.assignedTo.length} agent(s)`);
    }
    if (filter.filters.tags?.length) {
      parts.push(`${filter.filters.tags.length} tag(s)`);
    }
    return parts.length > 0 ? parts.join(' · ') : 'All tickets';
  };

  const renderFilterItem = (filter: SavedFilter, showOwner = false) => {
    const isActive = activeFilterId === filter.id;
    const isOwner = filter.userId === currentUserId;

    return (
      <div
        key={filter.id}
        className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-colors group ${
          isActive ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50 border border-transparent'
        }`}
        onClick={() => onApplyFilter(filter)}
      >
        <Eye className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`text-sm truncate ${isActive ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
              {filter.name}
            </span>
            {filter.isDefault && (
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
            )}
            {filter.isShared ? (
              <Globe className="w-3 h-3 text-gray-400 flex-shrink-0" />
            ) : (
              <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
            )}
          </div>
          <p className="text-xs text-gray-500 truncate">{getFilterSummary(filter)}</p>
          {showOwner && (
            <p className="text-xs text-gray-400">
              by {users.find(u => u.id === filter.userId)?.name || 'Unknown'}
            </p>
          )}
        </div>

        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 w-7 p-0 opacity-0 group-hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditingFilter(filter); setEditName(filter.name); }}>
                <Pencil className="w-3.5 h-3.5 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleSetDefault(filter); }}>
                <Star className="w-3.5 h-3.5 mr-2" />
                {filter.isDefault ? 'Remove default' : 'Set as default'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleToggleShare(filter); }}>
                <Share2 className="w-3.5 h-3.5 mr-2" />
                {filter.isShared ? 'Make private' : 'Share with team'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600"
                onClick={(e) => { e.stopPropagation(); handleDelete(filter); }}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* My Views */}
      <div>
        <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">My Views ({myViews.length})</h3>
        <div className="space-y-0.5">
          {myViews.length === 0 ? (
            <p className="text-sm text-gray-400 px-2 py-2">No saved views yet</p>
          ) : (
            myViews.map(f => renderFilterItem(f))
          )}
        </div>
      </div>

      {/* Shared Views */}
      {sharedViews.length > 0 && (
        <div>
          <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2 px-2">
            Shared Views ({sharedViews.length})
          </h3>
          <div className="space-y-0.5">
            {sharedViews.map(f => renderFilterItem(f, true))}
          </div>
        </div>
      )}

      {/* Rename Dialog */}
      <Dialog open={!!editingFilter} onOpenChange={(open) => !open && setEditingFilter(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename View</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="View name"
              onKeyDown={(e) => e.key === 'Enter' && handleRename()}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingFilter(null)}>Cancel</Button>
            <Button onClick={handleRename}>Rename</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}