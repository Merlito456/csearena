import { Category, Question } from "../types";

// Local fallback questions
const LOCAL_QUESTIONS: Question[] = [
  {
    id: "local-1",
    text: "Which of the following is a prime number?",
    options: ["15", "21", "27", "31"],
    correctAnswerIndex: 3,
    explanation: "31 is a prime number because it only has two factors: 1 and itself.",
    category: "Numerical Reasoning",
    difficulty: "Easy"
  },
  {
    id: "local-2",
    text: "What is the synonym of 'Meticulous'?",
    options: ["Careless", "Thorough", "Lazy", "Quick"],
    correctAnswerIndex: 1,
    explanation: "Meticulous means showing great attention to detail; very careful and precise.",
    category: "Verbal Reasoning",
    difficulty: "Moderate"
  },
  {
    id: "local-3",
    text: "If all A are B, and all B are C, then:",
    options: ["All A are C", "Some A are C", "No A are C", "All C are A"],
    correctAnswerIndex: 0,
    explanation: "This is a classic syllogism. If A is a subset of B, and B is a subset of C, then A is a subset of C.",
    category: "Logic",
    difficulty: "Moderate"
  }
];

export const getQuestionsFromDB = async (category: Category, count: number = 10, difficulty: string = "Moderate"): Promise<Question[]> => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL || "";
    const response = await fetch(`${apiUrl}/api/questions?category=${encodeURIComponent(category)}&limit=${count}&difficulty=${encodeURIComponent(difficulty)}`);
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return data;
      }
    }

    console.warn("No questions returned from DB, falling back to local questions.");
    // Fallback to local questions filtered by category
    const filtered = LOCAL_QUESTIONS.filter(q => q.category === category);
    if (filtered.length > 0) {
      return filtered.slice(0, count);
    }

    // Last resort: return all local questions
    return LOCAL_QUESTIONS.slice(0, count);
  } catch (error) {
    console.error("Error getting questions from DB:", error);
    return LOCAL_QUESTIONS.slice(0, count);
  }
};
