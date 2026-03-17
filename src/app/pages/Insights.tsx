import { useAppStore } from '../hooks/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Tag, Users } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

export function Insights() {
  const { tickets, departments, users, tags: allTags } = useAppStore('tickets', 'departments', 'users', 'tags');

  // Top performing agents
  const agentStats = users.map(user => {
    const userTickets = tickets.filter(t => t.assignedTo === user.id);
    const closedTickets = userTickets.filter(t => t.status === 'closed');
    const avgTimeToClose = closedTickets.length > 0
      ? closedTickets.reduce((acc, ticket) => {
          if (!ticket.closedAt) return acc;
          const created = new Date(ticket.createdAt).getTime();
          const closed = new Date(ticket.closedAt).getTime();
          return acc + (closed - created);
        }, 0) / closedTickets.length / (1000 * 60 * 60)
      : 0;

    return {
      id: user.id,
      name: user.name,
      department: departments.find(d => d.id === user.department)?.name || '',
      total: userTickets.length,
      closed: closedTickets.length,
      open: userTickets.filter(t => t.status === 'open' || t.status === 'in-progress').length,
      resolutionRate: userTickets.length > 0 ? (closedTickets.length / userTickets.length) * 100 : 0,
      avgTimeToClose,
    };
  }).filter(agent => agent.total > 0).sort((a, b) => b.resolutionRate - a.resolutionRate);

  // Most common tags
  const tagStats = allTags.map(tag => {
    const tagTickets = tickets.filter(t => t.tags.includes(tag.id));
    const openCount = tagTickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
    return {
      ...tag,
      total: tagTickets.length,
      open: openCount,
      closed: tagTickets.filter(t => t.status === 'closed').length,
    };
  }).filter(tag => tag.total > 0).sort((a, b) => b.total - a.total);

  // Department insights
  const departmentInsights = departments.map(dept => {
    const deptTickets = tickets.filter(t => t.departmentId === dept.id);
    const closedTickets = deptTickets.filter(t => t.status === 'closed');
    const avgTimeToClose = closedTickets.length > 0
      ? closedTickets.reduce((acc, ticket) => {
          if (!ticket.closedAt) return acc;
          const created = new Date(ticket.createdAt).getTime();
          const closed = new Date(ticket.closedAt).getTime();
          return acc + (closed - created);
        }, 0) / closedTickets.length / (1000 * 60 * 60)
      : 0;

    return {
      ...dept,
      total: deptTickets.length,
      open: deptTickets.filter(t => t.status === 'open' || t.status === 'in-progress').length,
      closed: closedTickets.length,
      avgTimeToClose,
      resolutionRate: deptTickets.length > 0 ? (closedTickets.length / deptTickets.length) * 100 : 0,
    };
  }).filter(dept => dept.total > 0);

  // Tickets needing attention
  const ticketsNeedingAttention = tickets.filter(t => {
    if (t.status === 'closed' || t.status === 'resolved') return false;
    
    const daysSinceCreated = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const isUrgent = t.priority === 'urgent';
    const isHigh = t.priority === 'high';
    const isOld = daysSinceCreated > 3;
    
    return isUrgent || (isHigh && isOld) || (!t.assignedTo && daysSinceCreated > 1);
  }).slice(0, 10);

  // Recent trends
  const thisWeekTickets = tickets.filter(t => {
    const created = new Date(t.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created > weekAgo;
  }).length;

  const lastWeekTickets = tickets.filter(t => {
    const created = new Date(t.createdAt);
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return created > twoWeeksAgo && created <= weekAgo;
  }).length;

  const ticketTrend = lastWeekTickets > 0 
    ? ((thisWeekTickets - lastWeekTickets) / lastWeekTickets) * 100 
    : thisWeekTickets > 0 ? 100 : 0;

  const formatTime = (hours: number) => {
    if (hours < 24) return `${hours.toFixed(1)}h`;
    return `${(hours / 24).toFixed(1)}d`;
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Insights & Analytics</h1>
        <p className="text-muted-foreground mt-2">Data-driven insights for support optimization</p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Weekly Ticket Trend</CardTitle>
            {ticketTrend >= 0 ? (
              <TrendingUp className="w-4 h-4 text-brand-success" />
            ) : (
              <TrendingDown className="w-4 h-4 text-brand-error" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {thisWeekTickets}
            </div>
            <p className={`text-sm mt-1 ${ticketTrend >= 0 ? 'text-brand-success' : 'text-brand-error'}`}>
              {ticketTrend >= 0 ? '+' : ''}{ticketTrend.toFixed(1)}% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Tickets Needing Attention</CardTitle>
            <AlertTriangle className="w-4 h-4 text-brand-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-warning">{ticketsNeedingAttention.length}</div>
            <p className="text-sm text-muted-foreground mt-1">Urgent or overdue tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Best Resolution Rate</CardTitle>
            <CheckCircle className="w-4 h-4 text-brand-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-success">
              {agentStats[0]?.resolutionRate.toFixed(0) || 0}%
            </div>
            <p className="text-sm text-muted-foreground mt-1">{agentStats[0]?.name || 'N/A'}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tickets Needing Attention */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-brand-warning" />
            Tickets Requiring Immediate Attention
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ticketsNeedingAttention.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">No tickets require immediate attention</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ticket ID</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ticketsNeedingAttention.map(ticket => {
                  const daysSinceCreated = (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60 * 24);
                  let reason = '';
                  if (ticket.priority === 'urgent') reason = 'Urgent priority';
                  else if (ticket.priority === 'high' && daysSinceCreated > 3) reason = 'High priority + overdue';
                  else if (!ticket.assignedTo) reason = 'Unassigned';
                  
                  return (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-mono text-brand-primary">{ticket.id}</TableCell>
                      <TableCell className="font-medium">{ticket.subject}</TableCell>
                      <TableCell>
                        <Badge className={
                          ticket.priority === 'urgent' ? 'bg-brand-error-light text-brand-error' :
                          ticket.priority === 'high' ? 'bg-brand-warning-light text-brand-warning' :
                          'bg-brand-primary-light text-brand-primary'
                        }>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{ticket.status}</Badge>
                      </TableCell>
                      <TableCell>{daysSinceCreated.toFixed(1)} days</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{reason}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Agent Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Agent Performance Ranking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agent</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Closed</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Avg Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {agentStats.map((agent, index) => (
                  <TableRow key={agent.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{agent.name}</div>
                        <div className="text-sm text-muted-foreground">{agent.department}</div>
                      </div>
                    </TableCell>
                    <TableCell>{agent.total}</TableCell>
                    <TableCell>{agent.closed}</TableCell>
                    <TableCell>
                      <Badge className={
                        agent.resolutionRate >= 80 ? 'bg-brand-success-light text-brand-success' :
                        agent.resolutionRate >= 60 ? 'bg-brand-warning-light text-brand-warning' :
                        'bg-brand-error-light text-brand-error'
                      }>
                        {agent.resolutionRate.toFixed(0)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {agent.avgTimeToClose > 0 ? formatTime(agent.avgTimeToClose) : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tag Analytics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              Most Common Tags
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tag</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Open</TableHead>
                  <TableHead>Closed</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tagStats.map(tag => (
                  <TableRow key={tag.id}>
                    <TableCell>
                      <Badge variant="outline" style={{ borderColor: tag.color, color: tag.color }}>
                        {tag.name}
                      </Badge>
                    </TableCell>
                    <TableCell>{tag.total}</TableCell>
                    <TableCell>{tag.open}</TableCell>
                    <TableCell>{tag.closed}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Total Tickets</TableHead>
                <TableHead>Open</TableHead>
                <TableHead>Closed</TableHead>
                <TableHead>Resolution Rate</TableHead>
                <TableHead>Avg Resolution Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {departmentInsights.map(dept => (
                <TableRow key={dept.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: dept.color }} />
                      <span className="font-medium">{dept.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{dept.total}</TableCell>
                  <TableCell>{dept.open}</TableCell>
                  <TableCell>{dept.closed}</TableCell>
                  <TableCell>
                    <Badge className={
                      dept.resolutionRate >= 80 ? 'bg-brand-success-light text-brand-success' :
                      dept.resolutionRate >= 60 ? 'bg-brand-warning-light text-brand-warning' :
                      'bg-brand-error-light text-brand-error'
                    }>
                      {dept.resolutionRate.toFixed(0)}%
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {dept.avgTimeToClose > 0 ? formatTime(dept.avgTimeToClose) : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}