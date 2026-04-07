export type Category = 'Numerical Reasoning' | 'Verbal Reasoning' | 'General Information' | 'Clerical Ability' | 'Logic';

export type QuizMode = 
  | 'standard' 
  | 'recognition' 
  | 'topnotcher' 
  | 'looksfam' 
  | 'psych' 
  | 'ladder' 
  | 'mastery' 
  | 'coaching' 
  | 'simulation'
  | 'quick-start'
  | 'flash-review';

export interface Question {
  id: string;
  category: Category;
  text: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
  difficulty?: string;
  tags?: string[];
}

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: Record<string, number>; // questionId -> selectedIndex
  responseTimes: Record<string, number>; // questionId -> time in seconds
  isFinished: boolean;
  score: number;
  isLoading: boolean;
  mode: QuizMode;
}

export interface MockExamCoverage {
  subject: string;
  percentage: number;
  color: string;
}

export interface MockExam {
  id: string;
  title: string;
  description: string;
  questions: number;
  timeLimit: number; // in minutes
  passingScore: number;
  startDate: string;
  endDate: string;
  coverage: MockExamCoverage[];
}

export interface UserStats {
  totalQuestionsAnswered: number;
  correctAnswers: number;
  categoryScores: Record<Category, { correct: number; total: number }>;
}
