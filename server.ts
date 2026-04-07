import "dotenv/config";
import express from "express";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import { initDb, sql } from "./src/db/index";
import path from "path";
import bcrypt from "bcryptjs";

console.log("🚀 SERVER: Starting server process...");

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Enable CORS
  app.use(cors());
  app.use(express.json());

  // 1. Bind port IMMEDIATELY to satisfy Cloud Run health check
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 SERVER: Server listening on port ${PORT}`);
  });

  console.log(`🚀 SERVER: Port configured as ${PORT}`);

  // 2. Initialize Database in background
  console.log("🚀 SERVER: Database: Initializing...");
  initDb().then(async () => {
    try {
      const result = await sql`SELECT NOW() as time`;
      console.log('🚀 SERVER: ✅ Connected to Supabase!', result[0].time);
    } catch (error) {
      console.error('🚀 SERVER: ❌ Database connection test failed:', error);
    }
  }).catch(error => {
    console.error('🚀 SERVER: ❌ Database initialization failed:', error);
  });

  // API Routes
  app.get("/api/health", async (req, res) => {
    try {
      await sql`SELECT 1`;
      res.json({ status: "ok", db: "connected", geminiKeySet: !!process.env.GEMINI_API_KEY });
    } catch (error) {
      console.error("🚀 SERVER: Database health check failed:", error);
      res.status(500).json({ status: "error", db: "disconnected", error: (error as any).message });
    }
  });

  // Helper: Check and Update Premium Status
  async function checkPremiumStatus(userId: string) {
    if (!userId || userId === "GUEST") return false;
    
    const [user] = await sql`SELECT is_premium, premium_until FROM users WHERE id = ${userId}`;
    if (!user) return false;

    if (user.is_premium && user.premium_until) {
      const now = new Date();
      const expiry = new Date(user.premium_until);
      
      if (now > expiry) {
        console.log(`⏳ Premium expired for user: ${userId}`);
        await sql`UPDATE users SET is_premium = false WHERE id = ${userId}`;
        return false;
      }
    }
    
    return user.is_premium;
  }

  // User Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { identifier, password } = req.body;
      
      if (!identifier || !password) {
        return res.status(400).json({ error: "Identifier and password are required" });
      }

      // Check if user exists by ID, Email, or Username
      const [user] = await sql`
        SELECT * FROM users 
        WHERE id = ${identifier} OR email = ${identifier} OR username = ${identifier}
      `;
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Verify password
      if (!user.password_hash) {
        return res.status(401).json({ error: "Account requires password setup. Please contact support." });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // Check premium expiration
      const isPremium = await checkPremiumStatus(user.id);
      
      // Update last active
      await sql`UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = ${user.id}`;
      
      const { password_hash, ...userWithoutPassword } = user;
      const updatedUser = { ...userWithoutPassword, is_premium: isPremium };
      return res.json(updatedUser);
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  // User Register
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { id, firstName, lastName, username, email, password } = req.body;
      
      if (!id || !firstName || !lastName || !username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
      }

      // Check if username or email already exists
      const [existingUser] = await sql`
        SELECT id FROM users WHERE username = ${username} OR email = ${email} OR id = ${id}
      `;
      if (existingUser) {
        return res.status(400).json({ error: "Username, Email, or Reviewer ID already in use" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const fullName = `${firstName} ${lastName}`;

      const [newUser] = await sql`
        INSERT INTO users (id, name, first_name, last_name, username, email, password_hash) 
        VALUES (${id}, ${fullName}, ${firstName}, ${lastName}, ${username}, ${email}, ${passwordHash}) 
        RETURNING id, name, first_name, last_name, username, email, role, status, is_premium, created_at
      `;
      
      return res.json(newUser);
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Save Quiz Result
  app.post("/api/results", async (req, res) => {
    try {
      const { category, score, totalQuestions, answers, questions, userId, mode, responseTimes } = req.body;
      
      const [quizResult] = await sql`
        INSERT INTO quiz_results (category, score, total_questions, user_id, mode) 
        VALUES (${category}, ${score}, ${totalQuestions}, ${userId}, ${mode || 'practice'})
        RETURNING id
      `;
      
      const resultId = quizResult.id;

      const answerRows = questions.map((q: any) => {
        const selected = answers[q.id];
        const isCorrect = selected === q.correctAnswerIndex;
        const responseTime = responseTimes ? (responseTimes[q.id] || 0) : 0;
        
        // Ensure question_id is a valid UUID, otherwise leave it null
        const isValidUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(q.id);
        
        return {
          result_id: resultId,
          user_id: userId,
          question_id: isValidUuid ? q.id : null,
          category: q.category || category,
          question_text: q.text,
          options: sql.json(q.options),
          correct_index: q.correctAnswerIndex,
          selected_index: selected !== undefined ? selected : null,
          explanation: q.explanation,
          is_correct: isCorrect,
          difficulty: q.difficulty || 'Moderate',
          response_time: responseTime
        };
      });

      if (answerRows.length > 0) {
        await sql`
          INSERT INTO user_answers ${sql(answerRows)}
        `;
      }

      res.json({ id: resultId, success: true });
    } catch (error) {
      console.error("Error saving result:", error);
      res.status(500).json({ error: "Failed to save result" });
    }
  });

  // Get Mistakes
  app.get("/api/mistakes", async (req, res) => {
    try {
      const { userId } = req.query;
      const mistakes = await sql`
        SELECT * FROM user_answers 
        WHERE is_correct = false 
        AND user_id = ${userId as string}
        ORDER BY created_at DESC 
        LIMIT 50
      `;
      
      const parsedMistakes = mistakes.map((m: any) => {
        const options = typeof m.options === 'string' ? JSON.parse(m.options) : m.options;
        return {
          ...m,
          options,
          correct_index: options.indexOf(m.correct_answer),
          selected_index: m.selected_answer ? options.indexOf(m.selected_answer) : null
        };
      });
      
      res.json(parsedMistakes);
    } catch (error) {
      console.error("Error fetching mistakes:", error);
      res.status(500).json({ error: "Failed to fetch mistakes" });
    }
  });

  // Get User Stats & Progress
  app.get("/api/stats", async (req, res) => {
    try {
      const { userId } = req.query;
      if (!userId) return res.status(400).json({ error: "User ID required" });

      const stats = await sql`
        SELECT 
          category,
          COUNT(*) as quizzes_taken,
          SUM(score) as total_score,
          SUM(total_questions) as total_questions
        FROM quiz_results
        WHERE user_id = ${userId as string}
        GROUP BY category
      `;
      
      const [totalQuizzes] = await sql`
        SELECT COUNT(*) as count FROM quiz_results 
        WHERE user_id = ${userId as string}
      `;
      
      // Daily Progress (Questions answered today)
      const [dailyProgress] = await sql`
        SELECT COUNT(*) as count 
        FROM user_answers 
        WHERE created_at::date = CURRENT_DATE
        AND user_id = ${userId as string}
      `;

      // Daily Quizzes (Quizzes taken today)
      const [dailyQuizzes] = await sql`
        SELECT COUNT(*) as count 
        FROM quiz_results 
        WHERE created_at::date = CURRENT_DATE
        AND user_id = ${userId as string}
      `;

      // Simple Streak Calculation
      const distinctDays = await sql`
        SELECT DISTINCT created_at::date as day 
        FROM quiz_results 
        WHERE user_id = ${userId as string}
        ORDER BY day DESC 
        LIMIT 30
      `;

      // Weakest Subject
      const [weakest] = await sql`
        SELECT category, CAST(SUM(score) AS FLOAT) / SUM(total_questions) as accuracy
        FROM quiz_results
        WHERE user_id = ${userId as string}
        GROUP BY category
        ORDER BY accuracy ASC
        LIMIT 1
      `;

      // Advanced Analytics (Premium)
      const [avgResponseTime] = await sql`
        SELECT AVG(response_time) as avg_time 
        FROM user_answers 
        WHERE user_id = ${userId as string} AND response_time > 0
      `;

      const difficultyStats = await sql`
        SELECT difficulty, COUNT(*) as total, SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct
        FROM user_answers
        WHERE user_id = ${userId as string}
        GROUP BY difficulty
      `;

      const mistakeTopics = await sql`
        SELECT category, COUNT(*) as count
        FROM user_answers
        WHERE user_id = ${userId as string} AND is_correct = false
        GROUP BY category
        ORDER BY count DESC
        LIMIT 3
      `;

      // Readiness Calculation
      const [overallAccuracy] = await sql`
        SELECT CAST(SUM(score) AS FLOAT) / SUM(total_questions) as accuracy
        FROM quiz_results
        WHERE user_id = ${userId as string}
      `;

      const readinessScore = Math.round((parseFloat(overallAccuracy.accuracy || '0') * 0.7 + (parseInt(totalQuizzes.count) > 10 ? 0.3 : (parseInt(totalQuizzes.count) / 10) * 0.3)) * 100);

      const [userRow] = await sql`SELECT is_premium, premium_until FROM users WHERE id = ${userId as string}`;
      let isPremium = userRow ? userRow.is_premium : false;

      // Check expiration if premium
      if (isPremium && userRow.premium_until) {
        const now = new Date();
        const expiry = new Date(userRow.premium_until);
        if (now > expiry) {
          await sql`UPDATE users SET is_premium = false WHERE id = ${userId as string}`;
          isPremium = false;
        }
      }

      res.json({
        categoryStats: stats.map(s => ({
          ...s,
          quizzes_taken: parseInt(s.quizzes_taken),
          total_score: parseInt(s.total_score),
          total_questions: parseInt(s.total_questions)
        })),
        totalQuizzes: parseInt(totalQuizzes.count),
        dailyQuestions: parseInt(dailyProgress.count),
        dailyQuizzes: parseInt(dailyQuizzes.count),
        streak: calculateStreak(distinctDays.map(d => ({ day: d.day.toISOString().split('T')[0] }))),
        weakestSubject: weakest ? {
          ...weakest,
          accuracy: parseFloat(weakest.accuracy)
        } : null,
        isPremium,
        advanced: {
          avgResponseTime: parseFloat(avgResponseTime.avg_time || '0'),
          difficultyStats: difficultyStats.map(d => ({
            difficulty: d.difficulty,
            accuracy: d.total > 0 ? (d.correct / d.total) * 100 : 0
          })),
          mistakeTopics: mistakeTopics.map(t => t.category),
          readinessScore: Math.min(readinessScore, 100)
        }
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  function calculateStreak(days: { day: string }[]) {
    if (days.length === 0) return 0;
    
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (days[0].day !== today && days[0].day !== yesterday) {
      return 0;
    }

    let currentDate = new Date(days[0].day);
    
    for (let i = 0; i < days.length; i++) {
      const day = new Date(days[i].day);
      const diffTime = Math.abs(currentDate.getTime() - day.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (i === 0 || diffDays <= 1) {
         streak++;
         currentDate = day;
      } else {
        break;
      }
    }
    return streak;
  }

  // Get Exam History
  app.get("/api/history", async (req, res) => {
    try {
      const { userId } = req.query;
      const history = await sql`
        SELECT * FROM quiz_results 
        WHERE user_id = ${userId as string}
        ORDER BY created_at DESC 
        LIMIT 50
      `;
      res.json(history);
    } catch (error) {
      console.error("Error fetching history:", error);
      res.status(500).json({ error: "Failed to fetch history" });
    }
  });

  // Admin: Get all users
  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await sql`
        SELECT 
          u.*,
          (SELECT COUNT(*) FROM quiz_results WHERE user_id = u.id) as quizzes_completed,
          (SELECT AVG(score * 100.0 / total_questions) FROM quiz_results WHERE user_id = u.id) as avg_accuracy
        FROM users u
        ORDER BY u.created_at DESC
      `;
      res.json(users);
    } catch (error) {
      console.error("Failed to fetch admin users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Admin: Update user status/role
  app.post("/api/admin/users/update", async (req, res) => {
    const { id, role, status, is_premium } = req.body;
    try {
      await sql`
        UPDATE users 
        SET 
          role = ${role}, 
          status = ${status}, 
          is_premium = ${is_premium}
        WHERE id = ${id}
      `;
      res.json({ success: true });
    } catch (error) {
      console.error("Failed to update user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Get All Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await sql`
        SELECT DISTINCT category FROM questions
      `;
      res.json(categories.map(c => c.category));
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  // Get Questions (Practice)
  app.get("/api/questions", async (req, res) => {
    try {
      const { category, limit, difficulty } = req.query;
      const questionLimit = parseInt(limit as string) || 10;
      
      console.log(`🔍 Fetching questions: category=${category}, difficulty=${difficulty}, limit=${questionLimit}`);

      // Try with specific difficulty first
      let questions = [];
      
      if (difficulty && difficulty !== 'Mixed' && difficulty !== 'Adaptive') {
        questions = await sql`
          SELECT * FROM questions 
          WHERE category = ${category as string} 
          AND difficulty = ${difficulty as string}
          ORDER BY RANDOM()
          LIMIT ${questionLimit}
        `;
      }

      // If no questions found with specific difficulty, or no difficulty specified
      if (questions.length === 0) {
        console.log(`⚠️ No questions found for ${category} with difficulty ${difficulty}. Trying any difficulty...`);
        questions = await sql`
          SELECT * FROM questions 
          WHERE category = ${category as string}
          ORDER BY RANDOM()
          LIMIT ${questionLimit}
        `;
      }

      if (questions.length === 0) {
        console.log(`❌ Still no questions found for category: ${category}`);
        // Check if there are ANY questions in this category at all
        const [count] = await sql`SELECT COUNT(*) FROM questions WHERE category = ${category as string}`;
        console.log(`📊 Total questions in DB for ${category}: ${count.count}`);
      }
      
      res.json(questions.map(q => ({
        id: q.id,
        category: q.category,
        text: q.question_text,
        options: q.options,
        correctAnswerIndex: q.options.indexOf(q.correct_answer),
        explanation: q.explanation,
        tags: q.tags || []
      })));
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Admin: Get all questions
  app.get("/api/admin/questions", async (req, res) => {
    try {
      const questions = await sql`SELECT * FROM questions ORDER BY created_at DESC`;
      res.json(questions);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Admin: Batch Save Questions
  app.post("/api/admin/questions/batch", async (req, res) => {
    try {
      const { questions } = req.body;
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ error: "Invalid questions format" });
      }

      const rows = questions.map(q => ({
        category: q.category,
        question_text: q.text,
        options: q.options,
        correct_answer: q.options[q.correctAnswerIndex],
        explanation: q.explanation,
        difficulty: q.difficulty || 'Moderate',
        tags: q.tags || []
      }));

      await sql`
        INSERT INTO questions ${sql(rows)}
      `;

      res.json({ success: true, count: questions.length });
    } catch (error) {
      console.error("Failed to batch save questions:", error);
      res.status(500).json({ error: "Failed to save questions" });
    }
  });

  // Admin: Get Dashboard Stats
  app.get("/api/admin/dashboard-stats", async (req, res) => {
    try {
      const [totalUsers] = await sql`SELECT COUNT(*) as count FROM users`;
      const [premiumUsers] = await sql`SELECT COUNT(*) as count FROM users WHERE is_premium = true`;
      const [totalQuizzes] = await sql`SELECT COUNT(*) as count FROM quiz_results`;
      
      const [revenueToday] = await sql`
        SELECT COALESCE(SUM(amount), 0) as total 
        FROM payment_requests 
        WHERE status = 'verified' AND DATE(verified_at) = CURRENT_DATE
      `;
      
      res.json({
        totalUsers: parseInt(totalUsers.count),
        premiumUsers: parseInt(premiumUsers.count),
        totalQuizzes: parseInt(totalQuizzes.count),
        revenueToday: parseInt(revenueToday.total),
        aiUsageToday: 0
      });
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // Admin: Get Revenue Data
  app.get("/api/admin/revenue", async (req, res) => {
    try {
      const revenue = await sql`
        SELECT 
          TO_CHAR(verified_at, 'Mon') as name,
          SUM(amount) as total
        FROM payment_requests
        WHERE status = 'verified' 
          AND verified_at >= CURRENT_DATE - INTERVAL '6 months'
        GROUP BY TO_CHAR(verified_at, 'Mon'), DATE_TRUNC('month', verified_at)
        ORDER BY DATE_TRUNC('month', verified_at) ASC
      `;
      
      if (revenue.length === 0) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
        return res.json(months.map(m => ({ name: m, total: 0 })));
      }
      
      res.json(revenue);
    } catch (error) {
      console.error("Failed to fetch revenue:", error);
      res.status(500).json({ error: "Failed to fetch revenue" });
    }
  });

  // Admin: Get Weak Topics
  app.get("/api/admin/weak-topics", async (req, res) => {
    try {
      const topics = await sql`
        SELECT category as topic, 
               CAST(COUNT(CASE WHEN is_correct = false THEN 1 END) AS FLOAT) / COUNT(*) * 100 as fail_rate
        FROM user_answers
        GROUP BY category
        ORDER BY fail_rate DESC
        LIMIT 5
      `;
      res.json(topics.map(t => ({ topic: t.topic, failRate: Math.round(t.fail_rate || 0) })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch weak topics" });
    }
  });

  // Admin: Get Alerts
  app.get("/api/admin/alerts", async (req, res) => {
    try {
      const alerts = [];
      
      const [pendingPayments] = await sql`SELECT COUNT(*) as count FROM payment_requests WHERE status = 'pending'`;
      if (parseInt(pendingPayments.count) > 0) {
        alerts.push({
          type: "warning",
          title: "Pending Payments",
          message: `${pendingPayments.count} manual payment request(s) waiting for verification.`
        });
      }

      const [expiringPremiums] = await sql`
        SELECT COUNT(*) as count FROM users 
        WHERE is_premium = true 
          AND premium_until IS NOT NULL 
          AND premium_until <= CURRENT_TIMESTAMP + INTERVAL '3 days'
          AND premium_until >= CURRENT_TIMESTAMP
      `;
      if (parseInt(expiringPremiums.count) > 0) {
        alerts.push({
          type: "info",
          title: "Expiring Subscriptions",
          message: `${expiringPremiums.count} premium subscription(s) expiring in the next 3 days.`
        });
      }

      const [rejectedPayments] = await sql`
        SELECT COUNT(*) as count FROM payment_requests 
        WHERE status = 'rejected' AND DATE(created_at) = CURRENT_DATE
      `;
      if (parseInt(rejectedPayments.count) > 0) {
        alerts.push({
          type: "error",
          title: "Rejected Payments",
          message: `${rejectedPayments.count} payment request(s) were rejected today.`
        });
      }

      res.json(alerts);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });

  // Admin: Get Leaderboard
  app.get("/api/admin/leaderboard", async (req, res) => {
    try {
      const leaders = await sql`
        SELECT name, 
               CAST(SUM(score) AS FLOAT) / SUM(total_questions) * 100 as accuracy,
               COUNT(*) as quizzes
        FROM quiz_results
        JOIN users ON quiz_results.user_id = users.id
        GROUP BY name, users.id
        ORDER BY accuracy DESC
        LIMIT 10
      `;
      res.json(leaders.map((l, i) => ({
        name: l.name,
        score: `${Math.round(l.accuracy)}%`,
        rank: i + 1,
        avatar: l.name.split(' ').map((n: string) => n[0]).join('')
      })));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Public Leaderboard
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const { period } = req.query;
      let interval = "100 years"; // Default to all time
      
      if (period === "daily") interval = "1 day";
      else if (period === "weekly") interval = "7 days";
      else if (period === "monthly") interval = "30 days";

      const leaders = await sql`
        SELECT 
          u.id,
          u.name, 
          SUM(qr.score * 10) as xp,
          CAST(SUM(qr.score) AS FLOAT) / SUM(qr.total_questions) * 100 as accuracy,
          COUNT(qr.id) as total_quizzes
        FROM users u
        JOIN quiz_results qr ON u.id = qr.user_id
        WHERE qr.created_at >= CURRENT_TIMESTAMP - ${interval}::interval
        GROUP BY u.id, u.name
        ORDER BY xp DESC
        LIMIT 50
      `;

      // Get streaks for these users (simplified: just return 0 for now or calculate if needed)
      // For now, let's just return the basic stats
      res.json(leaders.map((l, i) => ({
        id: l.id,
        rank: i + 1,
        name: l.name,
        xp: parseInt(l.xp),
        accuracy: Math.round(parseFloat(l.accuracy || '0')),
        streak: 0, // Streak calculation is complex for bulk users, keeping it 0 for now
        change: "same" as const
      })));
    } catch (error) {
      console.error("Leaderboard error:", error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // User: Update profile
  app.post("/api/user/update", async (req, res) => {
    const { id, name, email } = req.body;
    try {
      const [updatedUser] = await sql`
        UPDATE users 
        SET 
          name = ${name}, 
          email = ${email}
        WHERE id = ${id}
        RETURNING *
      `;
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error("Failed to update profile:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });

  // PayMongo: Create Payment Link
  app.post("/api/paymongo/create-link", async (req, res) => {
    try {
      const { amount, description, userId } = req.body;
      const secretKey = process.env.PAYMONGO_SECRET_KEY;

      if (!secretKey) {
        return res.status(500).json({ error: "PayMongo secret key not configured" });
      }

      const response = await fetch("https://api.paymongo.com/v1/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Basic ${Buffer.from(secretKey).toString("base64")}`
        },
        body: JSON.stringify({
          data: {
            attributes: {
              amount: amount * 100, // Convert to cents
              description: description,
              remarks: userId // Store userId in remarks for webhook identification
            }
          }
        })
      });

      const data = await response.json();
      if (!response.ok) {
        console.error("PayMongo Error:", data);
        return res.status(response.status).json(data);
      }

      res.json(data.data.attributes);
    } catch (error) {
      console.error("PayMongo Link Creation Error:", error);
      res.status(500).json({ error: "Failed to create payment link" });
    }
  });

  // PayMongo: Webhook
  app.post("/api/paymongo/webhook", async (req, res) => {
    try {
      const payload = req.body;
      const eventType = payload.data.attributes.type;

      if (eventType === "link.payment.paid") {
        const paymentData = payload.data.attributes.data;
        const userId = paymentData.attributes.remarks;
        const description = paymentData.attributes.description || "";
        
        let durationDays = 30;
        if (description.toLowerCase().includes("quarterly")) durationDays = 90;
        if (description.toLowerCase().includes("lifetime")) durationDays = 36500; // 100 years

        if (userId) {
          console.log(`💰 PayMongo: Payment successful for user: ${userId} (${description})`);
          await sql`
            UPDATE users 
            SET is_premium = true,
                premium_until = CURRENT_TIMESTAMP + ${durationDays + ' days'}::interval
            WHERE id = ${userId}
          `;
        }
      }

      res.json({ received: true });
    } catch (error) {
      console.error("PayMongo Webhook Error:", error);
      res.status(500).json({ error: "Webhook processing failed" });
    }
  });

  // Manual Payments: Submit Request
  app.post("/api/payments/submit", async (req, res) => {
    try {
      const { userId, planId, amount, referenceNumber } = req.body;
      
      if (!userId || !planId || !amount || !referenceNumber) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const [request] = await sql`
        INSERT INTO payment_requests (user_id, plan_id, amount, reference_number)
        VALUES (${userId}, ${planId}, ${amount}, ${referenceNumber})
        RETURNING *
      `;

      res.json(request);
    } catch (error) {
      console.error("Payment Submission Error:", error);
      res.status(500).json({ error: "Failed to submit payment request" });
    }
  });

  // Admin: List Payment Requests
  app.get("/api/admin/payments", async (req, res) => {
    try {
      const status = req.query.status as string;
      const requests = await sql`
        SELECT pr.*, u.name as user_name, u.email as user_email
        FROM payment_requests pr
        JOIN users u ON pr.user_id = u.id
        WHERE pr.status = ${status || 'pending'}
        ORDER BY pr.created_at DESC
      `;
      res.json(requests);
    } catch (error) {
      console.error("Admin Payments Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch payment requests" });
    }
  });

  // Admin: Verify Payment
  app.post("/api/admin/payments/verify", async (req, res) => {
    try {
      const { requestId, status, adminId } = req.body;
      
      if (!requestId || !status) {
        return res.status(400).json({ error: "Missing requestId or status" });
      }

      const [request] = await sql`
        SELECT * FROM payment_requests WHERE id = ${requestId}
      `;

      if (!request) {
        return res.status(404).json({ error: "Payment request not found" });
      }

      if (status === "verified") {
        let durationDays = 30;
        if (request.plan_id === "quarterly") durationDays = 90;
        if (request.plan_id === "lifetime") durationDays = 36500;

        await sql.begin(async (tx: any) => {
          await tx`
            UPDATE payment_requests 
            SET status = 'verified', verified_at = CURRENT_TIMESTAMP
            WHERE id = ${requestId}
          `;
          
          await tx`
            UPDATE users 
            SET is_premium = true,
                premium_until = CURRENT_TIMESTAMP + ${durationDays} * interval '1 day'
            WHERE id = ${request.user_id}
          `;
        });
      } else {
        await sql`
          UPDATE payment_requests SET status = ${status} WHERE id = ${requestId}
        `;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Admin Payment Verification Error:", error);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Get Receipt/Certificate
  app.get("/api/payments/receipt/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const [user] = await sql`SELECT * FROM users WHERE id = ${userId}`;
      
      if (!user || !user.is_premium) {
        return res.status(404).json({ error: "No active premium subscription found" });
      }

      // In a real app, we'd fetch the latest successful payment
      // For now, we'll return a mock receipt data
      res.json({
        receiptNumber: `OR-${Math.floor(100000 + Math.random() * 900000)}`,
        date: user.premium_until, // Use expiry or some other date
        userName: user.name,
        userEmail: user.email,
        status: "PAID",
        expiry: user.premium_until
      });
    } catch (error) {
      console.error("Receipt Fetch Error:", error);
      res.status(500).json({ error: "Failed to fetch receipt" });
    }
  });

  // Catch-all for unhandled API routes
  app.use('/api/*', (req, res) => {
    console.log(`❌ Unhandled API route: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: `API endpoint not found: ${req.method} ${req.originalUrl}` });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("🚀 SERVER: Running in DEVELOPMENT mode");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("🚀 SERVER: Running in PRODUCTION mode");
    app.use(express.static("dist"));
    // SPA fallback for production
    app.get("*", (req, res) => {
      const indexPath = path.resolve("dist", "index.html");
      console.log(`🚀 SERVER: Serving SPA fallback from ${indexPath}`);
      res.sendFile(indexPath);
    });
  }
}

startServer().catch(err => {
  console.error("🚀 SERVER: FATAL ERROR DURING STARTUP:", err);
  process.exit(1);
});
