import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Crown, Medal, ArrowRight, Target } from "lucide-react";
import { Category, QuizMode } from "@/types";

interface TopnotcherModeProps {
  onStartQuiz: (category: Category, difficulty: string, mode?: QuizMode) => void;
}

export function TopnotcherMode({ onStartQuiz }: TopnotcherModeProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Topnotcher Mode</h2>
        <p className="text-muted-foreground">Train with the hardest exam-level questions from our database.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Crown className="w-6 h-6" />
              Elite Training Workflow
            </CardTitle>
            <CardDescription>High-difficulty database items with strict time limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-background rounded-xl border border-yellow-200">
              <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-yellow-700">Workflow</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                  <span>System filters for Hard difficulty and high fail-rate questions.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                  <span>Intense 10–20 question session with active timer.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-1.5 shrink-0" />
                  <span>Unlock the "Topnotcher" badge if you score above 85%.</span>
                </li>
              </ul>
            </div>
            
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1">
                <p className="text-xs font-bold uppercase text-yellow-700 mb-1">Percentile Rank</p>
                <p className="text-lg font-bold">Top 5%</p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-xs font-bold uppercase text-yellow-700 mb-1">Readiness %</p>
                <p className="text-lg font-bold">88%</p>
              </div>
            </div>
            <Button 
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white"
              onClick={() => onStartQuiz('Logic', 'Hard', 'topnotcher')}
            >
              Enter Elite Arena <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Precision Training
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Focus on 100% accuracy with zero margin for error using database items.</p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => onStartQuiz('Numerical Reasoning', 'Hard', 'topnotcher')}>Start Session</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Medal className="w-4 h-4 text-orange-500" />
                Speed Mastery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Answer complex database items in under 15 seconds each.</p>
              <Button variant="outline" size="sm" className="w-full" onClick={() => onStartQuiz('Verbal Reasoning', 'Hard', 'topnotcher')}>Start Session</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
