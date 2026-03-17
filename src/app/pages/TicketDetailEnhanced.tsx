import { useParams, Link } from 'react-router';
import { useAppStore } from '../hooks/useAppStore';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { ArrowLeft, Paperclip, MessageSquare, Tag, User, Calendar, Edit, X, Clock, Link2, AlertCircle, FolderOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Separator } from '../components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { SLAIndicator } from '../components/SLAIndicator';
import { CannedResponsePicker } from '../components/CannedResponsePicker';
import { TimeTracker } from '../components/TimeTracker';
import { ActivityTimeline } from '../components/ActivityTimeline';
import { SatisfactionRating } from '../components/SatisfactionRating';

export function TicketDetailEnhanced() {
  const { id } = useParams<{ id: string }>();
  const { 
    tickets, 
    comments, 
    attachments, 
    timeEntries, 
    activityLogs, 
    slas,
    cannedResponses,
    users,
    departments,
    tags: allTags,
    categories,
    currentUser: storeCurrentUser,
    reads,
    actions,
  } = useAppStore('tickets', 'comments', 'attachments', 'timeEntries', 'activityLogs', 'currentUser', 'categories', 'departments', 'users', 'tags', 'slas', 'cannedResponses');
  const ticket = tickets.find(t => t.id === id);

  const canEdit = reads.hasPermission('edit');
  const isViewer = !canEdit;

  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [createKB, setCreateKB] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedStatus, setEditedStatus] = useState(ticket?.status || 'open');
  const [editedPriority, setEditedPriority] = useState(ticket?.priority || 'medium');
  const [editedAssignee, setEditedAssignee] = useState(ticket?.assignedTo || '');
  const [editedDueDate, setEditedDueDate] = useState(ticket?.dueDate || '');
  const [editedCategory, setEditedCategory] = useState(ticket?.category || '');
  const [editedCategoryType, setEditedCategoryType] = useState(ticket?.categoryType || '');
  const [linkedTicketId, setLinkedTicketId] = useState('');
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, any>>(ticket?.customFields || {});
  const [viewingAgents, setViewingAgents] = useState<string[]>([]);

  // Simulate collision detection
  useEffect(() => {
    if (ticket) {
      // Simulate other agents viewing (in real app, this would be WebSocket/polling)
      const randomAgent = Math.random() > 0.7 ? users[Math.floor(Math.random() * users.length)].id : null;
      if (randomAgent && randomAgent !== '1') {
        setViewingAgents([randomAgent]);
      }
    }
  }, [ticket?.id]);

  if (!ticket) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ticket Not Found</h1>
          <Link to="/tickets" className="text-blue-600 hover:text-blue-700">
            ← Back to Tickets
          </Link>
        </div>
      </div>
    );
  }

  const ticketComments = comments.filter(c => c.ticketId === ticket.id);
  const ticketAttachments = attachments.filter(a => a.ticketId === ticket.id);
  const ticketActivities = activityLogs.filter(a => a.ticketId === ticket.id);
  const department = departments.find(d => d.id === ticket.departmentId);
  const assignedUser = users.find(u => u.id === ticket.assignedTo);
  const createdByUser = users.find(u => u.id === ticket.createdBy);

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

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800',
    };
    return colors[priority as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    actions.addComment({
      ticketId: ticket.id,
      userId: storeCurrentUser?.id || '1',
      content: newComment,
      isInternal,
    });

    setNewComment('');
    setIsInternal(false);
    toast.success(isInternal ? 'Internal note added' : 'Comment added');
  };

  const handleSaveChanges = () => {
    const updates: any = {
      status: editedStatus,
      priority: editedPriority,
      assignedTo: editedAssignee && editedAssignee !== '__none__' ? editedAssignee : undefined,
      dueDate: editedDueDate || undefined,
      category: editedCategory || undefined,
      categoryType: editedCategoryType || undefined,
      customFields: customFieldValues,
    };

    if (ticket.status === 'open' && editedStatus !== 'open' && !ticket.firstResponseAt) {
      updates.firstResponseAt = new Date().toISOString();
    }

    actions.updateTicket(ticket.id, updates);
    setIsEditMode(false);
    toast.success('Ticket updated');
  };

  const handleCloseTicket = () => {
    if (!resolutionNotes.trim()) {
      toast.error('Please provide resolution notes');
      return;
    }

    actions.closeTicket(ticket.id, storeCurrentUser?.id || '1', resolutionNotes);

    if (createKB) {
      actions.createKBArticle({
        title: `How to: ${ticket.subject}`,
        content: resolutionNotes,
        ticketId: ticket.id,
        departmentId: ticket.departmentId,
        tags: ticket.tags,
        createdBy: storeCurrentUser?.id || '1',
      });
      toast.success('Ticket closed and KB article created');
    } else {
      toast.success('Ticket closed');
    }

    setIsCloseDialogOpen(false);
    setResolutionNotes('');
    setCreateKB(false);
  };

  const handleCannedResponse = (response: any) => {
    setNewComment(newComment + (newComment ? '\n\n' : '') + response.content);
  };

  const handleLinkTicket = () => {
    if (!linkedTicketId.trim()) {
      toast.error('Please enter a ticket ID');
      return;
    }

    // In a real app, you'd store this relationship
    toast.success(`Ticket ${linkedTicketId} linked successfully`);
    setIsLinkDialogOpen(false);
    setLinkedTicketId('');
  };

  const isDueSoon = ticket.dueDate && new Date(ticket.dueDate).getTime() - Date.now() < 24 * 60 * 60 * 1000;
  const isOverdue = ticket.dueDate && new Date(ticket.dueDate).getTime() < Date.now();

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Collision Detection Warning */}
      {viewingAgents.length > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <span className="text-sm text-yellow-800">
            <strong>{users.find(u => u.id === viewingAgents[0])?.name}</strong> is also viewing this ticket
          </span>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <Link to="/tickets" className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Tickets
        </Link>
        
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{ticket.subject}</h1>
              <Badge className={getStatusColor(ticket.status)}>{ticket.status}</Badge>
              <Badge className={getPriorityColor(ticket.priority)}>{ticket.priority}</Badge>
              <SLAIndicator ticket={ticket} slas={slas} />
            </div>
            <p className="text-gray-500 font-mono">{ticket.id}</p>
          </div>
          <div className="flex gap-2">
            {!isViewer && !isEditMode ? (
              <>
                <Button variant="outline" onClick={() => setIsEditMode(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                {ticket.status !== 'closed' && (
                  <Button onClick={() => setIsCloseDialogOpen(true)}>
                    Close Ticket
                  </Button>
                )}
              </>
            ) : isEditMode ? (
              <>
                <Button variant="outline" onClick={() => setIsEditMode(false)}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSaveChanges}>
                  Save Changes
                </Button>
              </>
            ) : null}
            {isViewer && (
              <Badge className="bg-yellow-100 text-yellow-800 self-center">Read-only</Badge>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Ticket Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Tabs for Comments, Activity, Time Log */}
          <Card>
            <Tabs defaultValue="comments" className="w-full">
              <div className="border-b px-6 pt-4">
                <TabsList>
                  <TabsTrigger value="comments">
                    Comments ({ticketComments.length})
                  </TabsTrigger>
                  <TabsTrigger value="activity">
                    Activity ({ticketActivities.length})
                  </TabsTrigger>
                  <TabsTrigger value="time">
                    Time Log
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="comments" className="p-6">
                {/* Comments List */}
                <div className="space-y-4 mb-6">
                  {ticketComments.length === 0 ? (
                    <p className="text-center py-8 text-gray-500">No comments yet</p>
                  ) : (
                    ticketComments.map(comment => {
                      const commentUser = users.find(u => u.id === comment.userId);
                      return (
                        <div key={comment.id} className={`p-4 rounded-lg border ${comment.isInternal ? 'bg-yellow-50 border-yellow-200' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                                {commentUser?.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{commentUser?.name}</p>
                                <p className="text-xs text-gray-500">{formatDate(comment.createdAt)}</p>
                              </div>
                            </div>
                            {comment.isInternal && (
                              <Badge variant="outline" className="bg-yellow-100 border-yellow-300 text-yellow-800">
                                Internal Note
                              </Badge>
                            )}
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Comment */}
                {ticket.status !== 'closed' && !isViewer && (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                    />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <Checkbox
                            checked={isInternal}
                            onCheckedChange={(checked) => setIsInternal(checked as boolean)}
                          />
                          <span className="text-sm text-gray-700">Internal note (not visible to customer)</span>
                        </label>
                        <CannedResponsePicker
                          responses={cannedResponses}
                          onSelect={handleCannedResponse}
                        />
                      </div>
                      <Button onClick={handleAddComment}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Add Comment
                      </Button>
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="activity" className="p-6">
                <ActivityTimeline activities={ticketActivities} users={users} />
              </TabsContent>

              <TabsContent value="time" className="p-6">
                <TimeTracker
                  ticketId={ticket.id}
                  timeEntries={timeEntries}
                  onAddTime={(data) => actions.addTimeEntry(data)}
                  users={users}
                  currentUserId={storeCurrentUser?.id}
                />
              </TabsContent>
            </Tabs>
          </Card>

          {/* Attachments */}
          {ticketAttachments.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Paperclip className="w-5 h-5" />
                  Attachments ({ticketAttachments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {ticketAttachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Paperclip className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-xs text-gray-500">
                            {(attachment.size / 1024).toFixed(2)} KB • Uploaded by {users.find(u => u.id === attachment.uploadedBy)?.name}
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">Download</Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Satisfaction Rating */}
          {ticket.status === 'closed' && (
            <Card>
              <CardContent className="pt-6">
                <SatisfactionRating
                  ticketId={ticket.id}
                  currentRating={ticket.satisfactionRating}
                  currentComment={ticket.satisfactionComment}
                  onRate={(rating, comment) => actions.rateTicket(ticket.id, rating, comment)}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Ticket Details */}
          <Card>
            <CardHeader>
              <CardTitle>Ticket Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-gray-600 text-sm">Status</Label>
                {isEditMode ? (
                  <Select value={editedStatus} onValueChange={setEditedStatus}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium text-gray-900 mt-1">{ticket.status}</p>
                )}
              </div>

              <Separator />

              <div>
                <Label className="text-gray-600 text-sm">Priority</Label>
                {isEditMode ? (
                  <Select value={editedPriority} onValueChange={setEditedPriority}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium text-gray-900 mt-1 capitalize">{ticket.priority}</p>
                )}
              </div>

              <Separator />

              <div>
                <Label className="text-gray-600 text-sm flex items-center gap-1">
                  <User className="w-3 h-3" />
                  Assigned To
                </Label>
                {isEditMode ? (
                  <Select value={editedAssignee} onValueChange={setEditedAssignee}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Unassigned" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Unassigned</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="font-medium text-gray-900 mt-1">{assignedUser?.name || 'Unassigned'}</p>
                )}
              </div>

              <Separator />

              <div>
                <Label className="text-gray-600 text-sm">Department</Label>
                <p className="font-medium text-gray-900 mt-1">{department?.name}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-gray-600 text-sm flex items-center gap-1">
                  <FolderOpen className="w-3 h-3" />
                  Category
                </Label>
                {isEditMode ? (
                  <Select value={editedCategory || '__none__'} onValueChange={(v) => { setEditedCategory(v === '__none__' ? '' : v); setEditedCategoryType(''); }}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">None</SelectItem>
                      {categories.filter(c => c.isActive).map(cat => (
                        <SelectItem key={cat.id} value={cat.name}>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            {cat.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : ticket.category ? (
                  <div className="flex items-center gap-2 mt-1">
                    {(() => {
                      const cat = categories.find(c => c.name === ticket.category);
                      return cat ? (
                        <>
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                          <span className="font-medium text-gray-900">{cat.name}</span>
                        </>
                      ) : (
                        <span className="font-medium text-gray-900">{ticket.category}</span>
                      );
                    })()}
                  </div>
                ) : (
                  <p className="text-gray-500 mt-1 text-sm">Not set</p>
                )}
              </div>

              {/* Category Type - shows when category is set and has types */}
              {(() => {
                const editCat = categories.find(c => c.name === (isEditMode ? editedCategory : ticket.category));
                const catTypes = editCat?.types || [];
                if (catTypes.length === 0 && !ticket.categoryType) return null;

                return (
                  <>
                    <Separator />
                    <div>
                      <Label className="text-gray-600 text-sm">Type</Label>
                      {isEditMode && catTypes.length > 0 ? (
                        <Select value={editedCategoryType || '__none__'} onValueChange={(v) => setEditedCategoryType(v === '__none__' ? '' : v)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">None</SelectItem>
                            {catTypes.map(type => (
                              <SelectItem key={type.id} value={type.name}>
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: type.color || editCat?.color }} />
                                  {type.name}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : ticket.categoryType ? (
                        <div className="flex items-center gap-2 mt-1">
                          {(() => {
                            const cat = categories.find(c => c.name === ticket.category);
                            const type = cat?.types?.find(t => t.name === ticket.categoryType);
                            const displayColor = type?.color || cat?.color || '#6b7280';
                            return (
                              <>
                                <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: displayColor }} />
                                <span className="text-sm text-gray-800">{ticket.categoryType}</span>
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <p className="text-gray-500 mt-1 text-sm">Not set</p>
                      )}
                    </div>
                  </>
                );
              })()}

              <Separator />

              <div>
                <Label className="text-gray-600 text-sm flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Due Date
                  {isOverdue && <span className="text-red-600 text-xs ml-1">(Overdue!)</span>}
                  {!isOverdue && isDueSoon && <span className="text-orange-600 text-xs ml-1">(Due soon)</span>}
                </Label>
                {isEditMode ? (
                  <Input
                    type="datetime-local"
                    value={editedDueDate}
                    onChange={(e) => setEditedDueDate(e.target.value)}
                    className="mt-1"
                  />
                ) : ticket.dueDate ? (
                  <p className={`font-medium mt-1 ${isOverdue ? 'text-red-600' : isDueSoon ? 'text-orange-600' : 'text-gray-900'}`}>
                    {formatDate(ticket.dueDate)}
                  </p>
                ) : (
                  <p className="text-gray-500 mt-1 text-sm">Not set</p>
                )}
              </div>

              <Separator />

              <div>
                <Label className="text-gray-600 text-sm">Created By</Label>
                <p className="font-medium text-gray-900 mt-1">{createdByUser?.name}</p>
                <p className="text-xs text-gray-500 mt-1">{formatDate(ticket.createdAt)}</p>
              </div>

              <Separator />

              <div>
                <Label className="text-gray-600 text-sm">Last Updated</Label>
                <p className="text-gray-600 mt-1 text-sm">{formatDate(ticket.updatedAt)}</p>
              </div>

              {ticket.tags.length > 0 && (
                <>
                  <Separator />
                  <div>
                    <Label className="text-gray-600 text-sm flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Tags
                    </Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {ticket.tags.map(tagId => {
                        const tag = allTags.find(t => t.id === tagId);
                        return tag ? (
                          <Badge key={tag.id} variant="outline" style={{ borderColor: tag.color, color: tag.color }}>
                            {tag.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => setIsLinkDialogOpen(true)}>
                <Link2 className="w-4 h-4 mr-2" />
                Link Related Ticket
              </Button>
              <Button variant="outline" className="w-full justify-start" disabled>
                <Paperclip className="w-4 h-4 mr-2" />
                Add Attachment
              </Button>
            </CardContent>
          </Card>

          {/* Custom Fields */}
          {isEditMode && (
            <Card>
              <CardHeader>
                <CardTitle>Custom Fields</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Label htmlFor="customer-type">Customer Type</Label>
                  <Select
                    value={customFieldValues.customerType || ''}
                    onValueChange={(val) => setCustomFieldValues({ ...customFieldValues, customerType: val })}
                  >
                    <SelectTrigger id="customer-type" className="mt-1">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="impact">Business Impact</Label>
                  <Select
                    value={customFieldValues.impact || ''}
                    onValueChange={(val) => setCustomFieldValues({ ...customFieldValues, impact: val })}
                  >
                    <SelectTrigger id="impact" className="mt-1">
                      <SelectValue placeholder="Select impact" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Close Ticket Dialog */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Close Ticket</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="resolution">Resolution Notes *</Label>
              <Textarea
                id="resolution"
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Describe how this ticket was resolved..."
                rows={5}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="create-kb"
                checked={createKB}
                onCheckedChange={(checked) => setCreateKB(checked as boolean)}
              />
              <Label htmlFor="create-kb" className="cursor-pointer">
                Create Knowledge Base article from this resolution
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCloseTicket}>Close Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Link Ticket Dialog */}
      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link Related Ticket</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="linked-ticket">Ticket ID</Label>
            <Input
              id="linked-ticket"
              value={linkedTicketId}
              onChange={(e) => setLinkedTicketId(e.target.value)}
              placeholder="e.g., TCK-1002"
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLinkDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleLinkTicket}>Link Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}