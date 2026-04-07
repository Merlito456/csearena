import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Brain, Trophy, Eye, Heart, TrendingUp, Sparkles, GraduationCap, 
  BookOpen, ArrowLeft, ChevronRight, Zap, Crown
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { RecognitionEngine } from "./practice/RecognitionEngine";
import { TopnotcherMode } from "./practice/TopnotcherMode";
import { LooksfamArena } from "./practice/LooksfamArena";
import { PsychConditioning } from "./practice/PsychConditioning";
import { DifficultyLadder } from "./practice/DifficultyLadder";
import { AdaptiveCoaching } from "./practice/AdaptiveCoaching";
import { BoardSimulation } from "./practice/BoardSimulation";
import { FlashReview } from "./practice/FlashReview";
import { SubjectSelector } from "./SubjectSelector";
import { Category, QuizMode } from "@/types";

type PracticeSubView = 
  | "hub" 
  | "recognition" 
  | "topnotcher" 
  | "looksfam" 
  | "psych" 
  | "ladder" 
  | "subjects" 
  | "coaching" 
  | "simulation"
  | "flash-review";

interface PracticeModeProps {
  onBack: () => void;
  onNavigate: (view: any) => void;
  onStartQuiz: (category: Category, difficulty: string, mode?: QuizMode) => void;
  onStartMockExam: () => void;
  userId: string | null;
  isPremium: boolean;
  initialSubView?: PracticeSubView;
}

export function PracticeMode({ onBack, onNavigate, onStartQuiz, onStartMockExam, userId, isPremium, initialSubView = "hub" }: PracticeModeProps) {
  const [subView, setSubView] = useState<PracticeSubView>(initialSubView);

  const practiceModules = [
    { 
      id: "recognition", 
      title: "Recognition Engine", 
      description: "Pattern recognition analysis to identify your cognitive strengths using DB history.",
      icon: Brain,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      isPremium: true
    },
    { 
      id: "topnotcher", 
      title: "Topnotcher Mode", 
      description: "Elite-level training using the most challenging items from our database.",
      icon: Trophy,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-100",
      isPremium: true
    },
    { 
      id: "looksfam", 
      title: "Looksfam Arena", 
      description: "Rapid-fire recognition of common board exam patterns from the DB.",
      icon: Eye,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-100",
      isPremium: true
    },
    { 
      id: "psych", 
      title: "Psych Conditioning", 
      description: "Mental preparation and stress management using database drills.",
      icon: Heart,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-100",
      isPremium: true
    },
    { 
      id: "ladder", 
      title: "Difficulty Ladder", 
      description: "Progressive learning path using database items that scale with you.",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-100",
      isPremium: true
    },
    { 
      id: "subjects", 
      title: "Subject Mastery", 
      description: "Deep dive into specific exam subjects and topics from the database.",
      icon: BookOpen,
      color: "text-slate-600",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-100"
    },
    { 
      id: "coaching", 
      title: "Adaptive Coaching", 
      description: "Personalized guidance that adapts to your style using database items.",
      icon: Sparkles,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-100",
      isPremium: true
    },
    { 
      id: "simulation", 
      title: "Board Simulation", 
      description: "Full-scale simulation using verified database questions.",
      icon: GraduationCap,
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-100",
      isPremium: true
    },
    { 
      id: "flash-review", 
      title: "Flash Review", 
      description: "Automated rapid-fire flashcards for subconscious pattern recognition.",
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-100"
    },
  ];

  const handleModuleClick = (module: any) => {
    if (module.isPremium && !isPremium) {
      onNavigate('premium');
      return;
    }
    setSubView(module.id as PracticeSubView);
  };

  const renderSubView = () => {
    switch (subView) {
      case "recognition": return <RecognitionEngine onStartQuiz={onStartQuiz} />;
      case "topnotcher": return <TopnotcherMode onStartQuiz={onStartQuiz} />;
      case "looksfam": return <LooksfamArena onStartQuiz={onStartQuiz} />;
      case "psych": return <PsychConditioning onStartQuiz={onStartQuiz} />;
      case "ladder": return <DifficultyLadder onStartQuiz={onStartQuiz} />;
      case "subjects": return (
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-bold tracking-tight">Subject Mastery</h2>
            <p className="text-muted-foreground">Deep focus per subject. Measure your mastery from Beginner to Mastered.</p>
          </div>
          <SubjectSelector onSelect={(cat, diff) => onStartQuiz(cat, diff, 'mastery')} userId={userId} />
        </div>
      );
      case "coaching": return <AdaptiveCoaching onStartQuiz={onStartQuiz} />;
      case "simulation": return <BoardSimulation onStartMockExam={onStartMockExam} />;
      case "flash-review": return <FlashReview onBack={() => setSubView("hub")} />;
      default:
        return (
          <div className="space-y-8">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold tracking-tight">Practice Mode</h2>
              <p className="text-muted-foreground">Choose a specialized training module to sharpen your skills.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {practiceModules.map((module) => (
                <motion.div
                  key={module.id}
                  whileHover={module.isPremium && !isPremium ? {} : { y: -4 }}
                  whileTap={module.isPremium && !isPremium ? {} : { scale: 0.98 }}
                >
                  <Card 
                    className={`cursor-pointer h-full transition-all hover:shadow-md border-2 ${module.borderColor} ${module.bgColor}/30 relative overflow-hidden`}
                    onClick={() => handleModuleClick(module)}
                  >
                    {module.isPremium && !isPremium && (
                      <div className="absolute top-0 right-0 p-2 z-20">
                        <div className="bg-yellow-500 text-white p-1 rounded-full shadow-sm">
                          <Crown className="w-3 h-3 fill-current" />
                        </div>
                      </div>
                    )}
                    <CardContent className={`p-6 flex flex-col h-full ${module.isPremium && !isPremium ? 'opacity-60' : ''}`}>
                      <div className={`w-12 h-12 rounded-2xl ${module.bgColor} flex items-center justify-center mb-4 shadow-sm`}>
                        <module.icon className={`w-6 h-6 ${module.color}`} />
                      </div>
                      <h3 className="font-bold text-lg mb-2">{module.title}</h3>
                      <p className="text-sm text-muted-foreground flex-1 mb-4">{module.description}</p>
                      <div className="flex items-center text-xs font-bold uppercase tracking-wider text-primary group">
                        {module.isPremium && !isPremium ? "Premium Only" : "Enter Module"} 
                        {!(module.isPremium && !isPremium) && <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Quick Action Card */}
            <Card className="bg-slate-900 text-white border-none overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <CardContent className="p-8 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold">Ready for a quick drill?</h3>
                  <p className="text-slate-400 max-w-md">Jump into a 5-minute mixed category session to keep your streak alive.</p>
                </div>
                <Button 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white px-8 h-12 rounded-xl font-bold uppercase tracking-widest"
                  onClick={() => onStartQuiz('General Information', 'Moderate')}
                >
                  <Zap className="w-4 h-4 mr-2 fill-current" /> Quick Start
                </Button>
              </CardContent>
            </Card>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {subView !== "hub" && (
        <Button 
          variant="ghost" 
          onClick={() => setSubView("hub")}
          className="mb-6 -ml-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Practice Hub
        </Button>
      )}
      
      <AnimatePresence mode="wait">
        <motion.div
          key={subView}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderSubView()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
