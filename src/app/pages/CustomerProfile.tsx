import { useParams, Link } from 'react-router';
import { useAppStore } from '../hooks/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { ArrowLeft, Mail, Phone, Building, Calendar, Star, Ticket as TicketIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';

export function CustomerProfile() {
  const { id } = useParams<{ id: string }>();
  const { customers, tickets } = useAppStore('tickets', 'customers');
  const customer = customers.find(c => c.id === id);

  if (!customer) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h1>
          <Link to="/tickets" className="text-blue-600 hover:text-blue-700">
            ← Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  const customerTickets = tickets.filter(t => t.customerId === customer.id);
  const openTickets = customerTickets.filter(t => t.status === 'open' || t.status === 'in-progress');
  const closedTickets = customerTickets.filter(t => t.status === 'closed');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      open: 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-yellow-100 text-yellow-800',
      pending: 'bg-orange-100 text-orange-800',
      resolved: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link to="/tickets" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-6">
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </Link>

      <div className="grid grid-cols-3 gap-6">
        {/* Customer Info */}
        <div className="col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center text-2xl font-bold">
                  {customer.name.charAt(0)}
                </div>
                <div>
                  <CardTitle className="text-2xl">{customer.name}</CardTitle>
                  <p className="text-sm text-gray-500">{customer.id}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${customer.email}`} className="hover:text-blue-600">
                  {customer.email}
                </a>
              </div>
              {customer.phone && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <a href={`tel:${customer.phone}`} className="hover:text-blue-600">
                    {customer.phone}
                  </a>
                </div>
              )}
              {customer.company && (
                <div className="flex items-center gap-3 text-gray-700">
                  <Building className="w-4 h-4 text-gray-400" />
                  <span>{customer.company}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span>Customer since {formatDate(customer.createdAt)}</span>
              </div>
              {customer.satisfactionScore && (
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Satisfaction Score</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold text-gray-900">
                        {customer.satisfactionScore.toFixed(1)}/5.0
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${(customer.satisfactionScore / 5) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Total Tickets</span>
                <span className="font-semibold text-2xl text-gray-900">{customer.totalTickets}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Open Tickets</span>
                <span className="font-semibold text-2xl text-blue-600">{openTickets.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Closed Tickets</span>
                <span className="font-semibold text-2xl text-green-600">{closedTickets.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Ticket History */}
        <div className="col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TicketIcon className="w-5 h-5" />
                  Ticket History
                </CardTitle>
                <Button size="sm">
                  Create New Ticket
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {customerTickets.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <TicketIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>No tickets found for this customer</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ticket ID</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerTickets.map(ticket => (
                      <TableRow key={ticket.id}>
                        <TableCell>
                          <Link
                            to={`/tickets/${ticket.id}`}
                            className="font-mono text-blue-600 hover:text-blue-700 hover:underline"
                          >
                            {ticket.id}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <Link
                            to={`/tickets/${ticket.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
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
                          <Badge variant="outline" className="capitalize">
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {formatDate(ticket.createdAt)}
                        </TableCell>
                        <TableCell className="text-gray-600 text-sm">
                          {formatDate(ticket.updatedAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}