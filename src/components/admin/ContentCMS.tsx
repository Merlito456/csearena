import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Filter, Plus, MoreVertical, Edit, 
  Copy, Archive, Trash2, Eye, Zap, BookOpen,
  Layers, GraduationCap, Award, Construction,
  FileText, ShieldAlert, Activity, Clock, CheckCircle2, RefreshCw
} from "lucide-react";
import { cn } from "@/lib/utils";
import { CMSTab } from "./types";
import { storageService } from "@/services/storageService";

export const ContentCMS = () => {
  const [activeCMSTab, setActiveCMSTab] = useState<CMSTab>("questions");
  const [cmsSearchQuery, setCmsSearchQuery] = useState("");
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeCMSTab === "questions") {
      fetchQuestions();
    }
  }, [activeCMSTab]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || "";
      const res = await fetch(`${apiUrl}/api/admin/questions`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data);
      }
    } catch (error) {
      console.error("Failed to fetch questions", error);
    } finally {
      setLoading(false);
    }
  };

  const cmsTabs: { id: CMSTab; label: string; icon: any }[] = [
    { id: "questions", label: "Questions", icon: FileText },
    { id: "flashcards", label: "Flashcards", icon: Layers },
    { id: "exams", label: "Mock Exams", icon: GraduationCap },
    { id: "quizzes", label: "Mini Quizzes", icon: Zap },
    { id: "achievements", label: "Achievements", icon: Award },
    { id: "subjects", label: "Subjects & Topics", icon: BookOpen },
  ];

  const filteredQuestions = questions.filter(q => 
    (q.question_text?.toLowerCase() || "").includes(cmsSearchQuery.toLowerCase()) ||
    (q.category?.toLowerCase() || "").includes(cmsSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* CMS Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {cmsTabs.map((tab) => (
          <Button
            key={tab.id}
            variant={activeCMSTab === tab.id ? "default" : "outline"}
            size="sm"
            className="whitespace-nowrap"
            onClick={() => setActiveCMSTab(tab.id)}
          >
            <tab.icon className="w-4 h-4 mr-2" />
            {tab.label}
          </Button>
        ))}
      </div>

      {activeCMSTab === "questions" && (
        <div className="space-y-6">
          {/* Questions Analytics Snapshot */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-red-50 rounded-xl text-red-600">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Total Questions</p>
                  <p className="text-sm font-bold text-foreground">{questions.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Categories</p>
                  <p className="text-sm font-bold text-foreground">{new Set(questions.map(q => q.category || "Uncategorized")).size}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase">Latest ID</p>
                  <p className="text-sm font-bold text-foreground">{questions[0]?.id?.substring(0, 8) || "N/A"}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Questions Toolbar */}
          <Card>
            <CardContent className="p-4 flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input 
                  placeholder="Search questions..." 
                  className="pl-10"
                  value={cmsSearchQuery}
                  onChange={(e) => setCmsSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" /> Filters
                </Button>
                <Button variant="outline" size="sm">
                  <Activity className="w-4 h-4 mr-2" /> Usage Stats
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" /> Bulk Import CSV
                </Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Add Question
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted text-muted-foreground font-medium border-b">
                  <tr>
                    <th className="p-4">Question Preview</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4">Quality Score</th>
                    <th className="p-4">Created At</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mx-auto"></div>
                      </td>
                    </tr>
                  ) : filteredQuestions.length > 0 ? filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-muted/50 transition-colors">
                      <td className="p-4 max-w-xs">
                        <p className="font-medium text-foreground truncate">{q.question_text}</p>
                        <p className="text-[10px] text-muted-foreground font-mono mt-0.5">{q.id}</p>
                      </td>
                      <td className="p-4">
                        <div className="text-xs">
                          <p className="font-medium text-foreground">{q.category || "Uncategorized"}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline" className={cn(
                          "text-[10px]",
                          q.difficulty === "Easy" ? "text-green-600 border-green-100 bg-green-50 dark:bg-green-950/30 dark:border-green-900/50" :
                          q.difficulty === "Moderate" ? "text-amber-600 border-amber-100 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-900/50" :
                          "text-red-600 border-red-100 bg-red-50 dark:bg-red-950/30 dark:border-red-900/50"
                        )}>
                          {q.difficulty}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-xs font-medium">
                          <span className="text-green-600">👍 {Math.floor(Math.random() * 50) + 10}</span>
                          <span className="text-muted-foreground mx-1">|</span>
                          <span className="text-red-500">👎 {Math.floor(Math.random() * 5)}</span>
                        </div>
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {new Date(q.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-muted-foreground">No questions found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {activeCMSTab !== "questions" && (
        activeCMSTab === "flashcards" ? <FlashcardCMS setActiveCMSTab={setActiveCMSTab} /> :
        activeCMSTab === "exams" ? <MockExamsCMS /> :
        activeCMSTab === "quizzes" ? <MiniQuizzesCMS /> :
        activeCMSTab === "achievements" ? <AchievementsCMS /> :
        <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-background rounded-xl border border-dashed">
          <Construction className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="font-semibold text-foreground">CMS Module Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            The {activeCMSTab} management interface is currently under development.
          </p>
        </div>
      )}
    </div>
  );
};

const FlashcardCMS = ({ setActiveCMSTab }: { setActiveCMSTab: (tab: CMSTab) => void }) => {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center p-8 bg-background rounded-xl border border-dashed">
      <Layers className="w-12 h-12 text-muted-foreground mb-4" />
      <h3 className="font-semibold text-foreground">Auto-Generated Flashcards</h3>
      <p className="text-sm text-muted-foreground max-w-md mt-2">
        Flashcards are now automatically generated directly from the Questions database. 
        The question text serves as the front of the card, and the correct answer serves as the back.
      </p>
      <Button variant="outline" className="mt-6" onClick={() => setActiveCMSTab("questions")}>
        Manage Questions
      </Button>
    </div>
  );
};

const MockExamsCMS = () => {
  const [mockExams, setMockExams] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExam, setNewExam] = useState({
    title: "",
    description: "",
    timeLimit: 180,
    passingScore: 80,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    numNumerical: 40,
    numVerbal: 40,
    numGeneral: 50,
    numLogic: 40
  });

  useEffect(() => {
    setMockExams(storageService.getMockExams());
  }, []);

  const handleCreateExam = () => {
    const totalQuestions = newExam.numNumerical + newExam.numVerbal + newExam.numGeneral + newExam.numLogic;
    
    // Calculate percentages
    const getPercent = (num: number) => Math.round((num / totalQuestions) * 100);

    const examData = {
      title: newExam.title,
      description: newExam.description,
      questions: totalQuestions,
      timeLimit: newExam.timeLimit,
      passingScore: newExam.passingScore,
      startDate: newExam.startDate,
      endDate: newExam.endDate,
      coverage: [
        { subject: "Numerical Reasoning", percentage: getPercent(newExam.numNumerical), color: "bg-blue-500" },
        { subject: "Verbal Reasoning", percentage: getPercent(newExam.numVerbal), color: "bg-green-500" },
        { subject: "General Information", percentage: getPercent(newExam.numGeneral), color: "bg-yellow-500" },
        { subject: "Logic", percentage: getPercent(newExam.numLogic), color: "bg-red-500" },
      ]
    };

    storageService.saveMockExam(examData);
    setMockExams(storageService.getMockExams());
    setIsDialogOpen(false);
    // Reset form
    setNewExam({
      title: "",
      description: "",
      timeLimit: 180,
      passingScore: 80,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      numNumerical: 40,
      numVerbal: 40,
      numGeneral: 50,
      numLogic: 40
    });
  };

  const handleDeleteExam = (id: string) => {
    if (confirm("Are you sure you want to delete this mock exam?")) {
      storageService.deleteMockExam(id);
      setMockExams(storageService.getMockExams());
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Mock Exams</h3>
          <p className="text-sm text-muted-foreground">Create and manage full exam simulations.</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              <Plus className="w-4 h-4 mr-2" /> Create Exam
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Mock Exam</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Exam Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g., CSE Mock Exam #1" 
                  value={newExam.title}
                  onChange={(e) => setNewExam({...newExam, title: e.target.value})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Brief description of the exam" 
                  value={newExam.description}
                  onChange={(e) => setNewExam({...newExam, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                  <Input 
                    id="timeLimit" 
                    type="number" 
                    value={newExam.timeLimit}
                    onChange={(e) => setNewExam({...newExam, timeLimit: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="passingScore">Passing Score (%)</Label>
                  <Input 
                    id="passingScore" 
                    type="number" 
                    value={newExam.passingScore}
                    onChange={(e) => setNewExam({...newExam, passingScore: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input 
                    id="startDate" 
                    type="date" 
                    value={newExam.startDate}
                    onChange={(e) => setNewExam({...newExam, startDate: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input 
                    id="endDate" 
                    type="date" 
                    value={newExam.endDate}
                    onChange={(e) => setNewExam({...newExam, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <Label className="text-base font-semibold mb-2 block">Question Distribution</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="numNumerical" className="text-xs text-muted-foreground">Numerical Reasoning</Label>
                    <Input 
                      id="numNumerical" 
                      type="number" 
                      value={newExam.numNumerical}
                      onChange={(e) => setNewExam({...newExam, numNumerical: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="numVerbal" className="text-xs text-muted-foreground">Verbal Reasoning</Label>
                    <Input 
                      id="numVerbal" 
                      type="number" 
                      value={newExam.numVerbal}
                      onChange={(e) => setNewExam({...newExam, numVerbal: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="numGeneral" className="text-xs text-muted-foreground">General Info</Label>
                    <Input 
                      id="numGeneral" 
                      type="number" 
                      value={newExam.numGeneral}
                      onChange={(e) => setNewExam({...newExam, numGeneral: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="numLogic" className="text-xs text-muted-foreground">Logic</Label>
                    <Input 
                      id="numLogic" 
                      type="number" 
                      value={newExam.numLogic}
                      onChange={(e) => setNewExam({...newExam, numLogic: parseInt(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="mt-4 text-sm font-medium text-right">
                  Total Questions: {newExam.numNumerical + newExam.numVerbal + newExam.numGeneral + newExam.numLogic}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateExam} disabled={!newExam.title}>Save Exam</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {mockExams.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockExams.map(exam => (
            <Card key={exam.id}>
              <CardHeader>
                <CardTitle className="text-lg">{exam.title}</CardTitle>
                <CardDescription>{exam.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between"><span className="text-muted-foreground">Questions:</span> <span className="font-medium">{exam.questions}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Time Limit:</span> <span className="font-medium">{exam.timeLimit} mins</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Passing Score:</span> <span className="font-medium">{exam.passingScore}%</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Randomize:</span> <span className="font-medium text-muted-foreground">NO</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Available:</span> <span className="font-medium text-xs">{exam.startDate} to {exam.endDate}</span></div>
                </div>
                
                <div className="bg-muted/50 p-3 rounded-lg text-xs space-y-1.5 mb-4">
                  <div className="font-semibold text-foreground mb-2">Question Distribution</div>
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
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={() => handleDeleteExam(exam.id)}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-card border border-dashed rounded-xl p-12 text-center flex flex-col items-center justify-center">
          <FileText className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
          <h3 className="text-xl font-semibold mb-2">No Mock Exams Created</h3>
          <p className="text-muted-foreground max-w-md mb-6">
            You haven't created any mock exams yet. Mock exams contain a fixed, identical set of questions for all examinees to ensure fair ranking.
          </p>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Create First Exam
          </Button>
        </div>
      )}
    </div>
  );
};

const MiniQuizzesCMS = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Mini Quizzes</h3>
          <p className="text-sm text-muted-foreground">Manage quick practice sessions and drills.</p>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Create Quiz
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Logic Drill</CardTitle>
            <CardDescription>Logic</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Questions:</span> <span className="font-medium">10</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Time Limit:</span> <span className="font-medium">2 minutes</span></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AchievementsCMS = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Achievements</h3>
          <p className="text-sm text-muted-foreground">Manage gamification badges and rewards.</p>
        </div>
        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Add Achievement
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="text-lg">Century Club</CardTitle>
              <CardDescription>Answer 100 Questions</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between"><span className="text-muted-foreground">Reward:</span> <span className="font-medium text-amber-600">500 XP</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Requirement:</span> <span className="font-medium">100 Questions</span></div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="flex-1"><Edit className="w-4 h-4 mr-2" /> Edit</Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"><Trash2 className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
