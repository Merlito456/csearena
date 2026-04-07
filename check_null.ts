import postgres from 'postgres';

const sql = postgres('postgresql://postgres.qipmigufldprvjynbhci:jwLn2r4cqBcmxhly@aws-1-ap-south-1.pooler.supabase.com:6543/postgres', {
  ssl: 'require',
});

async function main() {
  try {
    const res = await sql`
      SELECT column_name, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'user_answers';
    `;
    console.log("user_answers nullability:", res);
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

main();
