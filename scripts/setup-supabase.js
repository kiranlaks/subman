#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

console.log('🚀 SubMan - Supabase Setup Script');
console.log('==================================\n');

async function setupSupabase() {
  try {
    // Check if .env.local exists
    const envPath = path.join(process.cwd(), '.env.local');
    const envExamplePath = path.join(process.cwd(), '.env.example');
    
    // Create .env.example if it doesn't exist
    if (!fs.existsSync(envExamplePath)) {
      const envExampleContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Configuration
NEXT_PUBLIC_APP_NAME=SubMan
NEXT_PUBLIC_APP_VERSION=1.0.0
`;
      fs.writeFileSync(envExamplePath, envExampleContent);
      console.log('✅ Created .env.example file');
    }

    if (fs.existsSync(envPath)) {
      const overwrite = await question('\n⚠️  .env.local already exists. Do you want to overwrite it? (y/N): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Keeping existing .env.local file.');
        return;
      }
    }

    console.log('\n📋 Please have your Supabase project credentials ready.');
    console.log('You can find them in your Supabase dashboard under Settings > API\n');

    const supabaseUrl = await question('Enter your Supabase Project URL: ');
    const supabaseAnonKey = await question('Enter your Supabase Anon/Public Key: ');
    const supabaseServiceKey = await question('Enter your Supabase Service Role Key: ');

    // Validate inputs
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error('\n❌ All Supabase credentials are required!');
      process.exit(1);
    }

    if (!supabaseUrl.includes('supabase.co')) {
      console.error('\n❌ Invalid Supabase URL format!');
      process.exit(1);
    }

    // Create .env.local file
    const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# Application Configuration
NEXT_PUBLIC_APP_NAME=SubMan
NEXT_PUBLIC_APP_VERSION=1.0.0
`;

    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Created .env.local file with your credentials');

    // Display next steps
    console.log('\n📝 Next Steps:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy the contents of lib/supabase/schema.sql');
    console.log('4. Paste and run it in the SQL Editor');
    console.log('5. Create your first admin user');
    console.log('\n🎯 Quick commands:');
    console.log('   npm run dev        - Start development server');
    console.log('   npm run build      - Build for production');
    console.log('   npm start          - Start production server');

    // Ask if user wants to open Supabase dashboard
    const openDashboard = await question('\n🌐 Would you like to open your Supabase dashboard now? (Y/n): ');
    if (openDashboard.toLowerCase() !== 'n') {
      const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1];
      if (projectRef) {
        const dashboardUrl = `https://app.supabase.com/project/${projectRef}/editor`;
        console.log(`\nOpening ${dashboardUrl}...`);
        
        // Try to open the URL based on the platform
        try {
          if (process.platform === 'win32') {
            execSync(`start ${dashboardUrl}`);
          } else if (process.platform === 'darwin') {
            execSync(`open ${dashboardUrl}`);
          } else {
            execSync(`xdg-open ${dashboardUrl}`);
          }
        } catch (error) {
          console.log('Could not open browser automatically. Please open the URL manually.');
        }
      }
    }

    console.log('\n✨ Setup complete! Happy coding with SubMan!');

  } catch (error) {
    console.error('\n❌ Error during setup:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the setup
setupSupabase();

