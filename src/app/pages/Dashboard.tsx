import { useAppStore } from '../hooks/useAppStore';
import { Ticket, AlertCircle, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Link } from 'react-router';

export function Dashboard() {
  const { departments, users, currentUser, reads } = useAppStore('tickets', 'currentUser', 'departments', 'users');

  // Permission-based: show only visible tickets for users without view_all
  const tickets = reads.getVisibleTickets();
  const isRestricted = !reads.hasPermission('view_all');

  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in-progress');
  const closedTickets = tickets.filter(t => t.status === 'closed');
  const urgentTickets = tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed');
  const recentTickets = tickets.slice(0, 5);

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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          {isRestricted
            ? `Showing data for ${currentUser ? reads.getDepartmentName(currentUser.department) : 'your department'}`
            : 'Overview of your support ticket system'
          }
        </p>
      </div>

      {/* KPI Metric Cards - Pattern A (Icon Left with Colored Container) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-primary-light rounded-lg">
                <Ticket className="w-6 h-6 text-brand-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tickets</p>
                <p className="text-2xl">{tickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-warning-light rounded-lg">
                <AlertCircle className="w-6 h-6 text-brand-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-2xl">{openTickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-success-light rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-brand-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Closed Tickets</p>
                <p className="text-2xl">{closedTickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-brand-error-light rounded-lg">
                <Clock className="w-6 h-6 text-brand-error" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Urgent Tickets</p>
                <p className="text-2xl">{urgentTickets.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tickets */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTickets.map(ticket => (
                <Link
                  key={ticket.id}
                  to={`/tickets/${ticket.id}`}
                  className="block p-4 border border-border rounded-lg hover:shadow-lg hover:border-brand-primary transition-shadow"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm text-muted-foreground">{ticket.id}</span>
                        <Badge className={getPriorityColor(ticket.priority)}>
                          {ticket.priority}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-foreground">{ticket.subject}</h3>
                    </div>
                    <Badge className={getStatusColor(ticket.status)}>
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>{getDepartmentName(ticket.departmentId)}</span>
                    <span>•</span>
                    <span>{getUserName(ticket.assignedTo || '')}</span>
                  </div>
                </Link>
              ))}
            </div>
            <Link to="/tickets" className="block mt-4 text-sm text-brand-primary hover:text-brand-primary/80 font-medium">
              View all tickets →
            </Link>
          </CardContent>
        </Card>

        {/* Department Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {departments.map(dept => {
                const deptTickets = tickets.filter(t => t.departmentId === dept.id);
                const deptOpen = deptTickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
                const percentage = tickets.length > 0 ? (deptTickets.length / tickets.length) * 100 : 0;
                
                return (
                  <div key={dept.id}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: dept.color }}
                        />
                        <span className="font-medium text-foreground">{dept.name}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {deptTickets.length} total ({deptOpen} open)
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="h-2 rounded-full transition-all"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: dept.color 
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
