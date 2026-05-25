import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yeotsurnvyxzkujyazyf.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inllb3RzdXJudnl4emt1anlhenlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2MzExNjUsImV4cCI6MjA5NTIwNzE2NX0.jLFVNz_Vi22ihOxkVH9B29VZ5cXH1v5GCKxWd-WpWdY';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function main() {
  const email = `user${Math.floor(Math.random() * 100000)}@gmail.com`;
  const password = 'Password123!';
  const displayName = 'Test User';
  const city = 'Amman, JO';
  
  console.log(`1. Signing up test user: ${email}...`);
  try {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName,
          city: city,
        }
      }
    });
    
    if (signUpError) {
      console.error('Signup failed:', signUpError);
      return;
    }
    
    const user = signUpData.user;
    const session = signUpData.session;
    console.log('Signup succeeded. User ID:', user.id);
    console.log('Session metadata:', JSON.stringify(user.user_metadata, null, 2));
    
    // Get session token
    const token = signUpData.session?.access_token;
    console.log('Session token exists:', !!token);
    
    // Now simulate fetchProfileAndPartner
    console.log('\n2. Simulating fetchProfileAndPartner for User ID:', user.id);
    
    const res = await fetch(
      `${supabaseUrl}/rest/v1/users?id=eq.${user.id}&select=*&limit=1`,
      {
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${token || supabaseAnonKey}`,
          'Accept': 'application/json',
        },
      }
    );
    
    console.log('Select profile status:', res.status);
    const rows = await res.json();
    console.log('Select profile response rows:', JSON.stringify(rows, null, 2));
    
    let profile = rows[0] || null;
    
    if (!profile) {
      console.log('No profile found in DB. Inserting fallback...');
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
            id: user.id,
            email: email,
            display_name: displayName,
            city: city,
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
    console.error('Error running flow:', e);
  }
}

main();
