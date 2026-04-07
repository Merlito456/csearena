import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { ArrowLeft, Calendar, Trophy, Target, Clock } from "lucide-react";
import { storageService } from "@/services/storageService";
import { Badge } from "./ui/badge";

interface ExamResult {
  id: number;
  category: string;
  score: number;
  total_questions: number;
  created_at: string;
}

interface ExamHistoryProps {
  onBack: () => void;
  userId: string | null;
}

export function ExamHistory({ onBack, userId }: ExamHistoryProps) {
  const [history, setHistory] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    
    const fetchHistory = async () => {
      setLoading(true);
      try {
        if (userId === "GUEST") {
          const data = storageService.getHistory(userId);
          const formattedHistory = data.map((item: any, index: number) => ({
            id: index,
            category: item.category,
            score: item.score,
            total_questions: item.totalQuestions,
            created_at: item.timestamp
          }));
          setHistory(formattedHistory);
        } else {
          const res = await fetch(`/api/history?userId=${userId}`);
          if (res.ok) {
            const data = await res.json();
            setHistory(data);
          } else {
            // Fallback
            const data = storageService.getHistory(userId);
            const formattedHistory = data.map((item: any, index: number) => ({
              id: index,
              category: item.category,
              score: item.score,
              total_questions: item.totalQuestions,
              created_at: item.timestamp
            }));
            setHistory(formattedHistory);
          }
        }
      } catch (err) {
        console.error("Failed to fetch history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Clock className="w-6 h-6 text-primary" />
          Exam History
        </h2>
      </div>

      {history.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <p>No exams taken yet. Start practicing to build your history!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((exam) => (
            <Card key={exam.id} className="hover:bg-muted/50 transition-colors">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{exam.category || "Mock Exam"}</span>
                    <Badge variant="secondary" className="text-xs">
                      {new Date(exam.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Target className="w-3 h-3" /> {exam.total_questions} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {new Date(exam.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {Math.round((exam.score / exam.total_questions) * 100)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                  <div className={`p-2 rounded-full ${
                    (exam.score / exam.total_questions) >= 0.8 ? "bg-green-100 text-green-600" :
                    (exam.score / exam.total_questions) >= 0.5 ? "bg-yellow-100 text-yellow-600" :
                    "bg-red-100 text-red-600"
                  }`}>
                    <Trophy className="w-5 h-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
