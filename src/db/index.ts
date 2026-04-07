import postgres from "postgres";

console.log("🔍 DB INDEX: Loading database configuration...");

// 🔴 HARDCODED - IGNORE EVERYTHING ELSE
const DATABASE_URL = "postgresql://postgres.qipmigufldprvjynbhci:jwLn2r4cqBcmxhly@aws-1-ap-south-1.pooler.supabase.com:6543/postgres";

console.log("🔍 DB INDEX: Using URL:", DATABASE_URL.replace(/:[^:]*@/, ':***@'));

export const sql = postgres(DATABASE_URL, {
  ssl: "require",
  idle_timeout: 20,
  connect_timeout: 10,
});

export async function initDb() {
  try {
    console.log("📦 DB INDEX: initDb() called - testing connection...");
    const result = await sql`SELECT 1 as connected`;
    console.log("✅ DB INDEX: initDb() connection successful!", result);

    // Enable UUID extension
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`;

    // 1. Users Table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL DEFAULT 'User',
        first_name TEXT,
        last_name TEXT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password_hash TEXT,
        role TEXT DEFAULT 'user',
        status TEXT DEFAULT 'active',
        is_premium BOOLEAN DEFAULT false,
        premium_until TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 2. Quiz Results Table
    await sql`
      CREATE TABLE IF NOT EXISTS quiz_results (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT REFERENCES users(id),
        category TEXT NOT NULL,
        score INTEGER NOT NULL,
        total_questions INTEGER NOT NULL,
        mode TEXT DEFAULT 'practice',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 3. User Answers Table
    await sql`
      CREATE TABLE IF NOT EXISTS user_answers (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        result_id UUID REFERENCES quiz_results(id),
        user_id TEXT REFERENCES users(id),
        category TEXT NOT NULL,
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_index INTEGER NOT NULL,
        selected_index INTEGER,
        explanation TEXT,
        is_correct BOOLEAN NOT NULL,
        difficulty TEXT DEFAULT 'Moderate',
        response_time INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Ensure selected_index allows NULL (for existing tables)
    try { await sql`ALTER TABLE user_answers ALTER COLUMN selected_index DROP NOT NULL;`; } catch (e) {}
    try { await sql`ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'practice';`; } catch (e) {}
    try { await sql`ALTER TABLE user_answers ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Moderate';`; } catch (e) {}
    try { await sql`ALTER TABLE user_answers ADD COLUMN IF NOT EXISTS response_time INTEGER DEFAULT 0;`; } catch (e) {}

    // 4. Questions Table
    await sql`
      CREATE TABLE IF NOT EXISTS questions (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        category TEXT NOT NULL,
        question_text TEXT NOT NULL,
        options JSONB NOT NULL,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        difficulty TEXT DEFAULT 'Moderate',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // 5. Payment Requests Table
    await sql`
      CREATE TABLE IF NOT EXISTS payment_requests (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        user_id TEXT REFERENCES users(id),
        plan_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        reference_number TEXT NOT NULL,
        status TEXT DEFAULT 'pending', -- pending, verified, rejected
        verified_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    console.log("✅ DB INDEX: Tables initialized");

    // Ensure columns exist (for existing tables)
    try { await sql`ALTER TABLE user_answers ALTER COLUMN selected_index DROP NOT NULL;`; } catch (e) {}
    try { await sql`ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS mode TEXT DEFAULT 'practice';`; } catch (e) {}
    try { await sql`ALTER TABLE user_answers ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Moderate';`; } catch (e) {}
    try { await sql`ALTER TABLE user_answers ADD COLUMN IF NOT EXISTS response_time INTEGER DEFAULT 0;`; } catch (e) {}
    try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS premium_until TIMESTAMP WITH TIME ZONE;`; } catch (e) {}
    try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS first_name TEXT;`; } catch (e) {}
    try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_name TEXT;`; } catch (e) {}
    try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;`; } catch (e) {}
    try { await sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash TEXT;`; } catch (e) {}
    try { await sql`ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE (email);`; } catch (e) {}
    const [qCount] = await sql`SELECT COUNT(*) FROM questions`;
    if (parseInt(qCount.count) === 0) {
      console.log("🌱 DB INDEX: Seeding initial questions...");
      const seedQuestions = [
        {
          category: 'Numerical Reasoning',
          question_text: 'What is 15% of 200?',
          options: JSON.stringify(['20', '25', '30', '35']),
          correct_answer: '30',
          explanation: '15% of 200 = 0.15 * 200 = 30.',
          difficulty: 'Easy'
        },
        {
          category: 'Numerical Reasoning',
          question_text: 'If a car travels 300 km in 5 hours, what is its average speed?',
          options: JSON.stringify(['50 km/h', '60 km/h', '70 km/h', '80 km/h']),
          correct_answer: '60 km/h',
          explanation: 'Speed = Distance / Time = 300 / 5 = 60 km/h.',
          difficulty: 'Moderate'
        },
        {
          category: 'Verbal Reasoning',
          question_text: 'Choose the synonym for "ABUNDANT":',
          options: JSON.stringify(['Scarce', 'Plentiful', 'Lacking', 'Rare']),
          correct_answer: 'Plentiful',
          explanation: 'Abundant means existing or available in large quantities; plentiful.',
          difficulty: 'Easy'
        },
        {
          category: 'Verbal Reasoning',
          question_text: 'Identify the error in the sentence: "She don\'t like to eat vegetables."',
          options: JSON.stringify(['She', "don't", 'like', 'vegetables']),
          correct_answer: "don't",
          explanation: 'The subject "She" is third-person singular, so it should be "doesn\'t" instead of "don\'t".',
          difficulty: 'Moderate'
        },
        {
          category: 'General Information',
          question_text: 'Who is the current President of the Philippines?',
          options: JSON.stringify(['Rodrigo Duterte', 'Bongbong Marcos', 'Leni Robredo', 'Joseph Estrada']),
          correct_answer: 'Bongbong Marcos',
          explanation: 'Ferdinand "Bongbong" Marcos Jr. is the 17th President of the Philippines.',
          difficulty: 'Easy'
        },
        {
          category: 'General Information',
          question_text: 'What is the minimum age requirement to run for President of the Philippines?',
          options: JSON.stringify(['35', '40', '45', '50']),
          correct_answer: '40',
          explanation: 'According to the 1987 Constitution, a candidate for President must be at least 40 years of age on the day of the election.',
          difficulty: 'Moderate'
        },
        {
          category: 'Logic',
          question_text: 'If all A are B, and all B are C, then:',
          options: JSON.stringify(['All A are C', 'Some A are C', 'No A are C', 'All C are A']),
          correct_answer: 'All A are C',
          explanation: 'This is a basic syllogism. If A is a subset of B, and B is a subset of C, then A must be a subset of C.',
          difficulty: 'Moderate'
        },
        {
          category: 'Logic',
          question_text: 'Find the next number in the series: 2, 4, 8, 16, ?',
          options: JSON.stringify(['24', '30', '32', '64']),
          correct_answer: '32',
          explanation: 'Each number is multiplied by 2 to get the next number.',
          difficulty: 'Easy'
        }
      ];

      for (const q of seedQuestions) {
        await sql`
          INSERT INTO questions (category, question_text, options, correct_answer, explanation, difficulty)
          VALUES (${q.category}, ${q.question_text}, ${q.options}, ${q.correct_answer}, ${q.explanation}, ${q.difficulty})
        `;
      }
      console.log("✅ DB INDEX: Seed questions added");
    }
  } catch (error) {
    console.error("❌ DB INDEX: initDb() failed:", error);
    throw error;
  }
}
