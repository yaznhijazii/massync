import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yeotsurnvyxzkujyazyf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllb3RzdXJudnl4emt1anlhenlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MzExNjUsImV4cCI6MjA5NTIwNzE2NX0.jLFVNz_Vi22ihOxkVH9B29VZ5cXH1v5GCKxWd-WpWdY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const email = 'user88445@gmail.com';
  const password = 'Password123!';
  
  console.log(`Attempting login for: ${email}...`);
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error('Login failed:', error);
      return;
    }
    
    console.log('Login succeeded! User ID:', data.user.id);
    const token = data.session.access_token;
    
    console.log('\nQuerying profile for User ID:', data.user.id);
    const res = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${data.user.id}&select=*&limit=1`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      }
    );
    
    console.log('Select profile status:', res.status);
    const rows = await res.json();
    console.log('Select profile response rows:', JSON.stringify(rows, null, 2));
    
    let profile = rows[0] || null;
    
    if (!profile) {
      console.log('No profile found. Attempting fallback insert...');
      const invite_code = 'MAS-' + Math.random().toString(36).substring(2, 6).toUpperCase();
      
      const insertRes = await fetch(
        `${supabaseUrl}/rest/v1/users`,
        {
          method: 'POST',
          headers: {
            'apikey': supabaseAnonKey,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            id: data.user.id,
            email: email,
            display_name: 'Test User',
            city: 'Amman, JO',
            invite_code,
          }),
        }
      );
      
      console.log('Insert profile status:', insertRes.status);
      const insertedRows = await insertRes.json();
      console.log('Insert profile response:', JSON.stringify(insertedRows, null, 2));
      profile = insertedRows[0] || null;
    }
    
    console.log('Final profile loaded:', JSON.stringify(profile, null, 2));
  } catch (e) {
    console.error('Error running login test:', e);
  }
}

main();
