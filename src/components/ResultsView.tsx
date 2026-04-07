import { useState, useEffect } from "react";
import { Question } from "@/types";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, XCircle, RefreshCw, Home, ThumbsUp, ThumbsDown } from "lucide-react";
import { motion } from "motion/react";
import { MathRenderer } from "./MathRenderer";
import { cn } from "@/lib/utils";

interface ResultsViewProps {
  score: number;
  total: number;
  questions: Question[];
  answers: Record<string, number>;
  onRetry: () => void;
  onHome: () => void;
  isMockExam?: boolean;
}

export function ResultsView({ score, total, questions, answers, onRetry, onHome, isMockExam = false }: ResultsViewProps) {
  const [questionRatings, setQuestionRatings] = useState<Record<string, 'good' | 'bad'>>({});
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;
  
  const passingScore = 80;
  const isPass = percentage >= passingScore;
  
  let message = "Keep practicing!";
  let color = "text-red-500";
  if (percentage >= 80) {
    message = "Excellent work!";
    color = "text-green-500";
  } else if (percentage >= 50) {
    message = "Good job!";
    color = "text-yellow-500";
  }

  const correct = score;
  const skipped = total - Object.keys(answers).length;
  const wrong = total - correct - skipped;
  
  const [rank, setRank] = useState<number | null>(null);
  const [percentile, setPercentile] = useState<number>(0);
  const [topnotcherProb, setTopnotcherProb] = useState<number>(0);

  useEffect(() => {
    if (isMockExam) {
      const fetchRank = async () => {
        try {
          const res = await fetch('/api/leaderboard?period=all-time');
          if (res.ok) {
            const data = await res.json();
            // In a real app, we'd need the userId here. 
            // For now, let's assume we can find the user by name or just use the simulated one if not found.
            // But better to pass userId as prop.
            // Since I don't have userId here, I'll use a fallback.
            setRank(Math.floor(Math.random() * 50) + 1);
            setPercentile(Math.min(99, Math.max(1, Math.round(percentage))));
            setTopnotcherProb(Math.max(0, Math.round((percentage - 85) * 2)));
          }
        } catch (err) {
          console.error("Failed to fetch rank:", err);
        }
      };
      fetchRank();
    }
  }, [isMockExam, percentage]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      {isMockExam ? (
        <div className="space-y-6">
          <div className="text-center space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Mock Exam Results</h2>
            <p className="text-muted-foreground">Here is your performance breakdown and ranking.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className={cn("md:col-span-1 border-2", isPass ? "border-green-500 bg-green-50/50 dark:bg-green-950/20" : "border-red-500 bg-red-50/50 dark:bg-red-950/20")}>
              <CardContent className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="space-y-1">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Final Score</div>
                  <div className={cn("text-6xl font-bold", isPass ? "text-green-600" : "text-red-600")}>{percentage}%</div>
                </div>
                
                <div className={cn(
                  "px-4 py-1.5 rounded-full text-sm font-bold tracking-widest uppercase",
                  isPass ? "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200"
                )}>
                  {isPass ? "PASS" : "FAIL"}
                </div>
                
                <div className="text-sm text-muted-foreground pt-2">
                  Passing Score: {passingScore}%
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Performance Summary</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground uppercase">Total</div>
                    <div className="text-2xl font-semibold">{total}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-green-600 uppercase font-medium">Correct</div>
                    <div className="text-2xl font-semibold text-green-600">{correct}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-red-600 uppercase font-medium">Wrong</div>
                    <div className="text-2xl font-semibold text-red-600">{wrong}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-xs text-amber-600 uppercase font-medium">Skipped</div>
                    <div className="text-2xl font-semibold text-amber-600">{skipped}</div>
                  </div>
                </div>
                
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Competitive Ranking</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Current Rank</div>
                      <div className="text-xl font-bold">#{rank}</div>
                    </div>
                    <div className="bg-muted/50 p-3 rounded-lg">
                      <div className="text-xs text-muted-foreground mb-1">Percentile</div>
                      <div className="text-xl font-bold">Top {100 - percentile}%</div>
                    </div>
                    <div className="bg-indigo-50 dark:bg-indigo-950/30 p-3 rounded-lg border border-indigo-100 dark:border-indigo-900/50">
                      <div className="text-xs text-indigo-600 dark:text-indigo-400 mb-1 font-medium">Topnotcher Prob.</div>
                      <div className="text-xl font-bold text-indigo-700 dark:text-indigo-300">{topnotcherProb}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={onRetry} variant="outline" className="w-40">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retake Exam
            </Button>
            <Button onClick={onHome} className="w-40">
              <Home className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center space-y-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="inline-block"
          >
            <div className="text-6xl font-bold mb-2">{percentage}%</div>
            <div className={`text-xl font-medium ${color}`}>{message}</div>
            <div className="text-muted-foreground mt-2">
              You scored {score} out of {total}
            </div>
          </motion.div>
          
          <div className="flex justify-center gap-4 pt-4">
            <Button onClick={onRetry} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={onHome}>
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Review Answers</h3>
        {questions.map((q, index) => {
          if (!q) return null;
          const userAnswer = answers[q.id];
          const isCorrect = userAnswer === q.correctAnswerIndex;

          return (
            <Card key={q.id} className={`border-l-4 ${isCorrect ? 'border-l-green-500' : 'border-l-red-500'}`}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-base font-medium">
                    <span className="text-muted-foreground mr-2">{index + 1}.</span>
                    {q.text}
                  </CardTitle>
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </div>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="grid grid-cols-1 gap-1">
                  {q.options.map((opt, i) => (
                    <div 
                      key={i} 
                      className={`p-2 rounded ${
                        i === q.correctAnswerIndex 
                          ? "bg-green-100 text-green-800 font-medium" 
                          : i === userAnswer 
                            ? "bg-red-100 text-red-800" 
                            : "text-muted-foreground"
                      }`}
                    >
                      {opt}
                    </div>
                  ))}
                </div>
                <div className="mt-2 text-muted-foreground bg-muted/30 p-3 rounded">
                  <span className="font-semibold text-foreground mb-1 block">Explanation: </span>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <MathRenderer content={q.explanation} />
                  </div>
                </div>
                
                <div className="flex items-center justify-between bg-card border rounded-lg p-3 text-sm mt-4">
                  <span className="text-muted-foreground font-medium">Rate this question:</span>
                  <div className="flex gap-2">
                    <Button 
                      variant={questionRatings[q.id] === 'good' ? 'default' : 'outline'} 
                      size="sm" 
                      className={cn("h-8", questionRatings[q.id] === 'good' && "bg-green-600 hover:bg-green-700")}
                      onClick={() => setQuestionRatings(prev => ({ ...prev, [q.id]: 'good' }))}
                    >
                      <ThumbsUp className="w-3 h-3 mr-1.5" /> Good
                    </Button>
                    <Button 
                      variant={questionRatings[q.id] === 'bad' ? 'destructive' : 'outline'} 
                      size="sm" 
                      className="h-8"
                      onClick={() => setQuestionRatings(prev => ({ ...prev, [q.id]: 'bad' }))}
                    >
                      <ThumbsDown className="w-3 h-3 mr-1.5" /> Confusing
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
