import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface ReviewFormProps {
  onSubmit: (rating: number, comment: string) => Promise<boolean>;
}

const ReviewForm = ({ onSubmit }: ReviewFormProps) => {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setSubmitting(true);
    const success = await onSubmit(rating, comment);
    if (success) {
      setRating(0);
      setComment('');
    }
    setSubmitting(false);
  };

  if (!user) {
    return (
      <div className="text-center p-6 border border-border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Увійдіть, щоб залишити відгук</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 border border-border rounded-lg bg-card">
      <h3 className="text-lg font-semibold">Залишити відгук</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Оцінка</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                className={`h-8 w-8 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="text-sm font-medium">
          Коментар
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Поділіться своїми враженнями..."
          rows={4}
          className="resize-none"
        />
      </div>

      <Button type="submit" disabled={rating === 0 || submitting} className="w-full">
        {submitting ? 'Відправка...' : 'Залишити відгук'}
      </Button>
    </form>
  );
};

export default ReviewForm;
