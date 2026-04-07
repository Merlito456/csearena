import { LucideIcon } from "lucide-react";

export type AdminView = "dashboard" | "users" | "content" | "ai" | "analytics" | "settings" | "payments";
export type CMSTab = "questions" | "flashcards" | "exams" | "quizzes" | "achievements" | "subjects";
export type AITab = "generation" | "templates" | "analytics" | "history" | "config";
export type AnalyticsTab = "overview" | "engagement" | "content" | "learning" | "premium";
export type SettingsTab = "general" | "quiz" | "adaptive" | "ai" | "subscription" | "notifications" | "security" | "gamification" | "licensing";

export interface User {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  email: string;
  role: "User" | "Premium" | "Moderator" | "Content Manager" | "Admin" | "Superadmin";
  plan: "Free" | "Premium";
  status: "Active" | "Suspended";
  joinedDate: string;
  quizzesCompleted: number;
  accuracy: number;
  lastLogin: string;
  aiUsage: {
    explanations: number;
    generations: number;
    quotaRemaining: number;
  };
  streak: number;
  rank: number;
}

export interface Question {
  id: string;
  text: string;
  subject: string;
  topic: string;
  difficulty: "Easy" | "Medium" | "Hard";
  type: "MCQ" | "True/False";
  status: "Published" | "Draft" | "Archived";
  createdBy: string;
  updatedAt: string;
}

export interface PromptTemplate {
  id: string;
  name: string;
  subject: string;
  difficulty: string;
  prompt: string;
}

export interface GenerationLog {
  id: string;
  date: string;
  admin: string;
  type: string;
  status: "Approved" | "Pending" | "Rejected";
  tokens: number;
}
