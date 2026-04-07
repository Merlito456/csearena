import postgres from 'postgres';

const sql = postgres('postgresql://postgres.qipmigufldprvjynbhci:jwLn2r4cqBcmxhly@aws-1-ap-south-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require',
});

async function main() {
  try {
    const res = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'quiz_results';
    `;
    console.log("quiz_results schema:", res);
    
    const res2 = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'user_answers';
    `;
    console.log("user_answers schema:", res2);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

main();
