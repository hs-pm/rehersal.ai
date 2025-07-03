console.log('🔍 Environment Variables Check\n');

// Check for database URLs
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Not set');
console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? '✅ Set' : '❌ Not set');

// Check for other important variables
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? '✅ Set' : '❌ Not set');
console.log('BLOB_READ_WRITE_TOKEN:', process.env.BLOB_READ_WRITE_TOKEN ? '✅ Set' : '❌ Not set');
console.log('NEXTAUTH_SECRET:', process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Not set');
console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL ? '✅ Set' : '❌ Not set');

// Check NODE_ENV
console.log('NODE_ENV:', process.env.NODE_ENV || 'development');

console.log('\n📋 Summary:');
if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
  console.log('❌ No database connection string found!');
  console.log('💡 You need to create a .env.local file with your database credentials.');
  console.log('📝 Copy env.example to .env.local and fill in your Railway PostgreSQL URL.');
} else {
  console.log('✅ Database URL found');
}

if (!process.env.GROQ_API_KEY) {
  console.log('❌ No GROQ API key found!');
  console.log('💡 You need to add your GROQ_API_KEY to .env.local');
} else {
  console.log('✅ GROQ API key found');
} 