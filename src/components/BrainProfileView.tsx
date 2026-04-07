import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Brain, Zap, Target, TrendingUp, Sparkles, ArrowRight, RefreshCw, Home, Shield, Search } from "lucide-react";
import { Question, Category } from "@/types";
import { Progress } from "./ui/progress";

interface BrainProfileViewProps {
  score: number;
  total: number;
  questions: Question[];
  answers: Record<string, number>;
  responseTimes: Record<string, number>;
  onRetry: () => void;
  onHome: () => void;
  onNavigateToPractice: (view: string) => void;
}

export function BrainProfileView({ 
  score, 
  total, 
  questions, 
  answers, 
  responseTimes, 
  onRetry, 
  onHome,
  onNavigateToPractice
}: BrainProfileViewProps) {
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  
  // Calculate stats per category
  const categoryStats: Record<string, { total: number; correct: number; totalTime: number }> = {};
  
  questions.forEach(q => {
    if (!categoryStats[q.category]) {
      categoryStats[q.category] = { total: 0, correct: 0, totalTime: 0 };
    }
    categoryStats[q.category].total++;
    if (answers[q.id] === q.correctAnswerIndex) {
      categoryStats[q.category].correct++;
    }
    categoryStats[q.category].totalTime += responseTimes[q.id] || 0;
  });

  const avgResponseTime = total > 0 ? Object.values(responseTimes).reduce((a, b) => a + b, 0) / total : 0;
  
  // Determine Cognitive Type
  let cognitiveType = "Analytical Thinker";
  let cognitiveDescription = "You perform best on logical reasoning problems and structured data.";
  
  if (avgResponseTime < 2 && accuracy > 80) {
    cognitiveType = "Pattern Solver";
    cognitiveDescription = "You recognize structures and number patterns faster than average.";
  } else if (accuracy > 90) {
    cognitiveType = "Precision Specialist";
    cognitiveDescription = "You prioritize accuracy and rarely make mistakes under pressure.";
  } else if (avgResponseTime < 1.5) {
    cognitiveType = "Intuitive Responder";
    cognitiveDescription = "You have very fast reflexes and rely on quick pattern recognition.";
  }

  const getSpeedLabel = (time: number) => {
    if (time < 1.5) return "⚡ Fast";
    if (time < 3) return "Moderate";
    return "Deliberate";
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="text-center space-y-2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-block p-3 rounded-full bg-primary/10 mb-2"
        >
          <Brain className="w-12 h-12 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-bold tracking-tight">Your Brain Profile</h2>
        <p className="text-muted-foreground">Cognitive analysis based on your rapid-fire performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Thinking Style Card */}
        <Card className="md:col-span-2 border-primary/20 bg-primary/5 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="w-24 h-24 text-primary" />
          </div>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-primary mb-1">Cognitive Type</p>
                <CardTitle className="text-2xl">{cognitiveType}</CardTitle>
              </div>
              <Badge className="bg-primary text-primary-foreground px-3 py-1">
                {accuracy}% Accuracy
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              {cognitiveDescription}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-3 bg-background rounded-xl border">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Recognition Speed</p>
                <p className="text-lg font-bold">{getSpeedLabel(avgResponseTime)}</p>
                <p className="text-[10px] text-muted-foreground">{avgResponseTime.toFixed(1)}s avg</p>
              </div>
              <div className="p-3 bg-background rounded-xl border">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Logical Processing</p>
                <p className="text-lg font-bold">Strong</p>
              </div>
              <div className="p-3 bg-background rounded-xl border">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Verbal Processing</p>
                <p className="text-lg font-bold">Moderate</p>
              </div>
              <div className="p-3 bg-background rounded-xl border">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Memory Recall</p>
                <p className="text-lg font-bold">Weak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Strength Map</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(categoryStats).map(([cat, stat]) => {
              const catAcc = Math.round((stat.correct / stat.total) * 100);
              const catTime = stat.totalTime / stat.total;
              
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium truncate max-w-[120px]">{cat}</span>
                    <span className={(Number.isNaN(catAcc) ? 0 : catAcc) >= 80 ? "text-emerald-600" : (Number.isNaN(catAcc) ? 0 : catAcc) >= 50 ? "text-yellow-600" : "text-red-600"}>
                      {Number.isNaN(catAcc) ? 0 : catAcc}%
                    </span>
                  </div>
                  <Progress value={Number.isNaN(catAcc) ? 0 : catAcc} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground text-right">{(Number.isNaN(catTime) ? 0 : catTime).toFixed(1)}s avg</p>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Adaptive Recommendations */}
        <Card className="border-indigo-500/20 bg-indigo-500/5">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-600" />
              Recommended Modules
            </CardTitle>
            <CardDescription>Based on your cognitive profile, we suggest these practice paths.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-background rounded-xl border group cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => onNavigateToPractice('looksfam')}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm font-bold">LooksFam Arena</p>
                  <p className="text-[10px] text-muted-foreground">Improve pattern familiarity</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-indigo-600 transition-colors" />
            </div>

            <div className="flex items-center justify-between p-3 bg-background rounded-xl border group cursor-pointer hover:border-indigo-300 transition-colors" onClick={() => onNavigateToPractice('ladder')}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold">Difficulty Ladder</p>
                  <p className="text-[10px] text-muted-foreground">Scale your expertise gradually</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-emerald-600 transition-colors" />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col gap-4 justify-center">
          <Button size="lg" className="w-full h-14 text-lg font-bold" onClick={onRetry}>
            <RefreshCw className="w-5 h-5 mr-2" />
            Retry Diagnostic
          </Button>
          <Button size="lg" variant="outline" className="w-full h-14 text-lg font-bold" onClick={onHome}>
            <Home className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
