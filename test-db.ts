import { sql } from './src/db/index.js';

(async () => {
  try {
    const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'quiz_results';
    `;
    console.log(columns);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    process.exit(0);
  }
})();
