import { Trophy, Lock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useAchievements } from '@/hooks/useAchievements';

interface AchievementsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AchievementsModal = ({ open, onOpenChange }: AchievementsModalProps) => {
  const { achievements, userAchievements, loading } = useAchievements();

  const isUnlocked = (achievementId: string) => {
    return userAchievements.some(ua => ua.achievement_id === achievementId);
  };

  const getUnlockedDate = (achievementId: string) => {
    const ua = userAchievements.find(ua => ua.achievement_id === achievementId);
    return ua ? new Date(ua.unlocked_at).toLocaleDateString('uk-UA') : null;
  };

  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-6 w-6 text-primary" />
              Досягнення
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-center text-muted-foreground">Завантаження...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const unlockedCount = userAchievements.length;
  const totalCount = achievements.length;
  const progressPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-6 w-6 text-primary" />
            Досягнення
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Summary */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                Відкрито: {unlockedCount} з {totalCount}
              </span>
              <span className="font-medium">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Achievements Grid */}
          <div className="grid gap-4">
            {achievements.map((achievement) => {
              const unlocked = isUnlocked(achievement.id);
              const unlockedDate = getUnlockedDate(achievement.id);

              return (
                <div
                  key={achievement.id}
                  className={`p-4 border rounded-lg transition-all ${
                    unlocked
                      ? 'bg-card border-primary/50 shadow-sm'
                      : 'bg-muted/20 border-border opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`text-4xl ${
                        unlocked ? 'grayscale-0' : 'grayscale opacity-50'
                      }`}
                    >
                      {achievement.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-semibold text-lg flex items-center gap-2">
                            {achievement.name}
                            {!unlocked && <Lock className="h-4 w-4 text-muted-foreground" />}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>

                        {achievement.reward_balance > 0 && (
                          <Badge variant={unlocked ? 'default' : 'secondary'}>
                            +{achievement.reward_balance}₴
                          </Badge>
                        )}
                      </div>

                      {unlocked && unlockedDate && (
                        <p className="text-xs text-primary">
                          🎉 Відкрито: {unlockedDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {achievements.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Досягнення поки що не додані
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AchievementsModal;
