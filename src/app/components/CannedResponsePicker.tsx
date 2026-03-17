import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Input } from './ui/input';
import { MessageSquareText, Search } from 'lucide-react';
import { CannedResponse } from '../types';
import { Badge } from './ui/badge';

interface CannedResponsePickerProps {
  responses: CannedResponse[];
  onSelect: (response: CannedResponse) => void;
}

export function CannedResponsePicker({ responses, onSelect }: CannedResponsePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredResponses = responses.filter(response =>
    response.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    response.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (response: CannedResponse) => {
    onSelect(response);
    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
      >
        <MessageSquareText className="w-4 h-4 mr-2" />
        Canned Response
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Canned Response</DialogTitle>
          </DialogHeader>
          
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search responses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredResponses.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground">No responses found</p>
            ) : (
              filteredResponses.map(response => (
                <div
                  key={response.id}
                  onClick={() => handleSelect(response)}
                  className="p-4 border border-border rounded-lg hover:border-brand-primary hover:bg-brand-primary-light/50 cursor-pointer transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-foreground">{response.name}</h3>
                    {response.subject && (
                      <Badge variant="outline" className="text-xs">Has Subject</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 whitespace-pre-wrap">
                    {response.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}