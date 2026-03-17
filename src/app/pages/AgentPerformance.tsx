import { useAppStore } from '../hooks/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { 
  Trophy, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  Star,
  Award,
  Target,
  Zap
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export function AgentPerformance() {
  const { tickets, comments, timeEntries, users, departments } = useAppStore('tickets', 'comments', 'timeEntries', 'departments', 'users');

  // Calculate metrics per agent
  const agentMetrics = users.map(agent => {
    const agentTickets = tickets.filter(t => t.assignedTo === agent.id);
    const closedTickets = agentTickets.filter(t => t.status === 'closed');
    const openTickets = agentTickets.filter(t => t.status === 'open' || t.status === 'in-progress');
    
    // Response time
    const ticketsWithResponse = agentTickets.filter(t => t.firstResponseAt);
    const avgResponseTime = ticketsWithResponse.length > 0
      ? ticketsWithResponse.reduce((sum, t) => {
          const responseTime = (new Date(t.firstResponseAt!).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
          return sum + responseTime;
        }, 0) / ticketsWithResponse.length
      : 0;

    // Resolution time
    const avgResolutionTime = closedTickets.length > 0
      ? closedTickets.reduce((sum, t) => {
          if (!t.closedAt) return sum;
          const resolutionTime = (new Date(t.closedAt).getTime() - new Date(t.createdAt).getTime()) / (1000 * 60 * 60);
          return sum + resolutionTime;
        }, 0) / closedTickets.length
      : 0;

    // Customer satisfaction
    const ratedTickets = closedTickets.filter(t => t.satisfactionRating);
    const avgSatisfaction = ratedTickets.length > 0
      ? ratedTickets.reduce((sum, t) => sum + (t.satisfactionRating || 0), 0) / ratedTickets.length
      : 0;

    // Activity
    const agentComments = comments.filter(c => c.userId === agent.id);
    const agentTime = timeEntries.filter(e => e.userId === agent.id).reduce((sum, e) => sum + e.hours, 0);

    // First contact resolution rate
    const firstContactResolutions = closedTickets.filter(t => {
      const ticketComments = comments.filter(c => c.ticketId === t.id && !c.isInternal);
      return ticketComments.length <= 1; // Closed with 1 or no comments
    });
    const fcrRate = closedTickets.length > 0 
      ? (firstContactResolutions.length / closedTickets.length) * 100 
      : 0;

    // Quality score (composite)
    const qualityScore = (
      (avgSatisfaction / 5) * 40 + // 40% weight on satisfaction
      (fcrRate) * 0.3 + // 30% weight on FCR
      (Math.min(avgResponseTime > 0 ? 24 / avgResponseTime : 0, 1)) * 20 + // 20% weight on response time
      (closedTickets.length > 0 ? Math.min(closedTickets.length / 20, 1) : 0) * 10 // 10% weight on volume
    );

    return {
      ...agent,
      totalTickets: agentTickets.length,
      closedTickets: closedTickets.length,
      openTickets: openTickets.length,
      avgResponseTime,
      avgResolutionTime,
      avgSatisfaction,
      commentsPosted: agentComments.length,
      hoursLogged: agentTime,
      fcrRate,
      qualityScore: Math.round(qualityScore)
    };
  });

  // Leaderboard - sort by quality score
  const leaderboard = [...agentMetrics].sort((a, b) => b.qualityScore - a.qualityScore);

  // Chart data
  const chartData = agentMetrics.map(agent => ({
    name: agent.name,
    closed: agent.closedTickets,
    open: agent.openTickets,
    satisfaction: agent.avgSatisfaction
  }));

  const getMedalIcon = (rank: number) => {
    if (rank === 0) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 1) return <Award className="w-6 h-6 text-gray-400" />;
    if (rank === 2) return <Award className="w-6 h-6 text-amber-700" />;
    return <div className="w-6 h-6 flex items-center justify-center text-gray-400 font-bold">{rank + 1}</div>;
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 80) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 60) return { label: 'Good', color: 'bg-blue-100 text-blue-800' };
    if (score >= 40) return { label: 'Average', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Needs Improvement', color: 'bg-orange-100 text-orange-800' };
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Trophy className="w-8 h-8" />
          Agent Performance Analytics
        </h1>
        <p className="text-gray-500 mt-2">Track productivity, quality, and team performance</p>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {leaderboard.slice(0, 3).map((agent, index) => {
          const badge = getPerformanceBadge(agent.qualityScore);
          return (
            <Card key={agent.id} className={index === 0 ? 'border-2 border-yellow-400' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  {getMedalIcon(index)}
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{agent.name}</h3>
                    <p className="text-sm text-gray-500">{departments.find(d => d.id === agent.department)?.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">{agent.qualityScore}</div>
                    <div className="text-xs text-gray-500">Score</div>
                  </div>
                </div>
                <Badge className={badge.color}>{badge.label}</Badge>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-500">Closed</p>
                    <p className="font-semibold">{agent.closedTickets}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">CSAT</p>
                    <p className="font-semibold">{agent.avgSatisfaction.toFixed(1)}/5</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Performance Chart */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Ticket Volume & Satisfaction</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 5]} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="closed" fill="#10b981" name="Closed Tickets" />
              <Bar yAxisId="left" dataKey="open" fill="#f59e0b" name="Open Tickets" />
              <Bar yAxisId="right" dataKey="satisfaction" fill="#3b82f6" name="Avg Satisfaction" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Performance Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaderboard.map((agent, index) => {
              const badge = getPerformanceBadge(agent.qualityScore);
              return (
                <div key={agent.id} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 flex justify-center">
                      {getMedalIcon(index)}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-semibold text-lg">
                      {agent.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-sm text-gray-500">{departments.find(d => d.id === agent.department)?.name}</p>
                    </div>
                  </div>

                  <div className="flex gap-6">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <Target className="w-3 h-3" />
                        <span>Quality</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900">{agent.qualityScore}</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <CheckCircle className="w-3 h-3" />
                        <span>Closed</span>
                      </div>
                      <div className="text-xl font-semibold text-green-600">{agent.closedTickets}</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <Star className="w-3 h-3" />
                        <span>CSAT</span>
                      </div>
                      <div className="text-xl font-semibold text-blue-600">{agent.avgSatisfaction.toFixed(1)}</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <Zap className="w-3 h-3" />
                        <span>FCR</span>
                      </div>
                      <div className="text-xl font-semibold text-purple-600">{agent.fcrRate.toFixed(0)}%</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <Clock className="w-3 h-3" />
                        <span>Resp. Time</span>
                      </div>
                      <div className="text-xl font-semibold text-orange-600">{agent.avgResponseTime.toFixed(1)}h</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center gap-1 text-gray-500 text-xs mb-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Hours</span>
                      </div>
                      <div className="text-xl font-semibold text-gray-600">{agent.hoursLogged.toFixed(1)}</div>
                    </div>
                  </div>

                  <Badge className={badge.color}>{badge.label}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}