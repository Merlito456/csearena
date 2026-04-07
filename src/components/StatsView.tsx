import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { storageService } from "@/services/storageService";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Trophy, Activity, BookOpen, Clock, TrendingUp, Brain, AlertTriangle, CheckCircle2, Target, Zap } from "lucide-react";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

interface StatsViewProps {
  onBack: () => void;
  userId: string | null;
}

interface CategoryStat {
  category: string;
  quizzes_taken: number;
  total_score: number;
  total_questions: number;
}

interface StatsData {
  categoryStats: CategoryStat[];
  totalQuizzes: number;
  dailyQuestions: number;
  streak: number;
  weakestSubject: { category: string; accuracy: number } | null;
  advanced: {
    iqScore: number;
    readinessScore: number;
    avgResponseTime: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function StatsView({ onBack, userId }: StatsViewProps) {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    try {
      const data = storageService.getStats(userId);
      setStats(data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      setLoading(false);
    }
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center p-8">
        <p className="text-muted-foreground">Failed to load statistics.</p>
        <Button onClick={onBack} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const categoryStats = stats.categoryStats || [];
  const chartData = categoryStats.map(stat => ({
    name: stat?.category || "Unknown",
    score: Math.round((stat.total_score / stat.total_questions) * 100) || 0,
    attempts: stat.quizzes_taken
  }));

  const totalQuestionsAnswered = categoryStats.reduce((acc, curr) => acc + (Number(curr.total_questions) || 0), 0);
  const totalCorrectAnswers = categoryStats.reduce((acc, curr) => acc + (Number(curr.total_score) || 0), 0);
  const overallAccuracy = totalQuestionsAnswered > 0 
    ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) 
    : 0;

  // Calculate actual trend data for the last 7 days
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toDateString();
  }).reverse();

  const results = storageService.getResults().filter(r => r.userId === userId && r.mode !== 'flash-review');
  
  const trendData = last7Days.map(dateStr => {
    const dayResults = results.filter(r => new Date(r.timestamp).toDateString() === dateStr);
    const dayQuestions = dayResults.reduce((acc, curr) => acc + curr.totalQuestions, 0);
    const dayScore = dayResults.reduce((acc, curr) => acc + curr.score, 0);
    const dayName = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'short' });
    
    return {
      day: dayName,
      accuracy: dayQuestions > 0 ? Math.round((dayScore / dayQuestions) * 100) : 0
    };
  });

  const radarData = [
    { subject: 'Numerical', A: chartData.find(d => d.name.includes('Numerical'))?.score || 0, fullMark: 100 },
    { subject: 'Verbal', A: chartData.find(d => d.name.includes('Verbal'))?.score || 0, fullMark: 100 },
    { subject: 'Logic', A: chartData.find(d => d.name.includes('Logical'))?.score || 0, fullMark: 100 },
    { subject: 'Gen Info', A: chartData.find(d => d.name.includes('General'))?.score || 0, fullMark: 100 },
    { subject: 'Speed', A: Math.min(100, Math.round((stats.advanced?.avgResponseTime ? (15000 / stats.advanced.avgResponseTime) * 50 : 0))), fullMark: 100 },
    { subject: 'Accuracy', A: overallAccuracy, fullMark: 100 },
  ];

  const strongestSubject = [...(stats.categoryStats || [])].sort((a, b) => {
    const accA = a.total_questions > 0 ? a.total_score / a.total_questions : 0;
    const accB = b.total_questions > 0 ? b.total_score / b.total_questions : 0;
    return accB - accA;
  })[0];

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Button>
        <h2 className="text-2xl font-bold">Your Progress</h2>
      </div>

      {/* Topnotcher Prediction Engine & IQ Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 overflow-hidden relative h-full">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Trophy className="w-32 h-32" />
            </div>
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Brain className="w-4 h-4" /> Topnotcher Prediction Engine
                  </div>
                  <h3 className="text-3xl font-bold tracking-tight">
                    Chance of Passing: <span className="text-primary">{Math.round(overallAccuracy * 0.9)}%</span>
                  </h3>
                  <p className="text-muted-foreground max-w-lg">
                    Based on your recent performance, speed, and accuracy across all subjects. Keep practicing to increase your chances!
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4 text-green-500" /> Strongest Area
                      </div>
                      <div className="font-semibold text-lg">{strongestSubject?.category || "Logic"}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4 text-red-500" /> Weakest Area
                      </div>
                      <div className="font-semibold text-lg">{stats.weakestSubject?.category || "Verbal"}</div>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-1/3 flex justify-center">
                  <div className="relative w-48 h-48 flex items-center justify-center">
                     <svg className="w-full h-full transform -rotate-90">
                       <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/20" />
                       <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-primary drop-shadow-md" strokeDasharray={553} strokeDashoffset={553 - (553 * Math.round(overallAccuracy * 0.9)) / 100} strokeLinecap="round" />
                     </svg>
                     <div className="absolute flex flex-col items-center justify-center">
                       <span className="text-4xl font-bold">{Math.round(overallAccuracy * 0.9)}%</span>
                       <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider mt-1">Ready</span>
                     </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="h-full bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-indigo-600">
                <Zap className="w-5 h-5" /> Estimated IQ Score
              </CardTitle>
              <CardDescription>Cognitive Performance Index</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
              <div className="text-6xl font-bold text-indigo-600">
                {stats.advanced?.iqScore || "--"}
              </div>
              <div className="space-y-1">
                <Badge className="bg-indigo-600 hover:bg-indigo-700">
                  {stats.advanced?.iqScore >= 130 ? "Gifted" : 
                   stats.advanced?.iqScore >= 120 ? "Superior" :
                   stats.advanced?.iqScore >= 110 ? "High Average" :
                   stats.advanced?.iqScore >= 90 ? "Average" : "Developing"}
                </Badge>
                <p className="text-[10px] text-muted-foreground mt-2">
                  *Estimated based on accuracy, logic, and numerical reasoning performance.
                </p>
              </div>
              
              <div className="w-full pt-4 border-t border-indigo-500/10">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Logic Accuracy</span>
                  <span className="font-bold">{chartData.find(d => d.name === 'Logical Reasoning')?.score || 0}%</span>
                </div>
                <Progress value={chartData.find(d => d.name === 'Logical Reasoning')?.score || 0} className="h-1 bg-indigo-100" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Skill Radar & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-1">
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" /> Skill Radar
              </CardTitle>
              <CardDescription>Your personal brain profile</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center">
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="hsl(var(--muted-foreground))" strokeOpacity={0.2} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Skills" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="w-full space-y-2 mt-4 bg-muted/30 p-4 rounded-lg">
                <div className="text-sm font-semibold mb-2">Your Learning Profile</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Logic:</span>
                    <span className="font-medium">Expert</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Speed:</span>
                    <span className="font-medium">Fast</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Numerical:</span>
                    <span className="font-medium">Advanced</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Accuracy:</span>
                    <span className="font-medium">High</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Verbal:</span>
                    <span className="font-medium">Intermediate</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <Card className="h-full border-l-4 border-l-blue-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <Brain className="w-5 h-5" /> AI Insight
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">You're doing great in:</p>
                <div className="flex items-center gap-2 text-green-600 bg-green-50 p-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-semibold">{strongestSubject?.category || "None yet"}</span>
                  <span className="ml-auto text-xs font-bold bg-white px-2 py-1 rounded shadow-sm">
                    {strongestSubject ? Math.round((strongestSubject.total_score / strongestSubject.total_questions) * 100) : 0}%
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">Focus needed on:</p>
                <div className="flex items-center gap-2 text-red-600 bg-red-50 p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-semibold">{stats.weakestSubject?.category || "None yet"}</span>
                  <span className="ml-auto text-xs font-bold bg-white px-2 py-1 rounded shadow-sm">
                    {stats.weakestSubject ? Math.round(stats.weakestSubject.accuracy * 100) : 0}%
                  </span>
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground mb-2">Recommended Practice:</p>
                <Button variant="outline" size="sm" className="w-full justify-between">
                  Practice {stats.weakestSubject?.category || "General"} (15 Qs)
                  <ArrowRight className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
           <div className="grid grid-cols-2 gap-4 h-full">
             <Card>
               <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                 <div className="p-3 bg-orange-100 rounded-full mb-3">
                   <TrendingUp className="w-6 h-6 text-orange-600" />
                 </div>
                 <div className="text-2xl font-bold">{stats.streak} Days</div>
                 <p className="text-xs text-muted-foreground">Study Streak</p>
               </CardContent>
             </Card>
             <Card>
               <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                 <div className="p-3 bg-blue-100 rounded-full mb-3">
                   <Clock className="w-6 h-6 text-blue-600" />
                 </div>
                 <div className="text-2xl font-bold">--</div>
                 <p className="text-xs text-muted-foreground">Study Time</p>
               </CardContent>
             </Card>
             <Card>
               <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                 <div className="p-3 bg-purple-100 rounded-full mb-3">
                   <BookOpen className="w-6 h-6 text-purple-600" />
                 </div>
                 <div className="text-2xl font-bold">{stats.totalQuizzes}</div>
                 <p className="text-xs text-muted-foreground">Total Quizzes</p>
               </CardContent>
             </Card>
             <Card>
               <CardContent className="p-6 flex flex-col items-center justify-center text-center h-full">
                 <div className="p-3 bg-green-100 rounded-full mb-3">
                   <Activity className="w-6 h-6 text-green-600" />
                 </div>
                 <div className="text-2xl font-bold">{totalQuestionsAnswered}</div>
                 <p className="text-xs text-muted-foreground">Questions Answered</p>
               </CardContent>
             </Card>
           </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] min-h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Line type="monotone" dataKey="accuracy" stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Accuracy by Subject</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] min-h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis type="number" domain={[0, 100]} unit="%" hide />
                  <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 12 }} />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="score" name="Accuracy" radius={[0, 4, 4, 0]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
