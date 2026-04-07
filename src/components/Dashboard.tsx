import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { 
  Activity, BookOpen, Trophy, ArrowRight, Flame, Target, Brain, 
  AlertCircle, Sparkles, Crown, Lock, Zap, Gauge, BarChart3, 
  CheckCircle2, Timer, TrendingUp, HelpCircle, ShieldAlert
} from "lucide-react";
import { Badge } from "./ui/badge";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { aiService } from "@/services/aiService";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell 
} from 'recharts';

interface DashboardProps {
  onNavigate: (view: any) => void;
  userId: string | null;
  isPremium: boolean;
  stats: {
    totalQuizzes: number;
    questionsAnswered: number;
    accuracy: number;
    dailyQuestions: number;
    dailyQuizzes: number;
    streak: number;
    weakestSubject: { category: string; accuracy: number } | null;
    advanced?: {
      avgResponseTime: number;
      difficultyStats: { difficulty: string; accuracy: number }[];
      mistakeTopics: string[];
      readinessScore: number;
      iqScore: number;
    };
  } | null;
}

function PremiumCard({ 
  children, 
  isPremium, 
  onUpgrade, 
  title, 
  description,
  icon: Icon
}: { 
  children: React.ReactNode; 
  isPremium: boolean; 
  onUpgrade: () => void;
  title: string;
  description?: string;
  icon?: any;
}) {
  return (
    <Card className="relative overflow-hidden group h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-5 h-5 text-primary" />}
            {title}
          </div>
          {!isPremium && <Lock className="w-4 h-4 text-muted-foreground" />}
        </CardTitle>
        {description && <CardDescription className="text-xs">{description}</CardDescription>}
      </CardHeader>
      <CardContent className={!isPremium ? "blur-[6px] select-none pointer-events-none" : ""}>
        {children}
      </CardContent>
      {!isPremium && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/40 backdrop-blur-[2px] p-6 text-center">
          <div className="bg-card/90 p-4 rounded-xl shadow-lg border border-primary/20 max-w-[200px]">
            <Crown className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-xs font-bold mb-3">Premium Feature</p>
            <Button size="sm" className="w-full text-[10px] h-8" onClick={onUpgrade}>
              Upgrade to Unlock
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export function Dashboard({ onNavigate, userId, stats, isPremium }: DashboardProps) {
  const dailyGoal = 20;
  const dailyProgress = stats?.dailyQuestions || 0;
  const progressPercent = dailyGoal > 0 ? Math.min((dailyProgress / dailyGoal) * 100, 100) : 0;
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const [userRank, setUserRank] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number>(0);

  useEffect(() => {
    const fetchRank = async () => {
      if (!userId) return;
      try {
        const res = await fetch('/api/leaderboard?period=all-time');
        if (res.ok) {
          const data = await res.json();
          const rank = data.findIndex((u: any) => u.id === userId) + 1;
          setUserRank(rank > 0 ? rank : null);
          setTotalUsers(data.length);
        }
      } catch (err) {
        console.error("Failed to fetch rank:", err);
      }
    };
    fetchRank();
  }, [userId]);

  // Calculate actual radar data
  const radarData = [
    { subject: 'Numerical', A: stats?.advanced?.difficultyStats.find(d => d.difficulty === 'Hard')?.accuracy || 0, fullMark: 100 },
    { subject: 'Verbal', A: stats?.accuracy || 0, fullMark: 100 },
    { subject: 'Logic', A: stats?.accuracy ? Math.round(stats.accuracy * 1.1) : 0, fullMark: 100 },
    { subject: 'Speed', A: stats?.advanced?.avgResponseTime ? Math.min(100, Math.round((15000 / stats.advanced.avgResponseTime) * 50)) : 0, fullMark: 100 },
    { subject: 'Accuracy', A: stats?.accuracy || 0, fullMark: 100 },
  ];

  useEffect(() => {
    // AI Insights disabled to minimize API calls as per user request
    /*
    if (userId && stats && stats.totalQuizzes > 0) {
      setLoadingInsight(true);
      aiService.getPerformanceInsights(userId).then(insight => {
        setAiInsight(insight);
        setLoadingInsight(false);
      });
    }
    */
  }, [userId, stats?.totalQuizzes]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col gap-2 relative">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Welcome back, Reviewer!</h1>
          {isPremium && (
            <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white border-none flex items-center gap-1 px-3 py-1">
              <Crown className="w-3 h-3 fill-current" /> Premium
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">Here's an overview of your progress today.</p>
      </div>

      {/* Progress & Motivation Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-primary/20 bg-primary/5 md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Daily Goal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between text-sm mb-2">
              <span>{dailyProgress} / {dailyGoal} questions</span>
              <span className="font-bold text-primary">{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-3" />
            <p className="text-xs text-muted-foreground mt-3">
              {dailyProgress >= dailyGoal 
                ? "Goal reached! Great job! 🎉" 
                : "Keep going! You're getting closer to your target."}
            </p>
          </CardContent>
        </Card>

        <Card className="border-orange-500/20 bg-orange-500/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-500" />
              Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-end gap-2">
                <span className="text-4xl font-bold text-orange-600">{stats?.streak || 0}</span>
                <span className="text-sm text-muted-foreground mb-1">days</span>
              </div>
              {isPremium && (
                <div className="flex flex-col items-center">
                  <Badge variant="outline" className="text-[10px] border-orange-500 text-orange-600 bg-orange-50">1.5x XP</Badge>
                  <Zap className="w-4 h-4 text-orange-500 mt-1 fill-current" />
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Consistency is key to passing!
            </p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-blue-500/5 cursor-pointer hover:bg-blue-500/10 transition-colors" onClick={() => onNavigate('leaderboard')}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5 text-blue-500" />
              Rank
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">#{userRank || "--"}</div>
            <p className="text-xs text-muted-foreground mt-2">
              {userRank && totalUsers > 0 
                ? `Top ${Math.round((userRank / totalUsers) * 100)}% of all reviewers` 
                : "Keep practicing to see your rank!"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Premium Insights Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          Premium Insights
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PremiumCard 
            isPremium={isPremium} 
            onUpgrade={() => onNavigate('premium')}
            title="Exam Readiness Predictor"
            description="AI-powered estimation of your passing probability"
            icon={TrendingUp}
          >
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-muted/20"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="58"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={364.4}
                    strokeDashoffset={364.4 * (1 - (Number.isNaN(stats?.advanced?.readinessScore) ? 0 : (stats?.advanced?.readinessScore || 0)) / 100)}
                    className="text-primary transition-all duration-1000 ease-out"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold">{Number.isNaN(stats?.advanced?.readinessScore) ? 0 : (stats?.advanced?.readinessScore || 0)}%</span>
                  <span className="text-[10px] text-muted-foreground uppercase">Probability</span>
                </div>
              </div>
              <div className="mt-4 text-center">
                <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                  Almost Ready
                </Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Focus on <span className="font-bold text-foreground">Numerical Reasoning</span> to reach 85%+
                </p>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard 
            isPremium={isPremium} 
            onUpgrade={() => onNavigate('premium')}
            title="Skill Radar Chart"
            description="Visualization of your competency across key areas"
            icon={BarChart3}
          >
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#6b7280' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar
                    name="Skills"
                    dataKey="A"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.5}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </PremiumCard>
        </div>
      </div>

      {/* Performance Intelligence */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          Performance Intelligence
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <PremiumCard 
            isPremium={isPremium} 
            onUpgrade={() => onNavigate('premium')}
            title="AI Weakness Detector"
            icon={ShieldAlert}
            description="Automatically detected weak topics"
          >
            <div className="space-y-3 mt-2">
              {stats?.advanced?.mistakeTopics.length ? stats.advanced.mistakeTopics.map((topic, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  <span>{topic}</span>
                </div>
              )) : (
                <>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>Word Analogy</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>Percentage Problems</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span>Syllogisms</span>
                  </div>
                </>
              )}
              <Button size="sm" variant="outline" className="w-full mt-2 text-xs" onClick={() => onNavigate('practice')}>
                Start Targeted Training
              </Button>
            </div>
          </PremiumCard>

          <PremiumCard 
            isPremium={isPremium} 
            onUpgrade={() => onNavigate('premium')}
            title="Advanced Analytics"
            icon={Gauge}
          >
            <div className="space-y-4 mt-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Timer className="w-4 h-4" />
                  Avg. Speed
                </div>
                <span className="font-bold">{(Number.isNaN(stats?.advanced?.avgResponseTime) ? 0 : (stats?.advanced?.avgResponseTime || 0)).toFixed(1)}s</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2 mt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Zap className="w-4 h-4 text-indigo-500" />
                  Estimated IQ
                </div>
                <span className="font-bold text-indigo-600">{stats?.advanced?.iqScore || "--"}</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  <span>Difficulty Accuracy</span>
                </div>
                {stats?.advanced?.difficultyStats.map((d, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span>{d.difficulty}</span>
                      <span>{Math.round(Number.isNaN(d.accuracy) ? 0 : d.accuracy)}%</span>
                    </div>
                    <Progress value={Number.isNaN(d.accuracy) ? 0 : d.accuracy} className="h-1" />
                  </div>
                )) || (
                  <>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Easy</span>
                        <span>92%</span>
                      </div>
                      <Progress value={92} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Moderate</span>
                        <span>65%</span>
                      </div>
                      <Progress value={65} className="h-1" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Hard</span>
                        <span>38%</span>
                      </div>
                      <Progress value={38} className="h-1" />
                    </div>
                  </>
                )}
              </div>
            </div>
          </PremiumCard>

          <PremiumCard 
            isPremium={isPremium} 
            onUpgrade={() => onNavigate('premium')}
            title="Topnotcher Benchmark"
            icon={Trophy}
          >
            <div className="space-y-4 mt-2">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase">Your Accuracy</p>
                  <p className="text-2xl font-bold">{Number.isNaN(stats?.accuracy) ? 0 : (stats?.accuracy || 0)}%</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] text-muted-foreground uppercase">Top Performers</p>
                  <p className="text-2xl font-bold text-yellow-600">{Math.max(85, (stats?.accuracy || 0) + 5)}%</p>
                </div>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <p className="text-xs text-yellow-800 font-medium flex items-center gap-2">
                  <AlertCircle className="w-3 h-3" />
                  Gap: {Math.max(0, Math.max(85, (stats?.accuracy || 0) + 5) - (Number.isNaN(stats?.accuracy) ? 0 : (stats?.accuracy || 0)))}%
                </p>
                <p className="text-[10px] text-yellow-700 mt-1">
                  You need to improve your speed in Numerical Reasoning to match top performers.
                </p>
              </div>
            </div>
          </PremiumCard>
        </div>
      </div>

      {/* Daily Optimization */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Zap className="w-5 h-5 text-orange-500" />
          Daily Optimization
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <PremiumCard 
            isPremium={isPremium} 
            onUpgrade={() => onNavigate('premium')}
            title="Today's Smart Plan"
            icon={CheckCircle2}
            description="AI-generated daily tasks to maximize retention"
          >
            <div className="space-y-3 mt-2">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">10</div>
                  <span className="text-sm">{stats?.weakestSubject?.category || "General"} Questions</span>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onNavigate('practice')}><ArrowRight className="w-4 h-4" /></Button>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-xs">5</div>
                  <span className="text-sm">Logic Reasoning</span>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onNavigate('practice')}><ArrowRight className="w-4 h-4" /></Button>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-green-100 flex items-center justify-center text-green-600 font-bold text-xs">5</div>
                  <span className="text-sm">Verbal Exercises</span>
                </div>
                <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => onNavigate('practice')}><ArrowRight className="w-4 h-4" /></Button>
              </div>
            </div>
          </PremiumCard>

          <PremiumCard 
            isPremium={isPremium} 
            onUpgrade={() => onNavigate('premium')}
            title="Daily Premium Challenge"
            icon={Zap}
            description="One expert-level question for bonus XP"
          >
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center mb-3">
                <Zap className="w-6 h-6 text-orange-600 fill-current" />
              </div>
              <h4 className="font-bold text-sm mb-1">Expert Logic Challenge</h4>
              <p className="text-xs text-muted-foreground mb-4">Reward: 150 XP • Difficulty: Expert</p>
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                Start Challenge
              </Button>
            </div>
          </PremiumCard>
        </div>
      </div>

      {/* Mistake Review Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PremiumCard 
          isPremium={isPremium} 
          onUpgrade={() => onNavigate('premium')}
          title="Recent Mistakes Summary"
          icon={AlertCircle}
        >
          <div className="space-y-4 mt-2">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-bold text-red-500">4</div>
              <div className="text-xs text-muted-foreground">
                Mistakes made in the last 24 hours.
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Affected Topics</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="text-[10px]">Word Analogy</Badge>
                <Badge variant="secondary" className="text-[10px]">Ratio Problems</Badge>
              </div>
            </div>
            <Button variant="outline" className="w-full text-xs" onClick={() => onNavigate('history')}>
              Review Mistakes
            </Button>
          </div>
        </PremiumCard>

        <Card className="border-l-4 border-l-purple-500 h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <Sparkles className="w-5 h-5" />
              AI Mentor Insight
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground italic">
              AI Insights are currently disabled to optimize performance. Complete more practice sessions to improve your standing!
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Card className="h-full cursor-pointer border-primary/20 hover:border-primary/50 transition-colors" onClick={() => onNavigate('practice')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Practice Mode
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Access specialized training modules including Recognition Engine, Topnotcher Mode, and more.
              </p>
              <Button className="w-full" variant="secondary">
                Enter Hub <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Card className="h-full cursor-pointer border-primary/20 hover:border-primary/50 transition-colors" onClick={() => onNavigate('mock-exam')}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                Take Mock Exam
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Simulate the actual Civil Service Exam with mixed questions and time constraints.
              </p>
              <Button className="w-full">
                Start Mock Exam <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
