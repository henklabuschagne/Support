import { useAppStore } from '../hooks/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { FileBarChart, TrendingUp, Users, Clock, FolderOpen } from 'lucide-react';

export function Reports() {
  const { tickets, departments, users, categories } = useAppStore('tickets', 'categories', 'departments', 'users');

  // Calculate metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in-progress').length;
  const closedTickets = tickets.filter(t => t.status === 'closed').length;
  const resolvedTickets = tickets.filter(t => t.status === 'resolved' || t.status === 'closed').length;

  // Calculate average resolution time for closed tickets
  const closedWithTime = tickets.filter(t => t.closedAt && t.createdAt);
  const avgResolutionTime = closedWithTime.length > 0
    ? closedWithTime.reduce((acc, ticket) => {
        const created = new Date(ticket.createdAt).getTime();
        const closed = new Date(ticket.closedAt!).getTime();
        return acc + (closed - created);
      }, 0) / closedWithTime.length / (1000 * 60 * 60)
    : 0;

  // Tickets by department
  const ticketsByDepartment = departments.map((dept, idx) => ({
    name: dept.name || `Dept ${idx + 1}`,
    id: dept.id,
    count: tickets.filter(t => t.departmentId === dept.id).length,
    color: dept.color,
  }));

  // Tickets by status
  const ticketsByStatus = [
    { name: 'Open', value: tickets.filter(t => t.status === 'open').length, color: '#456E92' },
    { name: 'In Progress', value: tickets.filter(t => t.status === 'in-progress').length, color: '#CEA569' },
    { name: 'Pending', value: tickets.filter(t => t.status === 'pending').length, color: '#7AA2C0' },
    { name: 'Resolved', value: tickets.filter(t => t.status === 'resolved').length, color: '#5F966C' },
    { name: 'Closed', value: tickets.filter(t => t.status === 'closed').length, color: '#092E50' },
  ].filter(item => item.value > 0);

  // Tickets by priority
  const ticketsByPriority = [
    { name: 'Low', value: tickets.filter(t => t.priority === 'low').length, color: '#7AA2C0' },
    { name: 'Medium', value: tickets.filter(t => t.priority === 'medium').length, color: '#456E92' },
    { name: 'High', value: tickets.filter(t => t.priority === 'high').length, color: '#CEA569' },
    { name: 'Urgent', value: tickets.filter(t => t.priority === 'urgent').length, color: '#AB5A5C' },
  ].filter(item => item.value > 0);

  // Tickets by category
  const ticketsByCategory = categories
    .map((cat, idx) => ({
      name: cat.name || `Category ${idx + 1}`,
      count: tickets.filter(t => t.category === cat.name).length,
      color: cat.color,
    }))
    .filter(item => item.count > 0)
    .sort((a, b) => b.count - a.count);

  // Tickets by category type (top types across all categories)
  const ticketsByCategoryType: { name: string; category: string; count: number; color: string }[] = [];
  categories.forEach(cat => {
    (cat.types || []).forEach(type => {
      const count = tickets.filter(t => t.category === cat.name && t.categoryType === type.name).length;
      if (count > 0) {
        ticketsByCategoryType.push({
          name: `${type.name} (${cat.name})`,
          category: cat.name,
          count,
          color: type.color || cat.color,
        });
      }
    });
  });
  ticketsByCategoryType.sort((a, b) => b.count - a.count);

  // Ticket trends (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const ticketTrends = last7Days.map((date, index) => {
    const dayTickets = tickets.filter(t => t.createdAt.startsWith(date));
    return {
      id: `day-${index}`,
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      created: dayTickets.length,
      closed: dayTickets.filter(t => t.closedAt?.startsWith(date)).length,
    };
  });

  // Compute agent performance from users and tickets
  const agentPerformance = (users || [])
    .filter(u => u.role === 'agent' || u.role === 'admin')
    .map((u, idx) => {
      const assigned = tickets.filter(t => t.assignedTo === u.id);
      const resolved = assigned.filter(t => t.status === 'resolved' || t.status === 'closed');
      return {
        id: u.id,
        name: u.name || `Agent ${idx + 1}`,
        assigned: assigned.length,
        resolved: resolved.length,
        open: assigned.filter(t => t.status === 'open' || t.status === 'in-progress').length,
      };
    })
    .filter(a => a.assigned > 0)
    .sort((a, b) => b.assigned - a.assigned);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground mt-2">Comprehensive ticket performance metrics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
            <FileBarChart className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTickets}</div>
            <p className="text-xs text-muted-foreground mt-1">All time tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Resolution Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-brand-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-success">
              {totalTickets > 0 ? Math.round((resolvedTickets / totalTickets) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground mt-1">{resolvedTickets} resolved tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Resolution Time</CardTitle>
            <Clock className="w-4 h-4 text-brand-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-primary">{avgResolutionTime.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground mt-1">Average time to close</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Agents</CardTitle>
            <Users className="w-4 h-4 text-brand-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-brand-primary">{agentPerformance.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently handling tickets</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tickets by Department */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Department</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketsByDepartment}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="id" tick={{ fontSize: 12 }} stroke="#64748b" tickFormatter={(id) => {
                  const dept = ticketsByDepartment.find(d => d.id === id);
                  return dept?.name || id;
                }} />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip labelFormatter={(id) => {
                  const dept = ticketsByDepartment.find(d => d.id === id);
                  return dept?.name || id;
                }} />
                <Bar dataKey="count" fill="#456E92" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tickets by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ticketsByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ticketsByStatus.map((entry, index) => (
                    <Cell key={`status-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Tickets by Priority */}
        <Card>
          <CardHeader>
            <CardTitle>Tickets by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ticketsByPriority}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ticketsByPriority.map((entry, index) => (
                    <Cell key={`priority-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Ticket Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Ticket Trends (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={ticketTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#456E92" strokeWidth={2} name="Created" />
                <Line type="monotone" dataKey="closed" stroke="#5F966C" strokeWidth={2} name="Closed" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tickets by Category */}
      {ticketsByCategory.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Tickets by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketsByCategory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill="#456E92">
                  {ticketsByCategory.map((entry, index) => (
                    <Cell key={`cat-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Tickets by Category Type */}
      {ticketsByCategoryType.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderOpen className="w-5 h-5" />
              Tickets by Category Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={ticketsByCategoryType} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="#64748b" />
                <YAxis dataKey="name" type="category" width={150} tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip />
                <Bar dataKey="count" fill="#456E92">
                  {ticketsByCategoryType.map((entry, index) => (
                    <Cell key={`cattype-cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Agent Performance */}
      {agentPerformance.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={agentPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="id" tick={{ fontSize: 12 }} stroke="#64748b" tickFormatter={(id) => {
                  const agent = agentPerformance.find(a => a.id === id);
                  return agent?.name || id;
                }} />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                <Tooltip labelFormatter={(id) => {
                  const agent = agentPerformance.find(a => a.id === id);
                  return agent?.name || id;
                }} />
                <Legend />
                <Bar dataKey="resolved" fill="#5F966C" name="Resolved" radius={[8, 8, 0, 0]} />
                <Bar dataKey="open" fill="#456E92" name="Open" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  );
}