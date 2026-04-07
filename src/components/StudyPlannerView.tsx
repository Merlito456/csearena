import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Calendar, Target, CheckCircle2, Clock, BookOpen, ChevronRight, Settings, Sparkles } from "lucide-react";
import { Progress } from "./ui/progress";
import { motion } from "motion/react";

interface StudyPlannerViewProps {
  onBack: () => void;
  onNavigate: (view: any) => void;
  userId: string | null;
  stats: any;
  isPremium: boolean;
}

export function StudyPlannerView({ onBack, onNavigate, userId, stats, isPremium }: StudyPlannerViewProps) {
  const [examDate, setExamDate] = useState<string>("2024-08-11"); // Default mock date
  const [isGenerating, setIsGenerating] = useState(false);
  
  const categoryStats = stats?.categoryStats || [];
  const getAccuracy = (cat: string) => {
    const stat = categoryStats.find((s: any) => s.category === cat);
    if (!stat) return 0;
    return stat.total_questions > 0 ? Math.round((stat.total_score / stat.total_questions) * 100) : 0;
  };

  const overallAccuracy = stats?.accuracy || 0;
  const [goals, setGoals] = useState([
    { id: 1, text: "Complete 20 Numerical Reasoning questions", completed: false, type: "quiz" },
    { id: 2, text: "Review General Information topics", completed: true, type: "quiz" },
    { id: 3, text: "Take a Mini Mock Exam", completed: false, type: "mock" },
  ]);

  const daysLeft = Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const toggleGoal = (id: number) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const schedule = [
    { day: "Mon", focus: "Numerical Reasoning", status: "completed" },
    { day: "Tue", focus: "Verbal Reasoning", status: "active" },
    { day: "Wed", focus: "General Information", status: "upcoming" },
    { day: "Thu", focus: "Logic & Abstract", status: "upcoming" },
    { day: "Fri", focus: "Mock Exam Review", status: "upcoming" },
    { day: "Sat", focus: "Weak Areas Focus", status: "upcoming" },
    { day: "Sun", focus: "Rest / Light Review", status: "upcoming" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Study Planner
        </h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="default" 
            size="sm" 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => {
              if (!isPremium) {
                onNavigate('premium');
                return;
              }
              setIsGenerating(true);
              setTimeout(() => setIsGenerating(false), 2000);
            }}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : (
              <>
                <Sparkles className="w-4 h-4 mr-2" /> AI Smart Planner
              </>
            )}
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" /> Settings
          </Button>
        </div>
      </div>

      {/* Countdown Hero */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-lg font-semibold text-primary">Civil Service Exam Countdown</h3>
            <p className="text-muted-foreground">Target Date: {new Date(examDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{daysLeft > 0 ? daysLeft : 0}</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Days Left</div>
            </div>
            <div className="h-12 w-px bg-border hidden md:block" />
            <div className="text-center hidden md:block">
              <div className="text-4xl font-bold text-primary">{overallAccuracy}%</div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Readiness</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Daily Goals */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-green-500" />
              Today's Goals
            </CardTitle>
            <CardDescription>3 tasks remaining for today</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {goals.map((goal) => (
              <div 
                key={goal.id} 
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${goal.completed ? "bg-muted/50 border-transparent" : "bg-card hover:border-primary/50"}`}
              >
                <button 
                  onClick={() => toggleGoal(goal.id)}
                  className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${goal.completed ? "bg-green-500 border-green-500 text-white" : "border-muted-foreground hover:border-primary"}`}
                >
                  {goal.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${goal.completed ? "text-muted-foreground line-through" : ""}`}>
                    {goal.text}
                  </p>
                  <div className="flex gap-2 mt-1.5">
                    <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-secondary-foreground uppercase tracking-wide font-semibold">
                      {goal.type}
                    </span>
                  </div>
                </div>
                {!goal.completed && (
                  <Button size="sm" variant="ghost" className="h-8" onClick={() => {
                    // Logic to navigate to specific task could go here
                    if (goal.type === 'quiz') onNavigate('subjects');
                    if (goal.type === 'mock') onNavigate('mock-exam');
                  }}>
                    Start <ChevronRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Schedule Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-500" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {schedule.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <div className={`w-8 font-bold ${item.status === 'active' ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.day}
                </div>
                <div className={`flex-1 p-2 rounded border ${
                  item.status === 'active' ? 'bg-primary/5 border-primary/20 font-medium' : 
                  item.status === 'completed' ? 'bg-muted text-muted-foreground line-through' : 'border-transparent'
                }`}>
                  {item.focus}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Syllabus Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-500" />
            Syllabus Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Numerical Reasoning</span>
              <span className="font-medium">{getAccuracy("Numerical Reasoning")}%</span>
            </div>
            <Progress value={getAccuracy("Numerical Reasoning")} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Verbal Reasoning</span>
              <span className="font-medium">{getAccuracy("Verbal Reasoning")}%</span>
            </div>
            <Progress value={getAccuracy("Verbal Reasoning")} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>General Information</span>
              <span className="font-medium">{getAccuracy("General Information")}%</span>
            </div>
            <Progress value={getAccuracy("General Information")} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Logic & Abstract</span>
              <span className="font-medium">{getAccuracy("Logic")}%</span>
            </div>
            <Progress value={getAccuracy("Logic")} className="h-2" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
