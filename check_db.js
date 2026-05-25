// Fetch is built-in in Node 22

const supabaseUrl = 'https://yeotsurnvyxzkujyazyf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllb3RzdXJudnl4emt1anlhenlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MzExNjUsImV4cCI6MjA5NTIwNzE2NX0.jLFVNz_Vi22ihOxkVH9B29VZ5cXH1v5GCKxWd-WpWdY';

async function main() {
  try {
    console.log('Querying Supabase users table...');
    const res = await fetch(`${supabaseUrl}/rest/v1/users?select=*`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    
    if (!res.ok) {
      console.error('Failed to fetch:', res.status, await res.text());
      return;
    }
    
    const users = await res.json();
    console.log('--- USERS IN DATABASE ---');
    console.log(JSON.stringify(users, null, 2));
    
    console.log('\nQuerying Supabase pairs table...');
    const pairRes = await fetch(`${supabaseUrl}/rest/v1/pairs?select=*`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });
    const pairs = await pairRes.json();
    console.log('--- PAIRS IN DATABASE ---');
    console.log(JSON.stringify(pairs, null, 2));
    
  } catch (e) {
    console.error('Error running check:', e);
  }
}

main();
