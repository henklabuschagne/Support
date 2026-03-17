import { useState } from 'react';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CheckSquare, X } from 'lucide-react';
import { TicketStatus, TicketPriority } from '../types';
import { toast } from 'sonner';

interface BulkActionsProps {
  selectedCount: number;
  onUpdateStatus?: (status: TicketStatus) => void;
  onUpdatePriority?: (priority: TicketPriority) => void;
  onAssign?: (userId: string) => void;
  onClearSelection: () => void;
  users?: Array<{ id: string; name: string }>;
}

export function BulkActions({
  selectedCount,
  onUpdateStatus,
  onUpdatePriority,
  onAssign,
  onClearSelection,
  users = [],
}: BulkActionsProps) {
  const [action, setAction] = useState<string>('');

  if (selectedCount === 0) return null;

  const handleApply = (value: string) => {
    if (action === 'status' && onUpdateStatus) {
      onUpdateStatus(value as TicketStatus);
      toast.success(`Updated ${selectedCount} ticket(s)`);
    } else if (action === 'priority' && onUpdatePriority) {
      onUpdatePriority(value as TicketPriority);
      toast.success(`Updated ${selectedCount} ticket(s)`);
    } else if (action === 'assign' && onAssign) {
      onAssign(value);
      toast.success(`Assigned ${selectedCount} ticket(s)`);
    }
    setAction('');
    onClearSelection();
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-white border border-gray-300 rounded-lg shadow-lg p-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-brand-primary" />
          <span className="font-medium text-foreground">
            {selectedCount} ticket{selectedCount !== 1 ? 's' : ''} selected
          </span>
        </div>

        <div className="h-6 w-px bg-border" />

        <Select value={action} onValueChange={setAction}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Bulk Action" />
          </SelectTrigger>
          <SelectContent>
            {onUpdateStatus && <SelectItem value="status">Change Status</SelectItem>}
            {onUpdatePriority && <SelectItem value="priority">Change Priority</SelectItem>}
            {onAssign && <SelectItem value="assign">Assign To</SelectItem>}
          </SelectContent>
        </Select>

        {action === 'status' && (
          <Select onValueChange={handleApply}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        )}

        {action === 'priority' && (
          <Select onValueChange={handleApply}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="urgent">Urgent</SelectItem>
            </SelectContent>
          </Select>
        )}

        {action === 'assign' && (
          <Select onValueChange={handleApply}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Agent" />
            </SelectTrigger>
            <SelectContent>
              {users.map(user => (
                <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}