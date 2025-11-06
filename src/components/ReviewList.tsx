import { Star, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Review } from '@/hooks/useReviews';
import { useAuth } from '@/components/auth/AuthProvider';
import { format } from 'date-fns';
import { uk } from 'date-fns/locale';

interface ReviewListProps {
  reviews: Review[];
  averageRating: number;
  onDeleteReview: (reviewId: string) => void;
}

const ReviewList = ({ reviews, averageRating, onDeleteReview }: ReviewListProps) => {
  const { user } = useAuth();

  if (reviews.length === 0) {
    return (
      <div className="text-center p-8 border border-border rounded-lg bg-muted/20">
        <p className="text-muted-foreground">Поки що немає відгуків</p>
        <p className="text-sm text-muted-foreground mt-2">Будьте першим, хто залишить відгук!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Average Rating */}
      <div className="flex items-center gap-4 p-6 border border-border rounded-lg bg-card">
        <div className="text-center">
          <div className="text-4xl font-bold text-primary">{averageRating.toFixed(1)}</div>
          <div className="flex gap-0.5 mt-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.round(averageRating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                }`}
              />
            ))}
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          на основі {reviews.length} {reviews.length === 1 ? 'відгуку' : 'відгуків'}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="p-6 border border-border rounded-lg bg-card space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={review.avatar_url || undefined} />
                  <AvatarFallback>{review.username?.[0]?.toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{review.username || 'Користувач'}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(review.created_at), 'd MMMM yyyy', { locale: uk })}
                  </div>
                </div>
              </div>
              
              {user?.id === review.user_id && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDeleteReview(review.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-5 w-5 ${
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>

            {review.comment && (
              <p className="text-muted-foreground leading-relaxed">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewList;
