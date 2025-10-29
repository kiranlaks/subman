#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 SubMan - Supabase Integration Verification');
console.log('=============================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

console.log(`✓ Environment file (.env.local): ${envExists ? '✅ Found' : '❌ Not found'}`);

if (!envExists) {
  console.log('  ⚠️  Run "npm run setup:supabase" to create the environment file\n');
} else {
  // Check environment variables
  require('dotenv').config({ path: envPath });
  
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_ROLE_KEY'
  ];
  
  console.log('\n📋 Environment Variables:');
  requiredVars.forEach(varName => {
    const value = process.env[varName];
    const status = value ? '✅ Set' : '❌ Missing';
    console.log(`  ${varName}: ${status}`);
  });
}

// Check API routes
console.log('\n🚀 API Routes Created:');
const apiRoutes = [
  'app/api/subscriptions/route.ts',
  'app/api/subscriptions/[id]/route.ts',
  'app/api/subscriptions/bulk/route.ts',
  'app/api/subscriptions/stats/route.ts',
  'app/api/auth/login/route.ts',
  'app/api/auth/logout/route.ts',
  'app/api/auth/register/route.ts',
  'app/api/auth/user/route.ts',
  'app/api/users/route.ts',
  'app/api/users/[id]/route.ts',
  'app/api/settings/route.ts',
  'app/api/audit-logs/route.ts'
];

apiRoutes.forEach(route => {
  const exists = fs.existsSync(path.join(process.cwd(), route));
  console.log(`  /${route.replace('app/api/', '').replace('/route.ts', '')}: ${exists ? '✅' : '❌'}`);
});

// Check Supabase files
console.log('\n📁 Supabase Integration Files:');
const supabaseFiles = [
  'lib/supabase/client.ts',
  'lib/supabase/server.ts',
  'lib/supabase/middleware.ts',
  'lib/supabase/subscriptions.ts',
  'lib/supabase/auth.ts',
  'lib/supabase/audit.ts',
  'lib/supabase/schema.sql'
];

supabaseFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`  ${file}: ${exists ? '✅' : '❌'}`);
});

// Check migration files
console.log('\n🔄 Migration Support:');
const migrationFiles = [
  'lib/migration/localStorage-to-supabase.ts',
  'components/migration-dialog.tsx'
];

migrationFiles.forEach(file => {
  const exists = fs.existsSync(path.join(process.cwd(), file));
  console.log(`  ${file}: ${exists ? '✅' : '❌'}`);
});

// Summary
console.log('\n📊 Summary:');
console.log('===========');

if (envExists && process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.log('✅ Backend is configured and ready!');
  console.log('\n📝 Next steps:');
  console.log('1. Run the schema.sql in your Supabase SQL Editor');
  console.log('2. Create an admin user');
  console.log('3. Start the app with "npm run dev"');
} else {
  console.log('❌ Backend setup is incomplete.');
  console.log('\n📝 To complete setup:');
  console.log('1. Run "npm run setup:supabase"');
  console.log('2. Follow the setup instructions');
  console.log('3. Run this verification again');
}

console.log('\n🔗 Useful links:');
console.log('- Setup Guide: SUPABASE_BACKEND_SETUP.md');
console.log('- Supabase Dashboard: https://app.supabase.com');
console.log('- Documentation: SUPABASE_SETUP.md\n');


