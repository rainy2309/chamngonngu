const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Parse .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    const key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) {
      value = value.substring(1, value.length - 1);
    } else if (value.startsWith("'") && value.endsWith("'")) {
      value = value.substring(1, value.length - 1);
    }
    env[key] = value.trim();
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Env variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log("Checking Supabase connection and tables...");

  // 1. Check Profiles
  const { data: profiles, error: pError } = await supabase
    .from('profiles')
    .select('id, full_name, role');
  
  if (pError) {
    console.error("Error fetching profiles:", pError);
  } else {
    console.log("\nProfiles in DB:");
    console.table(profiles);
  }

  // 2. Check Word Contributions
  const { data: contributions, error: cError } = await supabase
    .from('word_contributions')
    .select('id, word_text, status, user_id');

  if (cError) {
    console.error("Error fetching word_contributions:", cError);
  } else {
    console.log("\nWord Contributions in DB:");
    console.table(contributions);
  }
}

run();
