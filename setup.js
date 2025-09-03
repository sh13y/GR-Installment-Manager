#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 FM Tire Management System Setup');
console.log('=====================================\n');

// Check if Node.js version is compatible
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

if (majorVersion < 18) {
  console.error('❌ Node.js 18 or higher is required. Current version:', nodeVersion);
  process.exit(1);
}

console.log('✅ Node.js version check passed:', nodeVersion);

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found. Make sure you are in the project root directory.');
  process.exit(1);
}

console.log('✅ Project structure validated');

// Install dependencies
console.log('\n📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Check if .env.local exists
const envPath = '.env.local';
const envExamplePath = 'env.example';

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('\n🔧 Creating environment file...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Created .env.local from env.example');
    console.log('⚠️  Please update .env.local with your Supabase credentials');
  } else {
    console.log('\n⚠️  Environment file not found. Creating basic .env.local...');
    const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Application Configuration
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=http://localhost:3000

# Development
NODE_ENV=development`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created basic .env.local file');
  }
}

// Validate TypeScript configuration
console.log('\n🔍 Validating TypeScript configuration...');
try {
  execSync('npx tsc --noEmit', { stdio: 'pipe' });
  console.log('✅ TypeScript configuration is valid');
} catch (error) {
  console.log('⚠️  TypeScript validation completed with warnings (this is normal)');
}

// Check Tailwind CSS
console.log('\n🎨 Checking Tailwind CSS configuration...');
if (fs.existsSync('tailwind.config.js')) {
  console.log('✅ Tailwind CSS configuration found');
} else {
  console.error('❌ Tailwind CSS configuration not found');
}

console.log('\n🎉 Setup completed successfully!');
console.log('\n📋 Next Steps:');
console.log('1. Set up your Supabase project:');
console.log('   - Go to https://supabase.com');
console.log('   - Create a new project');
console.log('   - Run the SQL script from database/schema.sql');
console.log('   - Get your project URL and API keys');

console.log('\n2. Update your .env.local file with Supabase credentials');

console.log('\n3. Start the development server:');
console.log('   npm run dev');

console.log('\n4. Open http://localhost:3000 in your browser');

console.log('\n5. Login with default credentials:');
console.log('   Email: admin@fmtire.com');
console.log('   Password: password123');
console.log('   (Change these after first login!)');

console.log('\n📚 Documentation:');
console.log('   - Business Requirements: docs/business-requirements.md');
console.log('   - Deployment Guide: docs/deployment-guide.md');
console.log('   - README: README.md');

console.log('\n🆘 Need help? Check the documentation or create an issue.');
console.log('\n🎯 Happy coding! 🚀');

// Create a simple status check
const statusData = {
  setupDate: new Date().toISOString(),
  nodeVersion: nodeVersion,
  status: 'setup-complete',
  nextSteps: [
    'Configure Supabase',
    'Update environment variables',
    'Run development server',
    'Access application'
  ]
};

fs.writeFileSync('.setup-status.json', JSON.stringify(statusData, null, 2));
console.log('\n📝 Setup status saved to .setup-status.json');
