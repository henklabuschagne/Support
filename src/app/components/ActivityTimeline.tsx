import { ActivityLog } from '../types';
import { Clock, UserPlus, MessageSquare, Edit, CheckCircle, AlertCircle } from 'lucide-react';

interface ActivityTimelineProps {
  activities: ActivityLog[];
  users: Array<{ id: string; name: string }>;
}

export function ActivityTimeline({ activities, users }: ActivityTimelineProps) {
  const getUserName = (userId: string) => users.find(u => u.id === userId)?.name || 'System';

  const getIcon = (action: string) => {
    if (action.includes('created')) return <AlertCircle className="w-4 h-4 text-brand-primary" />;
    if (action.includes('assigned') || action.includes('Assigned')) return <UserPlus className="w-4 h-4 text-purple-500" />;
    if (action.includes('comment') || action.includes('note')) return <MessageSquare className="w-4 h-4 text-brand-success" />;
    if (action.includes('closed')) return <CheckCircle className="w-4 h-4 text-muted-foreground" />;
    if (action.includes('changed') || action.includes('Updated')) return <Edit className="w-4 h-4 text-brand-warning" />;
    return <Clock className="w-4 h-4 text-muted-foreground" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <div className="space-y-4">
      {sortedActivities.map((activity, index) => (
        <div key={activity.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
              {getIcon(activity.action)}
            </div>
            {index < sortedActivities.length - 1 && (
              <div className="w-px h-full bg-border mt-2" />
            )}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {activity.action}
                </p>
                <p className="text-sm text-muted-foreground">
                  by {getUserName(activity.userId)}
                </p>
              </div>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(activity.createdAt)}
              </span>
            </div>
            {activity.changes && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-xs">
                {Object.entries(activity.changes).map(([field, change]) => (
                  <div key={field} className="text-muted-foreground">
                    <span className="font-medium capitalize">{field}:</span>{' '}
                    <span className="line-through text-muted-foreground/60">{change.from}</span>
                    {' → '}
                    <span className="text-foreground">{change.to}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}