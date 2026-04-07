import { Category } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./ui/card";
import { BookOpen, Brain, Calculator, FileText, Scale, Signal, Play, ChevronDown, ChevronUp, Star, AlertTriangle, TrendingUp } from "lucide-react";
import { storageService } from "@/services/storageService";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { cn } from "@/lib/utils";

interface SubjectSelectorProps {
  onSelect: (category: Category, difficulty: string) => void;
  userId: string | null;
}

interface SubjectStats {
  accuracy: number;
  totalQuestions: number;
  status: "Weak" | "Strong" | "Improving" | "New";
}

const subjects: { 
  id: Category; 
  title: string; 
  icon: any; 
  color: string; 
  description: string;
  subtopics: string[];
}[] = [
  { 
    id: 'Numerical Reasoning', 
    title: 'Numerical Reasoning', 
    icon: Calculator, 
    color: 'bg-blue-100 text-blue-700',
    description: 'Basic operations, word problems, and number series.',
    subtopics: ['Fractions & Decimals', 'Percentage', 'Ratio & Proportion', 'Word Problems', 'Number Series']
  },
  { 
    id: 'Verbal Reasoning', 
    title: 'Verbal Reasoning', 
    icon: BookOpen, 
    color: 'bg-green-100 text-green-700',
    description: 'Vocabulary, grammar, reading comprehension, and analogies.',
    subtopics: ['Vocabulary', 'Grammar', 'Reading Comprehension', 'Analogies', 'Paragraph Organization']
  },
  { 
    id: 'General Information', 
    title: 'General Information', 
    icon: FileText, 
    color: 'bg-yellow-100 text-yellow-700',
    description: 'Philippine Constitution, Code of Conduct, and current events.',
    subtopics: ['Philippine Constitution', 'Code of Conduct (RA 6713)', 'Peace & Human Rights', 'Environment', 'Current Events']
  },
  { 
    id: 'Clerical Ability', 
    title: 'Clerical Ability', 
    icon: FileText, 
    color: 'bg-purple-100 text-purple-700',
    description: 'Filing, alphabetizing, and clerical procedures.',
    subtopics: ['Filing Procedures', 'Alphabetizing', 'Clerical Operations', 'Spelling']
  },
  { 
    id: 'Logic', 
    title: 'Logic', 
    icon: Brain, 
    color: 'bg-red-100 text-red-700',
    description: 'Logical reasoning, assumptions, and conclusions.',
    subtopics: ['Logical Reasoning', 'Assumptions', 'Conclusions', 'Data Interpretation']
  },
];

const difficulties = ["Easy", "Moderate", "Hard"];

export function SubjectSelector({ onSelect, userId }: SubjectSelectorProps) {
  const [selectedDifficulty, setSelectedDifficulty] = useState("Moderate");
  const [expandedSubject, setExpandedSubject] = useState<Category | null>(null);
  const [stats, setStats] = useState<Record<Category, SubjectStats>>({} as any);
  const [dbCategories, setDbCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Local categories fallback
    const localCategories: Category[] = [
      'Numerical Reasoning',
      'Verbal Reasoning',
      'General Information',
      'Clerical Ability',
      'Logic'
    ];
    setDbCategories(localCategories);

    if (!userId) return;
    // Fetch stats for each subject locally
    try {
      const data = storageService.getStats(userId);
      const newStats: Record<Category, SubjectStats> = {} as any;
      const categoryStats = data.categoryStats || [];
      categoryStats.forEach((stat: any) => {
        const accuracy = stat.total_questions > 0 ? (stat.total_score / stat.total_questions) * 100 : 0;
        let status: "Weak" | "Strong" | "Improving" | "New" = "New";
        
        if (stat.total_questions > 10) {
          if (accuracy < 50) status = "Weak";
          else if (accuracy > 80) status = "Strong";
          else status = "Improving";
        }

        newStats[stat.category as Category] = {
          accuracy,
          totalQuestions: stat.total_questions,
          status
        };
      });
      setStats(newStats);
    } catch (err) {
      console.error("Failed to fetch stats for subjects", err);
    }
  }, [userId]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Weak":
        return <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" /> Weak</Badge>;
      case "Strong":
        return <Badge className="bg-green-500 hover:bg-green-600 gap-1"><Star className="w-3 h-3" /> Strong</Badge>;
      case "Improving":
        return <Badge className="bg-blue-500 hover:bg-blue-600 gap-1"><TrendingUp className="w-3 h-3" /> Improving</Badge>;
      default:
        return null;
    }
  };

  // Merge hardcoded subjects with DB categories
  const allSubjects = [...subjects];
  dbCategories.forEach(dbCat => {
    if (!allSubjects.some(s => s.id === dbCat)) {
      allSubjects.push({
        id: dbCat,
        title: dbCat,
        icon: BookOpen,
        color: 'bg-slate-100 text-slate-700',
        description: `Practice questions for ${dbCat}.`,
        subtopics: ['General Practice']
      });
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-card p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <span className="font-medium flex items-center gap-2">
            <Signal className="w-4 h-4" /> Global Difficulty:
          </span>
          <div className="flex gap-2">
            {difficulties.map((diff) => (
              <Button
                key={diff}
                variant={selectedDifficulty === diff ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedDifficulty(diff)}
                className="min-w-[80px]"
              >
                {diff}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allSubjects.map((subject, index) => {
          const subjectStats = stats[subject.id] || { accuracy: 0, totalQuestions: 0, status: "New" };
          const isExpanded = expandedSubject === subject.id;

          return (
            <motion.div
              key={subject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              layout
            >
              <Card className={cn("h-full transition-all border-2", isExpanded ? "border-primary/20 ring-2 ring-primary/5" : "border-transparent hover:border-primary/10")}>
                <CardHeader className="pb-2 cursor-pointer" onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}>
                  <div className="flex justify-between items-start mb-2">
                    <div className={`p-3 rounded-lg ${subject.color}`}>
                      <subject.icon className="w-6 h-6" />
                    </div>
                    {getStatusBadge(subjectStats.status)}
                  </div>
                  <CardTitle className="text-lg flex items-center justify-between">
                    {subject.title}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Accuracy</span>
                      <span className="font-medium">{Math.round(subjectStats.accuracy)}%</span>
                    </div>
                    <Progress value={subjectStats.accuracy} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{subjectStats.totalQuestions} questions answered</span>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2 border-t pt-3 mt-2"
                      >
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Topics</p>
                        <div className="grid grid-cols-1 gap-1">
                          {subject.subtopics.map((topic) => (
                            <div key={topic} className="text-sm px-2 py-1 rounded hover:bg-muted/50 flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                              {topic}
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>

                <CardFooter className="pt-2">
                  <div className="flex gap-2 w-full">
                    <Button 
                      className="flex-1" 
                      onClick={() => onSelect(subject.id, selectedDifficulty)}
                    >
                      <Play className="w-4 h-4 mr-2" /> Start Practice
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      title="Quick Mini Quiz (5 Qs)"
                      onClick={() => onSelect(subject.id, selectedDifficulty)} // Could pass a 'mini' flag if supported
                    >
                      <Signal className="w-4 h-4" />
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
