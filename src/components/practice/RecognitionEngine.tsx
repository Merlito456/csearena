import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, Search, Target, Brain } from "lucide-react";
import { Category, QuizMode } from "@/types";

interface RecognitionEngineProps {
  onStartQuiz: (category: Category, difficulty: string, mode?: QuizMode) => void;
}

export function RecognitionEngine({ onStartQuiz }: RecognitionEngineProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold tracking-tight">Recognition Engine</h2>
        <p className="text-muted-foreground">Detect how you recognize patterns in questions through rapid-fire analysis.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary" />
              Cognitive Pattern Analysis
            </CardTitle>
            <CardDescription>The engine tracks your reaction time, first-answer accuracy, and hesitation patterns.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-background rounded-xl border border-primary/10">
              <h4 className="font-bold text-sm mb-2 uppercase tracking-wider text-primary">Workflow</h4>
              <ul className="text-sm space-y-3 text-muted-foreground">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="font-bold text-foreground">Diagnostic Start</p>
                    <p className="text-xs">System loads 10–15 mixed questions to measure pattern recognition speed.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="font-bold text-foreground">Rapid Fire Session</p>
                    <p className="text-xs">10–15 seconds per question. Immediate auto-advance after selection.</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="font-bold text-foreground">Brain Profile Generation</p>
                    <p className="text-xs">Engine analyzes reaction time, accuracy, and hesitation points to generate your cognitive profile.</p>
                  </div>
                </li>
              </ul>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-background rounded-xl border flex items-center gap-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Avg. Speed</p>
                  <p className="text-xl font-bold">1.2s/q</p>
                </div>
              </div>
              <div className="p-4 bg-background rounded-xl border flex items-center gap-4">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase font-bold">Pattern Accuracy</p>
                  <p className="text-xl font-bold">92%</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="text-lg">Start Diagnostic</CardTitle>
            <CardDescription>Select your focus area.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex-1">
            <Button className="w-full justify-start gap-3 h-12" variant="outline" onClick={() => onStartQuiz('Numerical Reasoning', 'Moderate', 'recognition')}>
              <Search className="w-4 h-4" /> Numerical Focus
            </Button>
            <Button className="w-full justify-start gap-3 h-12" variant="outline" onClick={() => onStartQuiz('Verbal Reasoning', 'Moderate', 'recognition')}>
              <Search className="w-4 h-4" /> Verbal Focus
            </Button>
            <div className="pt-4 mt-4 border-t">
              <Button className="w-full h-14 text-lg font-bold" onClick={() => onStartQuiz('Logic', 'Moderate', 'recognition')}>
                <Zap className="w-5 h-5 mr-2 fill-current" /> Full Diagnostic
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

