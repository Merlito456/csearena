import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Heart, Zap, Target, Shield, ArrowRight, Clock, AlertCircle } from "lucide-react";
import { Category, QuizMode } from "@/types";

interface PsychConditioningProps {
  onStartQuiz: (category: Category, difficulty: string, mode?: QuizMode) => void;
}

export function PsychConditioning({ onStartQuiz }: PsychConditioningProps) {
  const conditioningDrills = [
    {
      id: "endurance",
      title: "Mental Endurance",
      description: "100 questions non-stop. No breaks allowed.",
      icon: Shield,
      category: "General Information" as Category,
      difficulty: "Moderate"
    },
    {
      id: "pressure",
      title: "Pressure Cooker",
      description: "15 seconds per question. High penalty for mistakes.",
      icon: Zap,
      category: "Numerical Reasoning" as Category,
      difficulty: "Hard"
    },
    {
      id: "distraction",
      title: "Distraction Shield",
      description: "Visual and auditory distractions during the quiz.",
      icon: AlertCircle,
      category: "Verbal Reasoning" as Category,
      difficulty: "Moderate"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Psych Conditioning</h2>
        <p className="text-muted-foreground">Train mental endurance and exam stress control.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {conditioningDrills.map((drill) => (
          <Card key={drill.id} className="border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors cursor-pointer group" onClick={() => onStartQuiz(drill.category, drill.difficulty, 'psych')}>
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center mb-2">
                <drill.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <CardTitle className="text-lg">{drill.title}</CardTitle>
              <CardDescription>{drill.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-between text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                Start Drill <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Heart className="w-5 h-5" />
              Stress Resilience Metrics
            </CardTitle>
            <CardDescription>Your psychological performance data from the database.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-background rounded-xl border border-emerald-100">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Focus Score</p>
                <p className="text-2xl font-bold text-emerald-600">78%</p>
              </div>
              <div className="p-4 bg-background rounded-xl border border-emerald-100">
                <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Resilience Level</p>
                <p className="text-2xl font-bold text-blue-600">High</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-600/10 rounded-xl border border-emerald-200">
              <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-emerald-700">Conditioning Workflow</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>Session begins with timed questions and random difficulty spikes.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <span>Occasionally introduce tricky questions and misleading options.</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-500/20 bg-emerald-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-emerald-700">
              <Brain className="w-5 h-5" />
              Mental Tips
            </CardTitle>
            <CardDescription>Strategies for the actual exam day.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Clock className="w-4 h-4 text-blue-600" />
                </div>
                <p className="text-xs text-muted-foreground">The 1-minute rule: If you can't solve it in 60s, skip and return later.</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <Target className="w-4 h-4 text-orange-600" />
                </div>
                <p className="text-xs text-muted-foreground">Focus on the current question only. Don't let a previous hard item distract you.</p>
              </div>
              <div className="flex items-center gap-3 p-3 bg-background rounded-lg border">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                  <Shield className="w-4 h-4 text-purple-600" />
                </div>
                <p className="text-xs text-muted-foreground">Trust your first instinct. 70% of the time, your initial recognition is correct.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
