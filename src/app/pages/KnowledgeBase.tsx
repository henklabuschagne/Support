import { useState } from 'react';
import { useAppStore } from '../hooks/useAppStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Search, BookOpen, Eye, Plus, Tag } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';

export function KnowledgeBase() {
  const { knowledgeBase, departments, tags: allTags, currentUserId, actions } = useAppStore('knowledgeBase', 'currentUser', 'departments', 'tags');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newDepartment, setNewDepartment] = useState('1');
  const [newTags, setNewTags] = useState<string[]>([]);

  const filteredArticles = knowledgeBase.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesDepartment = selectedDepartment === 'all' || article.departmentId === selectedDepartment;

    return matchesSearch && matchesDepartment;
  });

  const currentArticle = knowledgeBase.find(a => a.id === selectedArticle);

  const getDepartmentName = (id: string) => departments.find(d => d.id === id)?.name || 'Unknown';

  const handleCreateArticle = () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error('Please provide both title and content');
      return;
    }

    actions.createKBArticle({
      title: newTitle,
      content: newContent,
      departmentId: newDepartment,
      tags: newTags,
      createdBy: currentUserId,
    });

    setIsCreateDialogOpen(false);
    setNewTitle('');
    setNewContent('');
    setNewDepartment('1');
    setNewTags([]);
    toast.success('Knowledge base article created successfully');
  };

  const toggleTag = (tagId: string) => {
    setNewTags(prev =>
      prev.includes(tagId) ? prev.filter(id => id !== tagId) : [...prev, tagId]
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl mb-2">Knowledge Base</h1>
          <p className="text-muted-foreground mt-2">Self-service articles and documentation</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Article
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border border-border mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map(dept => (
                <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Results count */}
      <div className="mb-4 text-sm text-muted-foreground">
        {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredArticles.length === 0 ? (
          <div className="col-span-3 text-center py-12">
            <BookOpen className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">No articles found</p>
          </div>
        ) : (
          filteredArticles.map(article => (
            <Card 
              key={article.id} 
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setSelectedArticle(article.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline" className="mb-2">
                    {getDepartmentName(article.departmentId)}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Eye className="w-4 h-4" />
                    <span>{article.views}</span>
                  </div>
                </div>
                <CardTitle className="text-lg">{article.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {article.content.replace(/[#*]/g, '').substring(0, 150)}...
                </p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.tags.slice(0, 3).map(tagId => {
                    const tag = allTags.find(t => t.id === tagId);
                    return tag ? (
                      <Badge
                        key={tagId}
                        variant="outline"
                        className="text-xs"
                        style={{ borderColor: tag.color, color: tag.color }}
                      >
                        {tag.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
                <p className="text-xs text-muted-foreground">
                  Updated {formatDate(article.updatedAt)}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Article Detail Dialog */}
      <Dialog open={selectedArticle !== null} onOpenChange={(open) => !open && setSelectedArticle(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          {currentArticle && (
            <>
              <DialogHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge variant="outline">
                    {getDepartmentName(currentArticle.departmentId)}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span>{currentArticle.views} views</span>
                  </div>
                </div>
                <DialogTitle className="text-2xl">{currentArticle.title}</DialogTitle>
                <div className="text-sm text-gray-500">
                  {currentArticle.ticketId && (
                    <span>Generated from ticket {currentArticle.ticketId} • </span>
                  )}
                  Updated {formatDate(currentArticle.updatedAt)}
                </div>
              </DialogHeader>
              <div className="py-4">
                <div className="prose prose-sm max-w-none">
                  {currentArticle.content.split('\n').map((line, index) => {
                    if (line.startsWith('# ')) {
                      return <h1 key={index} className="text-2xl font-bold mt-6 mb-3">{line.substring(2)}</h1>;
                    } else if (line.startsWith('## ')) {
                      return <h2 key={index} className="text-xl font-bold mt-5 mb-2">{line.substring(3)}</h2>;
                    } else if (line.startsWith('### ')) {
                      return <h3 key={index} className="text-lg font-bold mt-4 mb-2">{line.substring(4)}</h3>;
                    } else if (line.trim() === '') {
                      return <br key={index} />;
                    } else {
                      return <p key={index} className="mb-3 text-foreground/80">{line}</p>;
                    }
                  })}
                </div>
                {currentArticle.tags.length > 0 && (
                  <div className="mt-6 pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Tag className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground/80">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {currentArticle.tags.map(tagId => {
                        const tag = allTags.find(t => t.id === tagId);
                        return tag ? (
                          <Badge
                            key={tagId}
                            variant="outline"
                            style={{ borderColor: tag.color, color: tag.color }}
                          >
                            {tag.name}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Article Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Knowledge Base Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Article title"
              />
            </div>
            <div>
              <Label htmlFor="content">Content * (Markdown supported)</Label>
              <Textarea
                id="content"
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Write your article content here. You can use markdown formatting like # for headings, ## for subheadings, etc."
                rows={12}
              />
            </div>
            <div>
              <Label htmlFor="department">Department *</Label>
              <Select value={newDepartment} onValueChange={setNewDepartment}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {allTags.map(tag => (
                  <div key={tag.id} className="flex items-center">
                    <Checkbox
                      id={`new-tag-${tag.id}`}
                      checked={newTags.includes(tag.id)}
                      onCheckedChange={() => toggleTag(tag.id)}
                    />
                    <label
                      htmlFor={`new-tag-${tag.id}`}
                      className="ml-2 text-sm cursor-pointer px-2 py-1 rounded"
                      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
                    >
                      {tag.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateArticle}>
              Create Article
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}