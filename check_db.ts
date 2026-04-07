import postgres from 'postgres';

const sql = postgres('postgresql://postgres.qipmigufldprvjynbhci:jwLn2r4cqBcmxhly@aws-1-ap-south-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require',
});

async function main() {
  try {
    const users = await sql`SELECT * FROM users LIMIT 5`;
    console.log("Users:", users);
    
    const results = await sql`SELECT * FROM quiz_results LIMIT 5`;
    console.log("Results:", results);
    
    const answers = await sql`SELECT * FROM user_answers LIMIT 5`;
    console.log("Answers:", answers);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

main();
