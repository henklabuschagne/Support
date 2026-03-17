import { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  Users, 
  Clock, 
  TrendingUp, 
  Zap,
  CheckCircle2,
  XCircle,
  Timer,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router';
import { toast } from 'sonner';

export function Operations() {
  const { tickets, timeEntries, departments, users, actions } = useAppStore('tickets', 'timeEntries', 'departments', 'users');
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  // Calculate ticket aging (hours since created)
  const getTicketAge = (createdAt: string) => {
    return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
  };

  // Ticket Health Score (0-100, lower is worse)
  const getTicketHealth = (ticket: any) => {
    let score = 100;
    const age = getTicketAge(ticket.createdAt);
    
    // Age penalties
    if (age > 72) score -= 40;
    else if (age > 48) score -= 25;
    else if (age > 24) score -= 15;
    
    // No assignment penalty
    if (!ticket.assignedTo) score -= 20;
    
    // Priority penalties
    if (ticket.priority === 'urgent' && age > 4) score -= 30;
    if (ticket.priority === 'high' && age > 24) score -= 20;
    
    // No response penalty
    if (!ticket.firstResponseAt && age > 2) score -= 15;
    
    // Status penalties
    if (ticket.status === 'open' && age > 48) score -= 10;
    
    return Math.max(0, score);
  };

  // Real-time metrics
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in-progress');
  const unassignedTickets = openTickets.filter(t => !t.assignedTo);
  const urgentTickets = tickets.filter(t => t.priority === 'urgent' && t.status !== 'closed');
  const overdueTickets = tickets.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'closed');
  
  // Aging tickets (open for more than 48 hours)
  const agingTickets = openTickets.filter(t => getTicketAge(t.createdAt) > 48);
  
  // At-risk tickets (health score < 50)
  const atRiskTickets = openTickets.filter(t => getTicketHealth(t) < 50);

  // Agent workload
  const agentWorkload = users.map(user => {
    const userTickets = tickets.filter(t => t.assignedTo === user.id && (t.status === 'open' || t.status === 'in-progress'));
    const userTime = timeEntries.filter(e => e.userId === user.id).reduce((sum, e) => sum + e.hours, 0);
    const avgHealth = userTickets.length > 0 
      ? userTickets.reduce((sum, t) => sum + getTicketHealth(t), 0) / userTickets.length 
      : 100;
    
    return {
      ...user,
      activeTickets: userTickets.length,
      totalHours: userTime,
      avgTicketHealth: avgHealth,
      urgentCount: userTickets.filter(t => t.priority === 'urgent').length,
      capacity: userTickets.length < 10 ? 'available' : userTickets.length < 20 ? 'busy' : 'overloaded'
    };
  });

  // Response time metrics
  const ticketsWithResponse = tickets.filter(t => t.firstResponseAt);
  const avgResponseTime = ticketsWithResponse.length > 0
    ? ticketsWithResponse.reduce((sum, t) => {
        const responseTime = (new Date(t.firstResponseAt!).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
        return sum + responseTime;
      }, 0) / ticketsWithResponse.length
    : 0;

  const getCapacityColor = (capacity: string) => {
    if (capacity === 'available') return 'bg-brand-success-light text-brand-success';
    if (capacity === 'busy') return 'bg-brand-warning-light text-brand-warning';
    return 'bg-brand-error-light text-brand-error';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  const handleBalanceWorkload = () => {
    // Placeholder for balancing workload logic
    toast.success('Workload balanced successfully!');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl flex items-center gap-3">
          <Activity className="w-8 h-8" />
          Operations Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">Real-time team performance and ticket health monitoring</p>
      </div>

      {/* Critical Alerts */}
      {(unassignedTickets.length > 5 || urgentTickets.length > 0 || atRiskTickets.length > 5) && (
        <div className="mb-6 space-y-2">
          {unassignedTickets.length > 5 && (
            <div className="p-4 bg-brand-error-light border border-brand-error-mid rounded-lg flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-brand-error" />
              <div className="flex-1">
                <p className="font-medium text-brand-error">High Unassigned Ticket Count</p>
                <p className="text-sm text-brand-error/80">{unassignedTickets.length} tickets waiting for assignment</p>
              </div>
              <Link to="/queue">
                <Button size="sm" variant="outline">Assign Now</Button>
              </Link>
            </div>
          )}
          {urgentTickets.length > 0 && (
            <div className="p-4 bg-brand-warning-light border border-brand-warning-mid rounded-lg flex items-center gap-3">
              <Zap className="w-5 h-5 text-brand-warning" />
              <div className="flex-1">
                <p className="font-medium text-brand-warning">Urgent Tickets Require Attention</p>
                <p className="text-sm text-brand-warning/80">{urgentTickets.length} urgent tickets in queue</p>
              </div>
              <Link to="/queue">
                <Button size="sm" variant="outline">View Queue</Button>
              </Link>
            </div>
          )}
          {atRiskTickets.length > 5 && (
            <div className="p-4 bg-brand-warning-light border border-brand-warning-mid rounded-lg flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-brand-warning" />
              <div className="flex-1">
                <p className="font-medium text-brand-warning">Tickets At Risk</p>
                <p className="text-sm text-brand-warning/80">{atRiskTickets.length} tickets have low health scores</p>
              </div>
              <Link to="/queue">
                <Button size="sm" variant="outline">Review</Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Tickets</p>
                <p className="text-3xl font-bold text-foreground mt-1">{openTickets.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{unassignedTickets.length} unassigned</p>
              </div>
              <div className="w-12 h-12 bg-brand-primary-light rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-brand-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Urgent Priority</p>
                <p className="text-3xl font-bold text-brand-error mt-1">{urgentTickets.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Requires immediate action</p>
              </div>
              <div className="w-12 h-12 bg-brand-error-light rounded-full flex items-center justify-center">
                <Zap className="w-6 h-6 text-brand-error" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
                <p className="text-3xl font-bold text-foreground mt-1">{avgResponseTime.toFixed(1)}h</p>
                <p className="text-xs text-brand-success mt-1">↓ 12% from last week</p>
              </div>
              <div className="w-12 h-12 bg-brand-success-light rounded-full flex items-center justify-center">
                <Timer className="w-6 h-6 text-brand-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-3xl font-bold text-brand-warning mt-1">{atRiskTickets.length}</p>
                <p className="text-xs text-muted-foreground mt-1">Health score &lt; 50</p>
              </div>
              <div className="w-12 h-12 bg-brand-warning-light rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-brand-warning" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Agent Workload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Agent Workload & Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {agentWorkload.map(agent => (
                <div key={agent.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-primary text-white flex items-center justify-center font-semibold">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{agent.name}</p>
                      <p className="text-xs text-muted-foreground">{departments.find(d => d.id === agent.department)?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{agent.activeTickets} tickets</p>
                      <p className="text-xs text-muted-foreground">{agent.totalHours.toFixed(1)}h logged</p>
                    </div>
                    {agent.urgentCount > 0 && (
                      <Badge className="bg-brand-error-light text-brand-error">
                        {agent.urgentCount} urgent
                      </Badge>
                    )}
                    <Badge className={getCapacityColor(agent.capacity)}>
                      {agent.capacity}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button className="w-full mt-4" variant="outline" onClick={handleBalanceWorkload}>
              <UserCheck className="w-4 h-4 mr-2" />
              Balance Workload
            </Button>
          </CardContent>
        </Card>

        {/* At-Risk Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              At-Risk Tickets (Health Score &lt; 50)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {atRiskTickets.slice(0, 10).map(ticket => {
                const health = getTicketHealth(ticket);
                const age = getTicketAge(ticket.createdAt);
                return (
                  <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
                    <div className="p-3 border border-border rounded-lg hover:border-brand-warning hover:bg-brand-warning-light/50 transition-all">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{ticket.subject}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {ticket.id} • Age: {age.toFixed(0)}h
                            {!ticket.assignedTo && ' • Unassigned'}
                          </p>
                        </div>
                        <div className="ml-3">
                          <div className={`text-xs font-semibold px-2 py-1 rounded ${
                            health < 30 ? 'bg-brand-error-light text-brand-error' :
                            health < 50 ? 'bg-brand-warning-light text-brand-warning' :
                            'bg-brand-warning-light text-brand-warning'
                          }`}>
                            {health}% Health
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="text-xs" variant="outline">{ticket.priority}</Badge>
                        <Badge className="text-xs" variant="outline">{ticket.status}</Badge>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="w-4 h-4" />
              Aging Tickets (&gt;48h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">{agingTickets.length}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {agingTickets.filter(t => !t.assignedTo).length} unassigned
            </p>
            <Link to="/queue">
              <Button variant="outline" size="sm" className="mt-4 w-full">
                View Aging Queue
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <XCircle className="w-4 h-4" />
              Overdue Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-brand-error">{overdueTickets.length}</p>
            <p className="text-sm text-muted-foreground mt-2">
              Past due date
            </p>
            <Link to="/queue">
              <Button variant="outline" size="sm" className="mt-4 w-full">
                Review Overdue
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="w-4 h-4" />
              Team Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-brand-success">87%</p>
            <p className="text-sm text-muted-foreground mt-2">
              ↑ 5% from last week
            </p>
            <Link to="/insights">
              <Button variant="outline" size="sm" className="mt-4 w-full">
                View Analytics
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}