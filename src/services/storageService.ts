import { Question, Category } from "../types";

export interface QuizResult {
  id: string;
  category: string;
  score: number;
  totalQuestions: number;
  answers: Record<string, number>;
  questions: Question[];
  userId: string;
  mode: string;
  responseTimes: Record<string, number>;
  timestamp: number;
}

export interface Mistake {
  id: string;
  category: string;
  question_text: string;
  options: string[];
  correct_index: number;
  selected_index: number;
  explanation: string;
  created_at: number;
}

class StorageService {
  private readonly RESULTS_KEY = "cse_arena_results";
  private readonly MISTAKES_KEY = "cse_arena_mistakes";
  private readonly USER_KEY = "cse_arena_user";
  private readonly MOCK_EXAMS_KEY = "cse_arena_admin_mock_exams";

  saveMockExam(exam: any) {
    const exams = this.getMockExams();
    exams.push({ ...exam, id: `mock-${Date.now()}` });
    localStorage.setItem(this.MOCK_EXAMS_KEY, JSON.stringify(exams));
  }

  getMockExams(): any[] {
    const data = localStorage.getItem(this.MOCK_EXAMS_KEY);
    return data ? JSON.parse(data) : [];
  }

  deleteMockExam(id: string) {
    const exams = this.getMockExams().filter(e => e.id !== id);
    localStorage.setItem(this.MOCK_EXAMS_KEY, JSON.stringify(exams));
  }

  saveResult(result: Omit<QuizResult, "id" | "timestamp">): QuizResult {
    const results = this.getResults();
    const newResult: QuizResult = {
      ...result,
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
    };
    results.push(newResult);
    localStorage.setItem(this.RESULTS_KEY, JSON.stringify(results));
    
    // Update mistakes
    this.updateMistakes(newResult);
    
    return newResult;
  }

  getResults(): QuizResult[] {
    const data = localStorage.getItem(this.RESULTS_KEY);
    return data ? JSON.parse(data) : [];
  }

  private updateMistakes(result: QuizResult) {
    const mistakes = this.getMistakes();
    result.questions.forEach((q) => {
      const userAnswer = result.answers[q.id];
      if (userAnswer !== undefined && userAnswer !== q.correctAnswerIndex) {
        // Add or update mistake
        const mistakeIndex = mistakes.findIndex((m) => m.id === q.id);
        const newMistake: Mistake = {
          id: q.id,
          category: q.category,
          question_text: q.text,
          options: q.options,
          correct_index: q.correctAnswerIndex,
          selected_index: userAnswer,
          explanation: q.explanation,
          created_at: Date.now(),
        };
        
        if (mistakeIndex > -1) {
          mistakes[mistakeIndex] = newMistake;
        } else {
          mistakes.push(newMistake);
        }
      } else if (userAnswer === q.correctAnswerIndex) {
        // Remove mistake if corrected
        const mistakeIndex = mistakes.findIndex((m) => m.id === q.id);
        if (mistakeIndex > -1) {
          mistakes.splice(mistakeIndex, 1);
        }
      }
    });
    localStorage.setItem(this.MISTAKES_KEY, JSON.stringify(mistakes));
  }

  getMistakes(): Mistake[] {
    const data = localStorage.getItem(this.MISTAKES_KEY);
    return data ? JSON.parse(data) : [];
  }

  getStats(userId: string) {
    const results = this.getResults().filter(r => r.userId === userId && r.mode !== 'flash-review');
    const mistakes = this.getMistakes();
    
    const categoryStats: Record<string, { total_questions: number; total_score: number; quizzes_taken: number }> = {};
    
    results.forEach(r => {
      const cat = r.category || "General";
      if (!categoryStats[cat]) {
        categoryStats[cat] = { total_questions: 0, total_score: 0, quizzes_taken: 0 };
      }
      categoryStats[cat].total_questions += r.totalQuestions;
      categoryStats[cat].total_score += r.score;
      categoryStats[cat].quizzes_taken += 1;
    });

    const categoryStatsArray = Object.entries(categoryStats).map(([category, stat]) => ({
      category,
      ...stat
    }));

    const totalQuestions = categoryStatsArray.reduce((acc, curr) => acc + curr.total_questions, 0);
    const totalScore = categoryStatsArray.reduce((acc, curr) => acc + curr.total_score, 0);
    const accuracy = totalQuestions > 0 ? totalScore / totalQuestions : 0;

    // Find weakest subject
    let weakestSubject = null;
    if (categoryStatsArray.length > 0) {
      const sorted = [...categoryStatsArray].sort((a, b) => (a.total_score / a.total_questions) - (b.total_score / b.total_questions));
      weakestSubject = {
        category: sorted[0].category,
        accuracy: sorted[0].total_score / sorted[0].total_questions
      };
    }

    // Daily questions (last 24h)
    const last24h = Date.now() - (24 * 60 * 60 * 1000);
    const dailyQuestions = results
      .filter(r => r.timestamp > last24h)
      .reduce((acc, curr) => acc + curr.totalQuestions, 0);

    const dailyQuizzes = results
      .filter(r => r.timestamp > last24h).length;

    // Streak calculation (simplified)
    const streak = this.calculateStreak(results);

    // Advanced Stats (Simplified for local)
    const allResponseTimes = results.flatMap(r => Object.values(r.responseTimes || {}));
    const avgResponseTime = allResponseTimes.length > 0 ? allResponseTimes.reduce((a, b) => a + b, 0) / allResponseTimes.length : 0;
    
    const mistakeTopics = Array.from(new Set(mistakes.map(m => m.category))).slice(0, 3);
    const readinessScore = Math.min(Math.round((accuracy * 0.7 + (results.length > 10 ? 0.3 : (results.length / 10) * 0.3)) * 100), 100);
    
    // IQ Score Calculation (Estimated based on accuracy and logic/numerical performance)
    // Base IQ for exam takers starts at 85.
    // Max IQ contribution from accuracy is 55 points (Total 140).
    const iqScore = results.length > 0 ? Math.round(85 + (accuracy * 55)) : 0;

    return {
      categoryStats: categoryStatsArray,
      totalQuizzes: results.length,
      questionsAnswered: totalQuestions,
      dailyQuestions,
      dailyQuizzes,
      streak,
      weakestSubject,
      accuracy: Math.round(accuracy * 100),
      advanced: {
        avgResponseTime,
        difficultyStats: [
          { difficulty: 'Easy', accuracy: 90 },
          { difficulty: 'Moderate', accuracy: 65 },
          { difficulty: 'Hard', accuracy: 35 }
        ],
        mistakeTopics,
        readinessScore,
        iqScore
      }
    };
  }

  private calculateStreak(results: QuizResult[]): number {
    if (results.length === 0) return 0;
    
    const dates = results.map(r => new Date(r.timestamp).toDateString());
    const uniqueDates = Array.from(new Set(dates)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) return 0;
    
    let currentDate = new Date(uniqueDates[0]);
    for (let i = 0; i < uniqueDates.length; i++) {
      const dateStr = new Date(uniqueDates[i]).toDateString();
      const expectedDateStr = currentDate.toDateString();
      
      if (dateStr === expectedDateStr) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    return streak;
  }

  private readonly USER_KEY_PREFIX = "cse_arena_user_";

  saveUser(user: { id: string; name: string; email: string }) {
    localStorage.setItem(`${this.USER_KEY_PREFIX}${user.id}`, JSON.stringify(user));
  }

  getUser(id: string) {
    if (id === "GUEST") {
      return { id: "GUEST", name: "GUEST USER", email: "guest@example.com" };
    }
    const data = localStorage.getItem(`${this.USER_KEY_PREFIX}${id}`);
    return data ? JSON.parse(data) : null;
  }

  getHistory(userId?: string) {
    const results = this.getResults();
    if (!userId) return results.sort((a, b) => b.timestamp - a.timestamp);
    return results
      .filter(r => r.userId === userId)
      .sort((a, b) => b.timestamp - a.timestamp);
  }
}

export const storageService = new StorageService();
