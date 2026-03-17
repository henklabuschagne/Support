import { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Star, ThumbsUp } from 'lucide-react';
import { toast } from 'sonner';

interface SatisfactionRatingProps {
  ticketId: string;
  currentRating?: number;
  currentComment?: string;
  onRate: (rating: number, comment?: string) => void;
}

export function SatisfactionRating({ ticketId, currentRating, currentComment, onRate }: SatisfactionRatingProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(currentRating || 0);
  const [comment, setComment] = useState(currentComment || '');
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    onRate(rating, comment);
    setIsOpen(false);
    toast.success('Thank you for your feedback!');
  };

  if (currentRating) {
    return (
      <div className="p-4 bg-brand-success-light border border-brand-success-mid rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <ThumbsUp className="w-5 h-5 text-brand-success" />
          <span className="font-medium text-brand-success">Customer Satisfaction</span>
        </div>
        <div className="flex items-center gap-2 mb-2">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              className={`w-5 h-5 ${star <= currentRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
          <span className="text-sm text-gray-600">({currentRating}/5)</span>
        </div>
        {currentComment && (
          <p className="text-sm text-gray-700 italic">&quot;{currentComment}&quot;</p>
        )}
      </div>
    );
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <Star className="w-4 h-4 mr-2" />
        Rate This Ticket
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>How satisfied are you with this resolution?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label className="mb-2 block">Rating *</Label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    className="focus:outline-none transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="ml-2 text-sm text-gray-600">
                    {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Fair' : 'Poor'}
                  </span>
                )}
              </div>
            </div>
            <div>
              <Label htmlFor="comment">Additional Comments (Optional)</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us more about your experience..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              Submit Rating
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}