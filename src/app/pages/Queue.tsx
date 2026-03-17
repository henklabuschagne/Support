import { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Link } from 'react-router';
import { 
  Zap, 
  Clock, 
  AlertTriangle, 
  TrendingUp,
  UserPlus,
  CheckCircle,
  Play
} from 'lucide-react';
import { toast } from 'sonner';

export function Queue() {
  const { tickets, departments, users, actions } = useAppStore('tickets', 'departments', 'users');
  const [queueView, setQueueView] = useState<'smart' | 'unassigned' | 'urgent' | 'aging'>('smart');
  const [autoAssignEnabled, setAutoAssignEnabled] = useState(false);

  // Smart Priority Scoring Algorithm
  const calculatePriorityScore = (ticket: any) => {
    let score = 0;
    
    // Priority weight
    const priorityWeights = { urgent: 100, high: 70, medium: 40, low: 20 };
    score += priorityWeights[ticket.priority as keyof typeof priorityWeights] || 0;
    
    // Age weight (hours since created)
    const age = (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60);
    score += Math.min(age * 2, 50); // Cap at 50 points
    
    // SLA weight
    if (ticket.slaStatus === 'breached') score += 80;
    else if (ticket.slaStatus === 'at-risk') score += 40;
    
    // Unassigned weight
    if (!ticket.assignedTo) score += 30;
    
    // No response weight
    if (!ticket.firstResponseAt) score += 25;
    
    // Overdue weight
    if (ticket.dueDate && new Date(ticket.dueDate) < new Date()) score += 60;
    
    // Customer type weight (if enterprise customer)
    if (ticket.customFields?.customerType === 'enterprise') score += 20;
    if (ticket.customFields?.impact === 'critical') score += 30;
    
    return score;
  };

  // Get queue tickets based on view
  const getQueueTickets = () => {
    const openTickets = tickets.filter(t => t.status === 'open' || t.status === 'in-progress' || t.status === 'pending');
    
    switch (queueView) {
      case 'unassigned':
        return openTickets.filter(t => !t.assignedTo);
      case 'urgent':
        return openTickets.filter(t => t.priority === 'urgent' || t.priority === 'high');
      case 'aging':
        const age48h = openTickets.filter(t => {
          const age = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
          return age > 48;
        });
        return age48h;
      case 'smart':
      default:
        // Smart queue - sort by priority score
        return openTickets.sort((a, b) => calculatePriorityScore(b) - calculatePriorityScore(a));
    }
  };

  const queueTickets = getQueueTickets();

  // Find best agent for ticket (based on capacity and department)
  const findBestAgent = (ticket: any) => {
    const departmentAgents = users.filter(u => u.department === ticket.departmentId);
    
    // Calculate agent load
    const agentLoads = departmentAgents.map(agent => ({
      ...agent,
      load: tickets.filter(t => 
        t.assignedTo === agent.id && 
        (t.status === 'open' || t.status === 'in-progress')
      ).length
    }));
    
    // Find agent with lowest load
    const bestAgent = agentLoads.sort((a, b) => a.load - b.load)[0];
    return bestAgent;
  };

  const handleQuickAssign = (ticketId: string) => {
    const ticket = tickets.find(t => t.id === ticketId);
    if (!ticket) return;
    
    const bestAgent = findBestAgent(ticket);
    if (bestAgent) {
      actions.updateTicket(ticketId, { assignedTo: bestAgent.id });
      toast.success(`Assigned to ${bestAgent.name}`);
    }
  };

  const handleBulkAutoAssign = () => {
    const unassigned = queueTickets.filter(t => !t.assignedTo);
    let assigned = 0;
    
    unassigned.forEach(ticket => {
      const bestAgent = findBestAgent(ticket);
      if (bestAgent) {
        actions.updateTicket(ticket.id, { assignedTo: bestAgent.id });
        assigned++;
      }
    });
    
    toast.success(`Auto-assigned ${assigned} tickets`);
  };

  const getTicketAge = (createdAt: string) => {
    const age = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    if (age < 1) return `${Math.floor(age * 60)}m`;
    if (age < 24) return `${Math.floor(age)}h`;
    return `${Math.floor(age / 24)}d`;
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getRecommendedAction = (ticket: any) => {
    const score = calculatePriorityScore(ticket);
    const age = (Date.now() - new Date(ticket.createdAt).getTime()) / (1000 * 60 * 60);
    
    if (!ticket.assignedTo) return { action: 'Assign immediately', icon: UserPlus, color: 'text-orange-600' };
    if (score > 150) return { action: 'Escalate now', icon: Zap, color: 'text-red-600' };
    if (age > 72) return { action: 'Review urgently', icon: AlertTriangle, color: 'text-orange-600' };
    if (!ticket.firstResponseAt) return { action: 'Send first response', icon: Play, color: 'text-blue-600' };
    return { action: 'Monitor', icon: CheckCircle, color: 'text-green-600' };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <TrendingUp className="w-8 h-8" />
            Smart Queue Management
          </h1>
          <p className="text-gray-500 mt-2">AI-powered ticket prioritization and routing</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleBulkAutoAssign} variant="default">
            <Zap className="w-4 h-4 mr-2" />
            Auto-Assign All
          </Button>
        </div>
      </div>

      {/* Queue Metrics */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setQueueView('smart')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Smart Queue</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{queueTickets.length}</p>
              </div>
              <TrendingUp className={`w-8 h-8 ${queueView === 'smart' ? 'text-blue-600' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setQueueView('unassigned')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unassigned</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">
                  {tickets.filter(t => !t.assignedTo && (t.status === 'open' || t.status === 'in-progress')).length}
                </p>
              </div>
              <UserPlus className={`w-8 h-8 ${queueView === 'unassigned' ? 'text-orange-600' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setQueueView('urgent')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {tickets.filter(t => (t.priority === 'urgent' || t.priority === 'high') && t.status !== 'closed').length}
                </p>
              </div>
              <Zap className={`w-8 h-8 ${queueView === 'urgent' ? 'text-red-600' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setQueueView('aging')}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Aging (&gt;48h)</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {tickets.filter(t => {
                    const age = (Date.now() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
                    return age > 48 && (t.status === 'open' || t.status === 'in-progress');
                  }).length}
                </p>
              </div>
              <Clock className={`w-8 h-8 ${queueView === 'aging' ? 'text-gray-900' : 'text-gray-400'}`} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {queueView === 'smart' && 'Smart Prioritized Queue'}
              {queueView === 'unassigned' && 'Unassigned Tickets'}
              {queueView === 'urgent' && 'High Priority Queue'}
              {queueView === 'aging' && 'Aging Tickets Queue'}
            </CardTitle>
            <p className="text-sm text-gray-500">{queueTickets.length} tickets</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {queueTickets.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                <p className="font-medium">Queue is empty!</p>
                <p className="text-sm">All tickets have been handled.</p>
              </div>
            ) : (
              queueTickets.map((ticket, index) => {
                const score = calculatePriorityScore(ticket);
                const recommendation = getRecommendedAction(ticket);
                const RecommendationIcon = recommendation.icon;
                const assignedUser = users.find(u => u.id === ticket.assignedTo);
                const bestAgent = !ticket.assignedTo ? findBestAgent(ticket) : null;

                return (
                  <div
                    key={ticket.id}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                  >
                    <div className="flex items-start gap-4">
                      {/* Priority Score */}
                      {queueView === 'smart' && (
                        <div className="flex-shrink-0">
                          <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${
                            score > 150 ? 'bg-red-100' :
                            score > 100 ? 'bg-orange-100' :
                            score > 50 ? 'bg-yellow-100' :
                            'bg-green-100'
                          }`}>
                            <div className={`text-xs font-semibold ${
                              score > 150 ? 'text-red-800' :
                              score > 100 ? 'text-orange-800' :
                              score > 50 ? 'text-yellow-800' :
                              'text-green-800'
                            }`}>
                              #{index + 1}
                            </div>
                            <div className={`text-xs ${
                              score > 150 ? 'text-red-600' :
                              score > 100 ? 'text-orange-600' :
                              score > 50 ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {score}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Ticket Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <Link to={`/tickets/${ticket.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                              {ticket.subject}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-gray-500 font-mono">{ticket.id}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">Age: {getTicketAge(ticket.createdAt)}</span>
                              <span className="text-xs text-gray-400">•</span>
                              <span className="text-xs text-gray-500">{formatDate(ticket.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
                          <Badge variant="outline">{ticket.status}</Badge>
                          <Badge variant="outline">
                            {departments.find(d => d.id === ticket.departmentId)?.name}
                          </Badge>
                          {ticket.customFields?.impact && (
                            <Badge variant="outline" className="border-red-300 text-red-700">
                              {ticket.customFields.impact} impact
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`flex items-center gap-2 ${recommendation.color}`}>
                              <RecommendationIcon className="w-4 h-4" />
                              <span className="text-sm font-medium">{recommendation.action}</span>
                            </div>
                            {assignedUser ? (
                              <div className="text-sm text-gray-600">
                                Assigned to <span className="font-medium">{assignedUser.name}</span>
                              </div>
                            ) : bestAgent ? (
                              <div className="text-sm text-gray-500">
                                Suggested: <span className="font-medium text-blue-600">{bestAgent.name}</span>
                              </div>
                            ) : null}
                          </div>

                          <div className="flex gap-2">
                            {!ticket.assignedTo && (
                              <Button size="sm" onClick={() => handleQuickAssign(ticket.id)}>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Quick Assign
                              </Button>
                            )}
                            <Link to={`/tickets/${ticket.id}`}>
                              <Button size="sm" variant="outline">
                                <Play className="w-4 h-4 mr-2" />
                                Work On
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}