import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Zap, Clock, Brain, Calculator, BookOpen, Trophy, Flame, Star, ArrowRight } from "lucide-react";
import { storageService } from "@/services/storageService";
import { motion } from "motion/react";

interface MiniQuizViewProps {
  onBack: () => void;
  onNavigate: (view: any) => void;
  onStartQuiz: (type: string, config: any) => void;
  userId: string | null;
  isPremium: boolean;
}

export function MiniQuizView({ onBack, onNavigate, onStartQuiz, userId, isPremium }: MiniQuizViewProps) {
  const [stats, setStats] = useState({
    completed: 0,
    accuracy: 0,
    streak: 0
  });

  useEffect(() => {
    if (!userId) return;
    try {
      const data = storageService.getStats(userId);
      setStats({
        completed: data.totalQuizzes || 0,
        accuracy: data.accuracy || 0,
        streak: data.streak || 0
      });
    } catch (err) {
      console.error("Failed to fetch mini quiz stats", err);
    }
  }, [userId]);
  const quizOptions = [
    {
      id: "daily",
      title: "Daily Quiz",
      description: "Today's mixed challenge",
      icon: Flame,
      color: "text-orange-500",
      bgColor: "bg-orange-100",
      questions: 5,
      time: "3 min",
      reward: "+10 XP",
      config: { category: "General Information", count: 5, difficulty: "Mixed" } // Mixed logic handled in App
    },
    {
      id: "numerical",
      title: "Numerical Sprint",
      description: "Quick math practice",
      icon: Calculator,
      color: "text-blue-500",
      bgColor: "bg-blue-100",
      questions: 5,
      time: "5 min",
      reward: "+5 XP",
      config: { category: "Numerical Reasoning", count: 5, difficulty: "Moderate" }
    },
    {
      id: "verbal",
      title: "Verbal Booster",
      description: "Grammar & vocabulary",
      icon: BookOpen,
      color: "text-green-500",
      bgColor: "bg-green-100",
      questions: 5,
      time: "3 min",
      reward: "+5 XP",
      config: { category: "Verbal Reasoning", count: 5, difficulty: "Moderate" }
    },
    {
      id: "ai-smart",
      title: "AI Smart Quiz",
      description: "Based on your mistakes",
      icon: Brain,
      color: "text-purple-500",
      bgColor: "bg-purple-100",
      questions: 5,
      time: "Adaptive",
      reward: "+15 XP",
      badge: "PRO",
      isPremium: true,
      config: { category: "Logic", count: 5, difficulty: "Adaptive" } // Logic placeholder, real AI logic in App
    }
  ];

  const handleQuizClick = (quiz: any) => {
    if (quiz.isPremium && !isPremium) {
      onNavigate('premium');
      return;
    }
    onStartQuiz(quiz.id, quiz.config);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Zap className="w-6 h-6 text-yellow-500" />
          Mini Quizzes
        </h2>
        <div className="flex items-center gap-2 bg-muted/50 px-3 py-1 rounded-full text-sm font-medium">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span>120 XP</span>
        </div>
      </div>

      {/* Performance Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-bold text-green-600">{Number.isNaN(stats.accuracy) ? 0 : stats.accuracy}%</div>
            <p className="text-xs text-muted-foreground">Avg. Score</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
            <div className="text-2xl font-bold text-orange-500">{stats.streak}</div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {quizOptions.map((quiz, index) => (
          <motion.div
            key={quiz.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:border-primary/50 transition-all cursor-pointer group" onClick={() => handleQuizClick(quiz)}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${quiz.bgColor} ${quiz.isPremium && !isPremium ? 'grayscale opacity-50' : ''}`}>
                    <quiz.icon className={`w-6 h-6 ${quiz.color}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold flex items-center gap-2">
                      {quiz.title}
                      {quiz.badge && <Badge variant={quiz.isPremium && !isPremium ? "outline" : "secondary"} className="text-[10px] h-5">{quiz.badge}</Badge>}
                    </CardTitle>
                    <CardDescription className="text-xs">{quiz.description}</CardDescription>
                  </div>
                </div>
                {quiz.id === 'daily' && (
                  <Badge className="bg-orange-500 hover:bg-orange-600">New</Badge>
                )}
              </CardHeader>
              <CardContent className={`pb-2 ${quiz.isPremium && !isPremium ? 'opacity-50' : ''}`}>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                  <div className="flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    {quiz.questions} Qs
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {quiz.time}
                  </div>
                  <div className="flex items-center gap-1 text-yellow-600 font-medium ml-auto">
                    <Star className="w-3 h-3 fill-current" />
                    {quiz.reward}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-2">
                <Button className="w-full group-hover:bg-primary/90" size="sm" variant={quiz.isPremium && !isPremium ? "outline" : "default"}>
                  {quiz.isPremium && !isPremium ? "Unlock Pro" : "Start Quiz"} 
                  {!(quiz.isPremium && !isPremium) && <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function Target(props: any) {
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
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}
