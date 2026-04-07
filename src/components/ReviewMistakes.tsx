import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { AlertCircle, CheckCircle2, XCircle, ArrowLeft, RefreshCw, BookOpen, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { storageService } from "@/services/storageService";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "./ui/badge";
import { Category } from "@/types";
import { MathRenderer } from "./MathRenderer";

export interface Mistake {
  id: string;
  category: string;
  question_text: string;
  options: string[];
  correct_index: number;
  selected_index: number;
  explanation: string;
  created_at: string | number;
}

interface ReviewMistakesProps {
  onBack: () => void;
  onNavigate: (view: any) => void;
  onRetry: (mistakes: Mistake[]) => void;
  autoStart?: boolean;
  userId: string | null;
}

export function ReviewMistakes({ onBack, onNavigate, onRetry, autoStart, userId }: ReviewMistakesProps) {
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedExplanation, setExpandedExplanation] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    
    const fetchMistakes = async () => {
      setLoading(true);
      try {
        if (userId === "GUEST") {
          const data = storageService.getMistakes();
          setMistakes(data);
          if (autoStart && data.length > 0) {
            onRetry(data);
          }
        } else {
          const res = await fetch(`/api/mistakes?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            setMistakes(data);
            if (autoStart && data.length > 0) {
              onRetry(data);
            }
          } else {
            // Fallback
            const data = storageService.getMistakes();
            setMistakes(data);
            if (autoStart && data.length > 0) {
              onRetry(data);
            }
          }
        }
      } catch (err) {
        console.error("Failed to fetch mistakes", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMistakes();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Group mistakes by category
  const groupedMistakes = mistakes.reduce((acc, mistake) => {
    const cat = mistake.category || "Uncategorized";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(mistake);
    return acc;
  }, {} as Record<string, Mistake[]>);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-destructive" />
            Review Mistakes
          </h2>
        </div>
        {mistakes.length > 0 && (
            <Button onClick={() => onRetry(mistakes)} className="bg-destructive hover:bg-destructive/90">
                <RefreshCw className="w-4 h-4 mr-2" /> Retry All ({mistakes.length})
            </Button>
        )}
      </div>

      {mistakes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center flex flex-col items-center">
            <div className="bg-green-100 p-4 rounded-full mb-4">
                <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Mistakes Found!</h3>
            <p className="text-muted-foreground max-w-md mb-8">
              Great job! You haven't made any mistakes yet, or you haven't taken any quizzes recently.
            </p>
            <div className="flex gap-4">
                <Button onClick={() => onNavigate('subjects')} size="lg">
                    <BookOpen className="w-4 h-4 mr-2" /> Start Practice
                </Button>
                <Button onClick={() => onNavigate('mock-exam')} variant="outline" size="lg">
                    <Trophy className="w-4 h-4 mr-2" /> Take Mock Exam
                </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
            {Object.entries(groupedMistakes).map(([category, categoryMistakes]: [string, Mistake[]]) => (
                <div key={category} className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            {category}
                            <Badge variant="secondary">{categoryMistakes.length} mistakes</Badge>
                        </h3>
                        <Button variant="outline" size="sm" onClick={() => onRetry(categoryMistakes)}>
                            <RefreshCw className="w-3 h-3 mr-2" /> Retry {category}
                        </Button>
                    </div>
                    
                    <div className="grid gap-4">
                        {categoryMistakes.map((mistake) => {
                            if (!mistake) return null;
                            return (
                                <motion.div 
                                    key={mistake.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                <Card className="border-l-4 border-l-destructive">
                                    <CardHeader className="pb-2">
                                        <div className="flex justify-between items-start gap-4">
                                            <span className="font-medium leading-relaxed">{mistake.question_text}</span>
                                            <Badge variant="outline" className="shrink-0 text-xs">
                                                {new Date(mistake.created_at).toLocaleDateString()}
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-4 pt-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                            <div className="p-3 rounded-md bg-red-50 border border-red-100 text-red-900 flex items-start gap-2">
                                                <XCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-600" />
                                                <div>
                                                    <span className="font-semibold block text-xs uppercase text-red-700 mb-1">Your Answer</span>
                                                    {mistake.options[mistake.selected_index]}
                                                </div>
                                            </div>
                                            <div className="p-3 rounded-md bg-green-50 border border-green-100 text-green-900 flex items-start gap-2">
                                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-green-600" />
                                                <div>
                                                    <span className="font-semibold block text-xs uppercase text-green-700 mb-1">Correct Answer</span>
                                                    {mistake.options[mistake.correct_index]}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className="text-muted-foreground hover:text-primary p-0 h-auto"
                                                onClick={() => setExpandedExplanation(expandedExplanation === mistake.id ? null : mistake.id)}
                                            >
                                                {expandedExplanation === mistake.id ? (
                                                    <><ChevronUp className="w-4 h-4 mr-1" /> Hide Explanation</>
                                                ) : (
                                                    <><ChevronDown className="w-4 h-4 mr-1" /> View Explanation</>
                                                )}
                                            </Button>
                                            <Button variant="ghost" size="sm" className="ml-auto text-xs" onClick={() => onRetry([mistake])}>
                                                <RefreshCw className="w-3 h-3 mr-1" /> Retry this question
                                            </Button>
                                        </div>

                                        <AnimatePresence>
                                            {expandedExplanation === mistake.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-muted/50 p-4 rounded-lg text-sm mt-2"
                                                >
                                                    <div className="font-semibold mb-2 flex items-center gap-2">
                                                        <BookOpen className="w-4 h-4 text-primary" /> Explanation
                                                    </div>
                                                    <div className="text-muted-foreground leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                                                        <MathRenderer content={mistake.explanation} />
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        ))}
    </div>
      )}
    </div>
  );
}
