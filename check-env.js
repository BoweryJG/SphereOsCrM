// Environment checker script for debugging
console.log('=== ENVIRONMENT VARIABLES CHECK ===');
console.log('Node Environment:', process.env.NODE_ENV);
console.log('');

console.log('=== SUPABASE CONFIG ===');
console.log('REACT_APP_SUPABASE_URL:', process.env.REACT_APP_SUPABASE_URL || '❌ NOT SET');
console.log('REACT_APP_SUPABASE_ANON_KEY:', process.env.REACT_APP_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET');
console.log('');

console.log('=== NETLIFY CONFIG ===');
console.log('NETLIFY_SITE_URL:', process.env.NETLIFY_SITE_URL || '❌ NOT SET');
console.log('');

console.log('=== TWILIO CONFIG ===');
console.log('REACT_APP_TWILIO_FUNCTION_URL:', process.env.REACT_APP_TWILIO_FUNCTION_URL || '❌ NOT SET');
console.log('REACT_APP_TWILIO_API_KEY:', process.env.REACT_APP_TWILIO_API_KEY ? '✅ SET' : '❌ NOT SET');
console.log('REACT_APP_TWILIO_PHONE_NUMBER:', process.env.REACT_APP_TWILIO_PHONE_NUMBER || '❌ NOT SET');
console.log('');

console.log('=== MARKET DATA CONFIG ===');
console.log('REACT_APP_MARKET_DATA_SUPABASE_URL:', process.env.REACT_APP_MARKET_DATA_SUPABASE_URL || '❌ NOT SET');
console.log('REACT_APP_MARKET_DATA_SUPABASE_ANON_KEY:', process.env.REACT_APP_MARKET_DATA_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET');
console.log('');

console.log('=== BUILD INFO ===');
console.log('Build Time:', new Date().toISOString());
console.log('Git Commit:', process.env.COMMIT_REF || 'Unknown');
console.log('Branch:', process.env.HEAD || 'Unknown');