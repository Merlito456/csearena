import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Zap, Search, Target, Brain, History, ArrowRight } from "lucide-react";
import { Category, QuizMode } from "@/types";

interface LooksfamArenaProps {
  onStartQuiz: (category: Category, difficulty: string, mode?: QuizMode) => void;
}

export function LooksfamArena({ onStartQuiz }: LooksfamArenaProps) {
  const arenaModes = [
    { 
      id: "blitz", 
      title: "Pattern Blitz", 
      description: "30 questions in 10 minutes. Focus on speed.",
      icon: Zap,
      category: "General Information" as Category,
      difficulty: "Moderate"
    },
    { 
      id: "classics", 
      title: "Historical Classics", 
      description: "Master the questions that appear every year.",
      icon: History,
      category: "Verbal Reasoning" as Category,
      difficulty: "Easy"
    },
    { 
      id: "tricky", 
      title: "Tricky Patterns", 
      description: "Commonly confused questions and distractors.",
      icon: Target,
      category: "Logic" as Category,
      difficulty: "Hard"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Looksfam Arena</h2>
        <p className="text-muted-foreground">Train pattern recognition of frequently repeated exam questions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {arenaModes.map((mode) => (
          <Card key={mode.id} className="border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 transition-colors cursor-pointer group" onClick={() => onStartQuiz(mode.category, mode.difficulty, 'looksfam')}>
            <CardHeader>
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-2">
                <mode.icon className="w-5 h-5 text-indigo-600" />
              </div>
              <CardTitle className="text-lg">{mode.title}</CardTitle>
              <CardDescription>{mode.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="ghost" className="w-full justify-between text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                Enter Arena <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-indigo-500/20 bg-indigo-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-700">
            <Eye className="w-5 h-5" />
            Recognition Engine Stats
          </CardTitle>
          <CardDescription>Your pattern familiarity metrics from the database.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background rounded-xl border border-indigo-100">
              <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Familiarity Score</p>
              <p className="text-2xl font-bold text-indigo-600">85%</p>
              <p className="text-[10px] text-green-600 mt-1">+5% from last week</p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-indigo-100">
              <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Avg. Recognition</p>
              <p className="text-2xl font-bold text-blue-600">0.8s</p>
              <p className="text-[10px] text-blue-600 mt-1">Top 5% of users</p>
            </div>
            <div className="p-4 bg-background rounded-xl border border-indigo-100">
              <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Patterns Mastered</p>
              <p className="text-2xl font-bold text-purple-600">1,240</p>
              <p className="text-[10px] text-purple-600 mt-1">Out of 5,000+ in DB</p>
            </div>
          </div>

          <div className="p-4 bg-indigo-600/10 rounded-xl border border-indigo-200">
            <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-indigo-700">Arena Workflow</h4>
            <ul className="text-sm space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>System selects frequently repeated exam patterns and high-frequency DB questions.</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>Rapid-fire session: Minimal explanations, focus on "Gut Feel" and recognition.</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
