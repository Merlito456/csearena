
interface StudentStats {
  weakestSubject?: {
    category: string;
    accuracy: number;
  };
  accuracy: number;
  streak: number;
}

export const generateLocalAdvice = (stats: StudentStats): string => {
  const weakest = stats.weakestSubject?.category || "General Knowledge";
  const accuracy = Math.round((stats.weakestSubject?.accuracy || 0) * 100);
  const overall = stats.accuracy || 0;
  
  const adviceList = [
    `Focus on ${weakest} to boost your score above ${accuracy}%.`,
    `Great streak of ${stats.streak} days! Consistency builds mastery.`,
    `Your overall accuracy is ${overall}%. Aim for +5% this week!`,
    `Review your mistakes in ${weakest} immediately after quizzes.`,
    `Try a timed mock exam to build endurance.`,
    `Practice 10 minutes of ${weakest} daily.`,
    `Don't just guess; understand WHY you missed questions in ${weakest}.`
  ];

  // Shuffle and pick 3
  const shuffled = adviceList.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, 3).map(a => `• ${a}`).join("\n");
};
