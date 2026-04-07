import { useState, useEffect } from "react";
import { Category, Question, QuizMode } from "@/types";
import { getQuestionsFromDB } from "@/services/questions";
import { SubjectSelector } from "@/components/SubjectSelector";
import { QuizInterface } from "@/components/QuizInterface";
import { ResultsView } from "@/components/ResultsView";
import { BrainProfileView } from "@/components/BrainProfileView";
import { StatsView } from "@/components/StatsView";
import { Loading } from "@/components/Loading";
import { Sidebar, ViewState } from "@/components/Sidebar";
import { Dashboard } from "@/components/Dashboard";
import { PracticeMode } from "@/components/PracticeMode";
import { ExamHistory } from "@/components/ExamHistory";
import { StudyPlannerView } from "@/components/StudyPlannerView";
import { LeaderboardView } from "@/components/LeaderboardView";
import { AchievementsView } from "@/components/AchievementsView";
import { PremiumView } from "@/components/PremiumView";
import { SettingsView } from "@/components/SettingsView";
import { LoginView } from "@/components/LoginView";
import { AdminDashboard } from "@/components/AdminDashboard";
import { storageService } from "@/services/storageService";
import { aiService } from "@/services/aiService";
import { motion, AnimatePresence } from "motion/react";
import { Menu, Clock, AlertCircle, CheckCircle2, Brain, BookOpenCheck, Construction, FileText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [currentView, setCurrentView] = useState<ViewState>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Quiz State
  const [quizActive, setQuizActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isMockExam, setIsMockExam] = useState(false);
  const [quizMode, setQuizMode] = useState<QuizMode>("standard");
  const [responseTimes, setResponseTimes] = useState<Record<string, number>>({});
  const [practiceSubView, setPracticeSubView] = useState<string>("hub");
  
  // Mock Exam Settings
  const [mockSettings, setMockSettings] = useState({
    questionCount: 20,
    timeMode: "mini" as "full" | "mini",
    difficulty: "Mixed" as "Mixed" | "Easy" | "Moderate" | "Hard" | "Adaptive",
  });

  // Dashboard Stats State
  const [dashboardStats, setDashboardStats] = useState<{
    totalQuizzes: number;
    questionsAnswered: number;
    accuracy: number;
    dailyQuestions: number;
    dailyQuizzes: number;
    streak: number;
    weakestSubject: { category: string; accuracy: number } | null;
    advanced?: {
      avgResponseTime: number;
      difficultyStats: { difficulty: string; accuracy: number }[];
      mistakeTopics: string[];
      readinessScore: number;
      iqScore: number;
    };
  } | null>(null);

  useEffect(() => {
    if (userId) {
      fetchStats();
    }
  }, [currentView, userId]);

  const fetchStats = async () => {
    if (!userId) return;
    if (userId === "GUEST") {
      const data = storageService.getStats(userId);
      setDashboardStats(data);
      return;
    }
    try {
      const res = await fetch(`/api/stats?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setDashboardStats(data);
        if (data.isPremium !== undefined) {
          setIsPremium(data.isPremium);
        }
      } else {
        // Fallback to local
        const data = storageService.getStats(userId);
        setDashboardStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats", error);
      const data = storageService.getStats(userId);
      setDashboardStats(data);
    }
  };

  const handleNavigate = (view: ViewState) => {
    setCurrentView(view);
    setQuizActive(false);
    setIsMockExam(false);
  };

  const handleSelectCategory = async (category: Category, difficulty: string, mode: QuizMode = 'standard') => {
    if (!isPremium && dashboardStats && dashboardStats.dailyQuizzes >= 5) {
      setCurrentView("premium");
      return;
    }
    setLoading(true);
    setSelectedCategory(category);
    setQuizMode(mode);
    setIsMockExam(mode === 'simulation');
    try {
      const generatedQuestions = await getQuestionsFromDB(category, mode === 'quick-start' ? 5 : 10, difficulty);
      setQuestions(generatedQuestions);
      setQuizActive(true);
    } catch (error) {
      console.error("Failed to start quiz:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartMockExam = async (examConfig?: any) => {
    if (!isPremium && dashboardStats && dashboardStats.dailyQuizzes >= 5) {
      setCurrentView("premium");
      return;
    }
    setLoading(true);
    setIsMockExam(true);
    setQuizMode('simulation');
    setSelectedCategory(null); // Mock exam has mixed categories
    try {
      // In a real app, this would fetch the EXACT questions assigned to this mock exam ID
      // so that all examinees get the identical set.
      const questionCount = examConfig ? examConfig.questions : mockSettings.questionCount;
      const countPerCategory = Math.ceil(questionCount / 4);
      const categories: Category[] = ['Numerical Reasoning', 'Verbal Reasoning', 'General Information', 'Logic'];
      
      const difficulty = mockSettings.difficulty === "Mixed" || mockSettings.difficulty === "Adaptive" ? "Moderate" : mockSettings.difficulty;
      
      const promises = categories.map(cat => getQuestionsFromDB(cat, countPerCategory, difficulty));
      const results = await Promise.all(promises);
      
      // Flatten and DO NOT randomize if it's a fixed mock exam
      const mixedQuestions = results.flat().slice(0, questionCount);
      
      setQuestions(mixedQuestions);
      setQuizActive(true);
    } catch (error) {
      console.error("Failed to start mock exam:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishQuiz = async (finalScore: number, finalAnswers: Record<string, number>, finalResponseTimes: Record<string, number>) => {
    setScore(finalScore);
    setAnswers(finalAnswers);
    setResponseTimes(finalResponseTimes);
    setQuizActive(false);
    
    if (userId) {
      const resultData = {
        category: isMockExam ? "Mock Exam" : (selectedCategory || "General"),
        score: finalScore,
        totalQuestions: questions.length,
        answers: finalAnswers,
        questions: questions,
        userId: userId,
        mode: quizMode,
        responseTimes: finalResponseTimes
      };

      // Save locally as fallback
      storageService.saveResult(resultData);

      if (userId !== "GUEST") {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || "";
          const res = await fetch(`${apiUrl}/api/results`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(resultData),
          });
          if (!res.ok) {
            const errorData = await res.json();
            console.error("Failed to save result to database:", errorData);
          }
        } catch (error) {
          console.error("Network error saving result to database:", error);
        }
      }
      
      fetchStats(); // Refresh dashboard stats
    }
  };

  const handleExitQuiz = () => {
    setQuizActive(false);
    setQuestions([]);
    setScore(0);
    setAnswers({});
    setSelectedCategory(null);
    setIsMockExam(false);
    // Return to previous view
    if (isMockExam) setCurrentView("mock-exam");
    else setCurrentView("subjects");
  };

  const handleRetry = () => {
    if (isMockExam) {
      handleStartMockExam();
    } else if (selectedCategory) {
      handleSelectCategory(selectedCategory, "Moderate");
    } else {
      handleExitQuiz();
    }
  };

  // Placeholder component for new features
  const PlaceholderView = ({ title, icon: Icon, description }: any) => (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8 space-y-4">
      <div className="p-4 bg-primary/10 rounded-full">
        <Icon className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-muted-foreground max-w-md">{description}</p>
      <Button onClick={() => handleNavigate('dashboard')}>Back to Dashboard</Button>
    </div>
  );

  // Render Content Logic
  const renderContent = () => {
    if (loading) return <Loading />;

    if (quizActive) {
      return (
        <QuizInterface
          questions={questions}
          onFinish={handleFinishQuiz}
          onExit={handleExitQuiz}
          isMockExam={isMockExam}
          mode={quizMode}
        />
      );
    }

    // If we have questions and answers but quiz is not active, show results
    if (questions.length > 0 && Object.keys(answers).length > 0) {
      if (quizMode === 'recognition') {
        return (
          <BrainProfileView
            score={score}
            total={questions.length}
            questions={questions}
            answers={answers}
            responseTimes={responseTimes}
            onRetry={handleRetry}
            onHome={handleExitQuiz}
            onNavigateToPractice={(subView) => {
              setPracticeSubView(subView);
              handleExitQuiz();
              setCurrentView('practice');
            }}
          />
        );
      }
      return (
        <ResultsView
          score={score}
          total={questions.length}
          questions={questions}
          answers={answers}
          onRetry={handleRetry}
          onHome={handleExitQuiz}
          isMockExam={isMockExam}
        />
      );
    }

    switch (currentView) {
      case "dashboard":
        return <Dashboard onNavigate={handleNavigate} userId={userId} stats={dashboardStats} isPremium={isPremium} />;
      case "subjects":
        return (
          <div className="space-y-6">
            <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold tracking-tight">Subject Review</h2>
              <p className="text-muted-foreground">Select a topic to start practicing.</p>
            </div>
            <SubjectSelector onSelect={handleSelectCategory} userId={userId} />
          </div>
        );
      case "mock-exam":
        const adminMockExams = storageService.getMockExams();

        return (
          <div className="space-y-6">
             <div className="flex flex-col gap-2">
              <h2 className="text-3xl font-bold tracking-tight">Mock Board Exam</h2>
              <p className="text-muted-foreground">Simulate the actual examination experience.</p>
            </div>
            
            {adminMockExams.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {adminMockExams.map(exam => {
                  const now = new Date().toISOString().split('T')[0];
                  const isAvailable = now >= exam.startDate && now <= exam.endDate;

                  return (
                    <div key={exam.id} className="bg-card border rounded-xl p-6 flex flex-col h-full">
                      <div className="mb-4">
                        <h3 className="text-xl font-semibold">{exam.title}</h3>
                        <p className="text-sm text-muted-foreground">{exam.description}</p>
                      </div>
                      
                      <div className="space-y-2 text-sm mb-6 flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2"><FileText className="w-4 h-4" /> Questions:</span>
                          <span className="font-medium">{exam.questions}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2"><Clock className="w-4 h-4" /> Time Limit:</span>
                          <span className="font-medium">{exam.timeLimit / 60} hours</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Passing Score:</span>
                          <span className="font-medium">{exam.passingScore}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Randomize:</span>
                          <span className="font-medium text-muted-foreground">NO (Identical)</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground flex items-center gap-2">Available:</span>
                          <span className="font-medium text-xs">{exam.startDate} to {exam.endDate}</span>
                        </div>
                      </div>

                      <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-2 mb-6">
                        <div className="font-semibold text-foreground mb-1">Question Distribution</div>
                        {exam.coverage.map((cov: any, i: number) => (
                          <div key={i} className="flex justify-between items-center">
                            <span className="text-muted-foreground flex items-center gap-2">
                              <span className={`w-2 h-2 rounded-full ${cov.color}`} />
                              {cov.subject}
                            </span>
                            <span>{Math.round(exam.questions * (cov.percentage / 100))}</span>
                          </div>
                        ))}
                      </div>
                      
                      <Button 
                        onClick={() => handleStartMockExam(exam)} 
                        size="lg" 
                        className="w-full mt-auto"
                        disabled={!isAvailable}
                      >
                        {isAvailable ? "Start Exam" : "Not Available"}
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-card border border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center">
                <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">No Active Mock Exams</h3>
                <p className="text-muted-foreground max-w-md">
                  There are currently no mock exams scheduled by the administrators. Mock exams contain a fixed, identical set of questions for all examinees. Please check back later.
                </p>
              </div>
            )}
          </div>
        );
      case "stats":
        return <StatsView onBack={() => handleNavigate("dashboard")} userId={userId} />;
      case "practice":
        return (
          <PracticeMode 
            onBack={() => handleNavigate("dashboard")} 
            onNavigate={handleNavigate}
            onStartQuiz={handleSelectCategory}
            onStartMockExam={handleStartMockExam}
            userId={userId}
            isPremium={isPremium}
            initialSubView={practiceSubView as any}
          />
        );
      case "history":
        return <ExamHistory onBack={() => handleNavigate("dashboard")} userId={userId} />;
      case "planner":
        return (
          <StudyPlannerView 
            onBack={() => handleNavigate("dashboard")} 
            onNavigate={handleNavigate}
            userId={userId}
            stats={dashboardStats}
            isPremium={isPremium}
          />
        );
      case "leaderboard":
        return <LeaderboardView onBack={() => handleNavigate("dashboard")} userId={userId} userName={userName} />;
      case "achievements":
        return <AchievementsView onBack={() => handleNavigate("dashboard")} />;
      case "premium":
        return <PremiumView onBack={() => handleNavigate("dashboard")} userId={userId} />;
      case "settings":
        return (
          <SettingsView 
            onBack={() => handleNavigate("dashboard")} 
            userId={userId}
            userName={userName}
            userEmail={userEmail}
            onUpdateProfile={(name, email) => {
              setUserName(name);
              setUserEmail(email);
            }}
          />
        );
      default:
        return <Dashboard onNavigate={handleNavigate} userId={userId} stats={dashboardStats} isPremium={isPremium} />;
    }
  };

  const handleLogin = (user: any, admin: boolean = false) => {
    setUserId(user.id || user);
    setUserName(user.name || "");
    setUserEmail(user.email || "");
    setIsAdmin(admin);
    setIsPremium(user.is_premium || false);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setUserId(null);
    setCurrentView("dashboard");
  };

  if (!isAuthenticated) {
    return <LoginView onLogin={handleLogin} />;
  }

  if (isAdmin) {
    return (
      <ErrorBoundary fallback={<div className="p-20 bg-black text-red-500">Critical Admin Error. Check console.</div>}>
        <AdminDashboard onLogout={handleLogout} />
      </ErrorBoundary>
    );
  }

  return (
    <div className="flex min-h-screen bg-background font-sans text-foreground">
      {/* Sidebar */}
      <Sidebar 
        currentView={currentView as ViewState} 
        onNavigate={(view) => handleNavigate(view)} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={handleLogout}
        isPremium={isPremium}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen w-full">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b bg-card flex items-center px-4 justify-between sticky top-0 z-30">
          <div className="font-bold text-lg flex items-center gap-2">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <BookOpenCheck className="w-5 h-5 text-primary" />
            </div>
            CSE Arena
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)}>
            <Menu className="w-6 h-6" />
          </Button>
        </header>

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView + (quizActive ? "-quiz" : "") + (questions.length > 0 && !quizActive ? "-results" : "")}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-5xl mx-auto w-full pb-20 md:pb-0"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
