import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Clock } from 'lucide-react';
import { TimeEntry } from '../types';
import { toast } from 'sonner';

interface TimeTrackerProps {
  ticketId: string;
  timeEntries: TimeEntry[];
  onAddTime: (entry: Omit<TimeEntry, 'id' | 'createdAt'>) => void;
  users: Array<{ id: string; name: string }>;
  currentUserId?: string;
}

export function TimeTracker({ ticketId, timeEntries, onAddTime, users, currentUserId }: TimeTrackerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState('');
  const [description, setDescription] = useState('');

  const ticketTimeEntries = timeEntries.filter(e => e.ticketId === ticketId);
  const totalHours = ticketTimeEntries.reduce((sum, entry) => sum + entry.hours, 0);

  const handleSubmit = () => {
    const hoursNum = parseFloat(hours);
    if (!hoursNum || hoursNum <= 0) {
      toast.error('Please enter valid hours');
      return;
    }
    if (!description.trim()) {
      toast.error('Please provide a description');
      return;
    }

    onAddTime({
      ticketId,
      userId: currentUserId || '1', // Current user
      hours: hoursNum,
      description,
    });

    setHours('');
    setDescription('');
    setIsOpen(false);
    toast.success('Time logged successfully');
  };

  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'Unknown';

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground/80">
            Time Logged: {totalHours.toFixed(1)}h
          </span>
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
          <Clock className="w-4 h-4 mr-2" />
          Log Time
        </Button>
      </div>

      {ticketTimeEntries.length > 0 && (
        <div className="mt-4 space-y-2">
          {ticketTimeEntries.map(entry => (
            <div key={entry.id} className="text-sm border-l-2 border-blue-200 pl-3 py-1">
              <div className="flex items-center gap-2">
                <span className="font-medium text-brand-primary">{entry.hours}h</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground/80">{getUserName(entry.userId)}</span>
                <span className="text-muted-foreground">•</span>
                <span className="text-muted-foreground text-xs">{formatDate(entry.createdAt)}</span>
              </div>
              <p className="text-foreground/80 mt-1">{entry.description}</p>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Time</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="hours">Hours *</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                placeholder="e.g., 2.5"
              />
            </div>
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you work on?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Log Time</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}