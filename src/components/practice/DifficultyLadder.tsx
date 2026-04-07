import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, ArrowRight, Lock, CheckCircle2, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Category, QuizMode } from "@/types";
import { Badge } from "@/components/ui/badge";

interface DifficultyLadderProps {
  onStartQuiz: (category: Category, difficulty: string, mode?: QuizMode) => void;
}

export function DifficultyLadder({ onStartQuiz }: DifficultyLadderProps) {
  const levels = [
    { id: 1, title: "Level 1: Easy", difficulty: "Easy", status: "Completed", color: "text-green-600", bgColor: "bg-green-50", description: "Foundational concepts and simple patterns." },
    { id: 2, title: "Level 2: Moderate", difficulty: "Moderate", status: "Active", color: "text-blue-600", bgColor: "bg-blue-50", description: "Standard board exam level questions." },
    { id: 3, title: "Level 3: Hard", difficulty: "Hard", status: "Locked", color: "text-orange-600", bgColor: "bg-orange-50", description: "Complex scenarios and multi-step logic." },
    { id: 4, title: "Level 4: Elite", difficulty: "Elite", status: "Locked", color: "text-red-600", bgColor: "bg-red-50", description: "Topnotcher-tier challenges. Extremely difficult." },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight text-emerald-900">Difficulty Ladder</h2>
        <p className="text-muted-foreground">Progressive challenges that adapt to your mastery.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          {levels.map((level) => (
            <Card key={level.id} className={cn(
              "transition-all border-emerald-500/10",
              level.status === "Active" ? "ring-2 ring-emerald-500 border-emerald-500/20 shadow-lg" : "opacity-70 grayscale-[0.5]"
            )}>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl shrink-0", level.bgColor, level.color)}>
                    {level.id}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-lg">{level.title}</h4>
                      {level.status === "Completed" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      {level.status === "Locked" && <Lock className="w-4 h-4 text-muted-foreground" />}
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{level.description}</p>
                    
                    {level.status === "Active" && (
                      <Button 
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" 
                        onClick={() => onStartQuiz('Numerical Reasoning', level.difficulty, 'ladder')}
                      >
                        Start Level {level.id} <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          <Card className="border-emerald-500/20 bg-emerald-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <Trophy className="w-5 h-5" />
                Ladder Workflow
              </CardTitle>
              <CardDescription>How to climb the ranks.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-background rounded-xl border border-emerald-200">
                <ul className="text-sm space-y-4 text-muted-foreground">
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs">1</div>
                    <div>
                      <p className="font-bold text-emerald-900">Master the Basics</p>
                      <p>Complete Level 1 with at least 85% accuracy to unlock Level 2.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs">2</div>
                    <div>
                      <p className="font-bold text-emerald-900">Climb the Ranks</p>
                      <p>Each level introduces more complex logic and tighter time limits.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs">3</div>
                    <div>
                      <p className="font-bold text-emerald-900">Elite Status</p>
                      <p>Reach Level 4 to prove you're ready for the top 1% of board examinees.</p>
                    </div>
                  </li>
                </ul>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Overall Mastery</span>
                    <span className="font-bold text-emerald-600">35%</span>
                  </div>
                  <div className="h-2 w-full bg-emerald-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: '35%' }} />
                  </div>
                </div>

                <div className="p-4 bg-background rounded-xl border border-emerald-100 space-y-2">
                  <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Status</h5>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Level 2: Moderate</p>
                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">Active</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
