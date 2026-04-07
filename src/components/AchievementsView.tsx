import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Trophy, Flame, Target, BookOpen, Zap, Lock, Star, Medal, Crown, Award, Brain, Clock, Eye, Shield } from "lucide-react";
import { motion } from "motion/react";

interface AchievementsViewProps {
  onBack: () => void;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  category: "progress" | "streak" | "speed" | "accuracy" | "mastery" | "elite" | "style" | "secret";
  progress: number;
  maxProgress: number;
  completed: boolean;
  reward: string;
  color: string;
  bgColor: string;
  level?: number;
}

export function AchievementsView({ onBack }: AchievementsViewProps) {
  // Mock Data for 100+ Badge System Structure
  const achievements: Achievement[] = [
    // 1. Progress Track
    {
      id: "first-spark",
      title: "First Spark",
      description: "Complete your first quiz",
      icon: Star,
      category: "progress",
      progress: 1,
      maxProgress: 1,
      completed: true,
      reward: "+50 XP",
      color: "text-yellow-500",
      bgColor: "bg-yellow-100"
    },
    {
      id: "explorer",
      title: "Explorer",
      description: "Complete 5 quizzes",
      icon: BookOpen,
      category: "progress",
      progress: 5,
      maxProgress: 5,
      completed: true,
      reward: "+200 XP",
      color: "text-blue-500",
      bgColor: "bg-blue-100"
    },
    {
      id: "dedicated-learner",
      title: "Dedicated Learner",
      description: "Complete 25 quizzes",
      icon: Target,
      category: "progress",
      progress: 12,
      maxProgress: 25,
      completed: false,
      reward: "+500 XP",
      color: "text-purple-500",
      bgColor: "bg-purple-100"
    },
    
    // 2. Streak Track
    {
      id: "heating-up",
      title: "Heating Up",
      description: "Reach a 3-day streak",
      icon: Flame,
      category: "streak",
      progress: 3,
      maxProgress: 3,
      completed: true,
      reward: "+100 XP",
      color: "text-orange-500",
      bgColor: "bg-orange-100"
    },
    {
      id: "on-fire",
      title: "On Fire",
      description: "Reach a 7-day streak",
      icon: Flame,
      category: "streak",
      progress: 3,
      maxProgress: 7,
      completed: false,
      reward: "+300 XP",
      color: "text-red-500",
      bgColor: "bg-red-100"
    },

    // 3. Speed Track
    {
      id: "quick-thinker",
      title: "Quick Thinker",
      description: "Answer 5 questions under 10 seconds",
      icon: Zap,
      category: "speed",
      progress: 2,
      maxProgress: 5,
      completed: false,
      reward: "+150 XP",
      color: "text-yellow-500",
      bgColor: "bg-yellow-100"
    },
    {
      id: "speed-runner",
      title: "Speed Runner",
      description: "Finish mini quiz under 2 minutes",
      icon: Clock,
      category: "speed",
      progress: 1,
      maxProgress: 1,
      completed: true,
      reward: "+200 XP",
      color: "text-blue-500",
      bgColor: "bg-blue-100"
    },

    // 4. Accuracy Track
    {
      id: "sharp-shooter",
      title: "Sharp Shooter",
      description: "Achieve 80% accuracy in a quiz",
      icon: Target,
      category: "accuracy",
      progress: 1,
      maxProgress: 1,
      completed: true,
      reward: "+150 XP",
      color: "text-green-500",
      bgColor: "bg-green-100"
    },
    {
      id: "perfectionist",
      title: "Perfectionist",
      description: "Get a perfect score in any quiz",
      icon: Crown,
      category: "accuracy",
      progress: 0,
      maxProgress: 1,
      completed: false,
      reward: "+500 XP",
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },

    // 5. Subject Mastery Track
    {
      id: "number-ninja-1",
      title: "Number Ninja",
      description: "Answer 50 numerical questions",
      icon: Calculator,
      category: "mastery",
      progress: 50,
      maxProgress: 50,
      completed: true,
      reward: "Badge + 1000 XP",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      level: 1
    },
    {
      id: "number-ninja-2",
      title: "Number Ninja",
      description: "Answer 200 numerical questions",
      icon: Calculator,
      category: "mastery",
      progress: 65,
      maxProgress: 200,
      completed: false,
      reward: "Badge + 2000 XP",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      level: 2
    },
    {
      id: "logic-architect",
      title: "Logic Architect",
      description: "Master Logic & Reasoning",
      icon: Brain,
      category: "mastery",
      progress: 12,
      maxProgress: 50,
      completed: false,
      reward: "Badge + 1000 XP",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      level: 1
    },

    // 6. Elite Challenges
    {
      id: "topnotcher-candidate",
      title: "Topnotcher Candidate",
      description: "Score 85% in simulation",
      icon: Trophy,
      category: "elite",
      progress: 0,
      maxProgress: 1,
      completed: false,
      reward: "Exclusive Title",
      color: "text-yellow-500",
      bgColor: "bg-yellow-100"
    },

    // 7. Learning Style
    {
      id: "fast-thinker",
      title: "Fast Thinker",
      description: "Consistently low reaction time",
      icon: Zap,
      category: "style",
      progress: 1,
      maxProgress: 1,
      completed: true,
      reward: "Profile Tag",
      color: "text-orange-500",
      bgColor: "bg-orange-100"
    },
    {
      id: "careful-analyst",
      title: "Careful Analyst",
      description: "High accuracy but slower speed",
      icon: Eye,
      category: "style",
      progress: 0,
      maxProgress: 1,
      completed: false,
      reward: "Profile Tag",
      color: "text-indigo-500",
      bgColor: "bg-indigo-100"
    },

    // 8. Secret Badges
    {
      id: "night-owl",
      title: "Night Owl",
      description: "Take a quiz after midnight",
      icon: Star,
      category: "secret",
      progress: 1,
      maxProgress: 1,
      completed: true,
      reward: "Secret Title",
      color: "text-slate-700",
      bgColor: "bg-slate-200"
    }
  ];

  const categories = [
    { id: "all", label: "All", icon: Trophy },
    { id: "progress", label: "Progress", icon: Star },
    { id: "streak", label: "Streak", icon: Flame },
    { id: "speed", label: "Speed", icon: Zap },
    { id: "accuracy", label: "Accuracy", icon: Target },
    { id: "mastery", label: "Mastery", icon: Crown },
    { id: "elite", label: "Elite", icon: Shield },
    { id: "style", label: "Style", icon: Brain },
    { id: "secret", label: "Secret", icon: Lock },
  ];

  const completedCount = achievements.filter(a => a.completed).length;
  const totalCount = achievements.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-500" />
          Achievements
        </h2>
        <div className="text-sm font-medium text-muted-foreground">
          {completedCount} / {totalCount} Unlocked
        </div>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6 flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border-4 border-background bg-yellow-100 flex items-center justify-center shadow-lg">
              <Trophy className="w-10 h-10 text-yellow-600" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-full">
              Lvl 5
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-end">
              <div>
                <h3 className="font-bold text-lg">Achievement Hunter</h3>
                <p className="text-sm text-muted-foreground">Keep going! You're doing great.</p>
              </div>
              <div className="text-2xl font-bold text-primary">{completionPercentage}%</div>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto h-auto p-1 bg-transparent gap-2">
          {categories.map(cat => (
            <TabsTrigger 
              key={cat.id} 
              value={cat.id}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 border bg-card"
            >
              <cat.icon className="w-4 h-4 mr-2" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map(cat => (
          <TabsContent key={cat.id} value={cat.id} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {achievements
                .filter(a => cat.id === "all" || a.category === cat.id)
                .map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`transition-all ${achievement.completed ? "border-primary/50 bg-card" : "opacity-80 bg-muted/30 border-dashed"}`}>
                      <CardContent className="p-4 flex gap-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${achievement.completed ? achievement.bgColor : "bg-muted"}`}>
                          {achievement.completed ? (
                            <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                          ) : (
                            <Lock className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className={`font-bold ${achievement.completed ? "" : "text-muted-foreground"}`}>
                                {achievement.title} {achievement.level && <span className="text-xs font-normal ml-1 opacity-70">Lvl {achievement.level}</span>}
                              </h4>
                              <p className="text-xs text-muted-foreground">{achievement.description}</p>
                            </div>
                            {achievement.completed && (
                              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200">
                                Unlocked
                              </Badge>
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                              <span>Progress</span>
                              <span>{achievement.progress} / {achievement.maxProgress}</span>
                            </div>
                            <Progress 
                              value={achievement.maxProgress > 0 ? (achievement.progress / achievement.maxProgress) * 100 : 0} 
                              className={`h-2 ${achievement.completed ? "bg-muted" : "bg-muted/50"}`} 
                            />
                          </div>

                          <div className="flex items-center gap-1 text-xs font-medium text-yellow-600">
                            <Star className="w-3 h-3 fill-current" />
                            {achievement.reward}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function Calculator(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  )
}
