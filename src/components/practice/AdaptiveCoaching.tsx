import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, MessageSquare, Target, ArrowRight, Sparkles, Zap, BookOpen, Clock, TrendingUp } from "lucide-react";
import { Category, QuizMode } from "@/types";

interface AdaptiveCoachingProps {
  onStartQuiz: (category: Category, difficulty: string, mode?: QuizMode) => void;
}

export function AdaptiveCoaching({ onStartQuiz }: AdaptiveCoachingProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Adaptive Coaching</h2>
        <p className="text-muted-foreground">Personalized training that adapts to your performance history.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Coaching Workflow
            </CardTitle>
            <CardDescription>How the AI builds your personalized session.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-background rounded-xl border border-primary/10">
              <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-primary">Workflow</h4>
              <ul className="text-sm space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>System reads mistake history, weak topics, and response times.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>AI builds custom session: 60% weak topics, 30% moderate, 10% review.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  <span>After session, the system updates your profile and adjusts future difficulty.</span>
                </li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-background rounded-xl border space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                  <TrendingUp className="w-3 h-3 text-blue-500" /> Improvement Trend
                </div>
                <p className="text-sm font-bold">+12% this week</p>
              </div>
              <div className="p-4 bg-background rounded-xl border space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold uppercase text-muted-foreground">
                  <Zap className="w-3 h-3 text-yellow-500" /> Next Module
                </div>
                <p className="text-sm font-bold">Difficulty Ladder</p>
              </div>
            </div>

            <Button className="w-full" onClick={() => onStartQuiz('General Information', 'Moderate', 'coaching')}>
              Start Personalized Session <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary" />
                Ask Coach
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Ask questions about specific topics or exam strategies.</p>
              <Button variant="outline" size="sm" className="w-full">Open Chat</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                Study Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-3">Your generated study schedule for the next 7 days.</p>
              <Button variant="outline" size="sm" className="w-full">View Plan</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
