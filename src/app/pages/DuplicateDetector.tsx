import { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Link } from 'react-router';
import { Copy, Link2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export function DuplicateDetector() {
  const { tickets, users, departments, actions } = useAppStore('tickets', 'departments', 'users');
  const [mergedPairs, setMergedPairs] = useState<Set<string>>(new Set());

  // Simple similarity algorithm (in production, use NLP/ML)
  const calculateSimilarity = (ticket1: any, ticket2: any): number => {
    let score = 0;
    
    // Subject similarity (simple word matching)
    const words1 = ticket1.subject.toLowerCase().split(/\s+/);
    const words2 = ticket2.subject.toLowerCase().split(/\s+/);
    const commonWords = words1.filter((word: string) => words2.includes(word) && word.length > 3);
    score += (commonWords.length / Math.max(words1.length, words2.length)) * 40;
    
    // Same department
    if (ticket1.departmentId === ticket2.departmentId) score += 20;
    
    // Same priority
    if (ticket1.priority === ticket2.priority) score += 10;
    
    // Created within 24 hours
    const timeDiff = Math.abs(new Date(ticket1.createdAt).getTime() - new Date(ticket2.createdAt).getTime());
    if (timeDiff < 24 * 60 * 60 * 1000) score += 15;
    
    // Same customer
    if (ticket1.customerId && ticket1.customerId === ticket2.customerId) score += 15;
    
    return score;
  };

  // Find duplicate groups
  const findDuplicates = () => {
    const openTickets = tickets.filter(t => t.status !== 'closed');
    const duplicateGroups: Array<{ tickets: any[]; similarity: number }> = [];
    const processed = new Set<string>();

    for (let i = 0; i < openTickets.length; i++) {
      if (processed.has(openTickets[i].id)) continue;

      const similarTickets = [];
      for (let j = i + 1; j < openTickets.length; j++) {
        if (processed.has(openTickets[j].id)) continue;

        const similarity = calculateSimilarity(openTickets[i], openTickets[j]);
        if (similarity >= 50) {
          similarTickets.push({
            ticket: openTickets[j],
            similarity
          });
          processed.add(openTickets[j].id);
        }
      }

      if (similarTickets.length > 0) {
        const avgSimilarity = similarTickets.reduce((sum, item) => sum + item.similarity, 0) / similarTickets.length;
        duplicateGroups.push({
          tickets: [openTickets[i], ...similarTickets.map(item => item.ticket)],
          similarity: avgSimilarity
        });
        processed.add(openTickets[i].id);
      }
    }

    return duplicateGroups.sort((a, b) => b.similarity - a.similarity);
  };

  const duplicateGroups = findDuplicates();

  const handleMergeTickets = (primaryId: string, duplicateIds: string[]) => {
    duplicateIds.forEach(id => {
      actions.updateTicket(id, { 
        status: 'closed',
        resolutionNotes: `Merged into ${primaryId} as duplicate`
      });
    });
    
    const pairKey = [primaryId, ...duplicateIds].sort().join('-');
    setMergedPairs(new Set(mergedPairs).add(pairKey));
    toast.success(`Merged ${duplicateIds.length} duplicate ticket(s) into ${primaryId}`);
  };

  const handleLinkTickets = (ticketIds: string[]) => {
    // In production, create ticket relationships
    toast.success(`Linked ${ticketIds.length} related tickets`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
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

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Copy className="w-8 h-8" />
          Duplicate Ticket Detector
        </h1>
        <p className="text-gray-500 mt-2">AI-powered duplicate detection to reduce redundant work</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Duplicate Groups Found</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{duplicateGroups.length}</p>
              </div>
              <Copy className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Potential Duplicates</p>
                <p className="text-3xl font-bold text-orange-600 mt-1">
                  {duplicateGroups.reduce((sum, group) => sum + group.tickets.length, 0)}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tickets Merged</p>
                <p className="text-3xl font-bold text-green-600 mt-1">{mergedPairs.size}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Duplicate Groups */}
      <div className="space-y-6">
        {duplicateGroups.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Duplicates Found</h3>
              <p className="text-gray-500">All tickets appear to be unique. Great job!</p>
            </CardContent>
          </Card>
        ) : (
          duplicateGroups.map((group, groupIndex) => {
            const pairKey = group.tickets.map(t => t.id).sort().join('-');
            const isMerged = mergedPairs.has(pairKey);

            return (
              <Card key={groupIndex} className={isMerged ? 'opacity-50' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">Duplicate Group #{groupIndex + 1}</CardTitle>
                      <Badge className={
                        group.similarity > 75 ? 'bg-red-100 text-red-800' :
                        group.similarity > 60 ? 'bg-orange-100 text-orange-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {group.similarity.toFixed(0)}% Match
                      </Badge>
                      {isMerged && (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Merged
                        </Badge>
                      )}
                    </div>
                    {!isMerged && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleLinkTickets(group.tickets.map(t => t.id))}
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          Link Related
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleMergeTickets(
                            group.tickets[0].id,
                            group.tickets.slice(1).map(t => t.id)
                          )}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Merge Duplicates
                        </Button>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {group.tickets.map((ticket, ticketIndex) => (
                      <div
                        key={ticket.id}
                        className={`p-4 rounded-lg border-2 ${
                          ticketIndex === 0 
                            ? 'border-blue-300 bg-blue-50' 
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              {ticketIndex === 0 && (
                                <Badge className="bg-blue-600 text-white">Primary</Badge>
                              )}
                              <Link
                                to={`/tickets/${ticket.id}`}
                                className="font-medium text-gray-900 hover:text-blue-600"
                              >
                                {ticket.subject}
                              </Link>
                            </div>
                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <span className="font-mono">{ticket.id}</span>
                              <span>•</span>
                              <span>Created {formatDate(ticket.createdAt)}</span>
                              <span>•</span>
                              <span>{users.find(u => u.id === ticket.createdBy)?.name}</span>
                              {ticket.customerId && (
                                <>
                                  <span>•</span>
                                  <span className="font-medium">Customer: {ticket.customerId}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline">{ticket.status}</Badge>
                          <Badge variant="outline">
                            {departments.find(d => d.id === ticket.departmentId)?.name}
                          </Badge>
                          {ticket.assignedTo && (
                            <Badge variant="outline">
                              Assigned to {users.find(u => u.id === ticket.assignedTo)?.name}
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {!isMerged && (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium mb-1">Recommendation:</p>
                          <p>
                            {group.similarity > 75
                              ? 'These tickets are very similar. Consider merging them to avoid duplicate work.'
                              : group.similarity > 60
                              ? 'These tickets appear related. Review them to determine if they should be merged or linked.'
                              : 'These tickets have some similarities. Link them for reference but may not need merging.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}