import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Zap, Clock, Layers, Play, Pause, RotateCcw, 
  ChevronRight, ChevronLeft, Settings2, Brain,
  CheckCircle2, Info
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Category, Question } from "@/types";
import { getQuestionsFromDB } from "@/services/questions";
import { MathRenderer } from "../MathRenderer";
import { Loading } from "../Loading";

type Speed = "Slow" | "Normal" | "Fast";
type Stage = "Question" | "Answer" | "Explanation";

interface FlashReviewProps {
  onBack?: () => void;
}

const SPEED_CONFIG = {
  Slow: { question: 10, answer: 5, explanation: 10 },
  Normal: { question: 7, answer: 3, explanation: 7 },
  Fast: { question: 4, answer: 2, explanation: 5 },
};

export function FlashReview({ onBack }: FlashReviewProps) {
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stage, setStage] = useState<Stage>("Question");
  const [timeLeft, setTimeLeft] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  // Config state
  const [speed, setSpeed] = useState<Speed>("Normal");
  const [count, setCount] = useState(20);
  const [category, setCategory] = useState<Category | "Mixed">("Mixed");

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startReview = async () => {
    setIsLoading(true);
    setIsConfiguring(false);
    
    try {
      const selectedCategory = category === "Mixed" ? "General Information" : category;
      const fetchedQuestions = await getQuestionsFromDB(selectedCategory as Category, count, "Moderate");
      setQuestions(fetchedQuestions);
      setCurrentIndex(0);
      setStage("Question");
      setTimeLeft(SPEED_CONFIG[speed].question);
    } catch (error) {
      console.error("Failed to load questions", error);
      setIsConfiguring(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isConfiguring || isLoading || isPaused || questions.length === 0) return;

    if (timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else {
      // Transition to next stage
      if (stage === "Question") {
        setStage("Answer");
        setTimeLeft(SPEED_CONFIG[speed].answer);
      } else if (stage === "Answer") {
        setStage("Explanation");
        setTimeLeft(SPEED_CONFIG[speed].explanation);
      } else if (stage === "Explanation") {
        if (currentIndex < questions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setStage("Question");
          setTimeLeft(SPEED_CONFIG[speed].question);
        } else {
          // Finished
          setIsConfiguring(true);
          setQuestions([]);
        }
      }
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeLeft, stage, currentIndex, isPaused, isConfiguring, isLoading, questions.length, speed]);

  const togglePause = () => setIsPaused(!isPaused);
  
  const skipStage = () => {
    if (stage === "Question") {
      setStage("Answer");
      setTimeLeft(SPEED_CONFIG[speed].answer);
    } else if (stage === "Answer") {
      setStage("Explanation");
      setTimeLeft(SPEED_CONFIG[speed].explanation);
    } else if (stage === "Explanation") {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setStage("Question");
        setTimeLeft(SPEED_CONFIG[speed].question);
      } else {
        setIsConfiguring(true);
      }
    }
  };

  if (isConfiguring) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="w-8 h-8 text-yellow-500 fill-yellow-500" />
            Flash Review
          </h2>
          <p className="text-muted-foreground">Rapid-fire cognitive conditioning using automated flashcards.</p>
        </div>

        <Card className="border-2 border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-yellow-600" />
              Configure Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Speed Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Transition Speed</label>
              <div className="grid grid-cols-3 gap-3">
                {(["Slow", "Normal", "Fast"] as Speed[]).map((s) => (
                  <Button
                    key={s}
                    variant={speed === s ? "default" : "outline"}
                    className={speed === s ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                    onClick={() => setSpeed(s)}
                  >
                    {s}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground italic">
                {speed === "Slow" && "Relaxed pace. 10s per stage."}
                {speed === "Normal" && "Standard pace. 5-7s per stage."}
                {speed === "Fast" && "Elite pace. 2-4s per stage. High pressure."}
              </p>
            </div>

            {/* Question Count */}
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Number of Cards</label>
              <div className="grid grid-cols-3 gap-3">
                {[20, 50, 100].map((c) => (
                  <Button
                    key={c}
                    variant={count === c ? "default" : "outline"}
                    className={count === c ? "bg-yellow-600 hover:bg-yellow-700" : ""}
                    onClick={() => setCount(c)}
                  >
                    {c} Cards
                  </Button>
                ))}
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-3">
              <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Category Focus</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {["Mixed", "Numerical Reasoning", "Verbal Reasoning", "Logical Reasoning", "General Information", "Logic"].map((cat) => (
                  <Button
                    key={cat}
                    variant={category === cat ? "default" : "outline"}
                    size="sm"
                    className={category === cat ? "bg-yellow-600 hover:bg-yellow-700" : "text-xs"}
                    onClick={() => setCategory(cat as any)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>

            <Button 
              className="w-full h-14 text-lg font-bold bg-yellow-600 hover:bg-yellow-700 text-white shadow-lg"
              onClick={startReview}
            >
              <Play className="w-5 h-5 mr-2 fill-current" /> Start Flash Session
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return <Loading />;
  }

  const currentQuestion = questions[currentIndex];
  if (!currentQuestion) return null;

  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header / Progress */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-yellow-600">Flash Review: {currentIndex + 1} / {questions.length}</span>
            <span className="text-muted-foreground">{stage}</span>
          </div>
          <Progress value={progress} className="h-2 bg-yellow-100" />
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={togglePause}>
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsConfiguring(true)}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${currentIndex}-${stage}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="min-h-[400px] flex flex-col shadow-2xl border-2 border-yellow-500/10 relative overflow-hidden">
            {/* Timer Overlay */}
            <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500/10">
              <motion.div 
                className="h-full bg-yellow-500"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: timeLeft, ease: "linear" }}
                key={`${currentIndex}-${stage}-timer`}
              />
            </div>

            <CardHeader className="border-b bg-slate-50/50">
              <div className="flex justify-between items-center">
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
                  {currentQuestion.category}
                </Badge>
                <div className="flex items-center gap-2 text-yellow-600 font-mono font-bold">
                  <Clock className="w-4 h-4" />
                  {timeLeft}s
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-8 items-center justify-center text-center">
              {stage === "Question" && (
                <div className="space-y-6 w-full">
                  <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Brain className="w-8 h-8 text-yellow-600" />
                  </div>
                  <MathRenderer content={currentQuestion.text} className="text-2xl font-medium leading-relaxed" />
                </div>
              )}

              {stage === "Answer" && (
                <div className="space-y-6 w-full">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-2">Correct Answer</h3>
                  <div className="p-6 bg-green-50 rounded-2xl border-2 border-green-100">
                    <MathRenderer 
                      content={currentQuestion.options[currentQuestion.correctAnswerIndex]} 
                      className="text-3xl font-bold text-green-700" 
                    />
                  </div>
                </div>
              )}

              {stage === "Explanation" && (
                <div className="space-y-6 w-full text-left">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Info className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-blue-900">Explanation</h3>
                  </div>
                  <div className="p-6 bg-blue-50/50 rounded-2xl border border-blue-100">
                    <MathRenderer content={currentQuestion.explanation} className="text-lg leading-relaxed text-slate-700" />
                  </div>
                </div>
              )}
            </CardContent>

            <div className="p-4 border-t bg-slate-50/30 flex justify-center">
              <Button 
                variant="ghost" 
                className="text-muted-foreground hover:text-yellow-600"
                onClick={skipStage}
              >
                Skip Stage <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-4">
        <p className="text-xs text-muted-foreground text-center max-w-md">
          Flash Review is designed for subconscious pattern recognition. 
          Try to internalize the logic before the timer runs out.
        </p>
      </div>
    </div>
  );
}
