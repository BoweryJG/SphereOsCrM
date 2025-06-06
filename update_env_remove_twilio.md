# Remove Twilio Credentials from .env.local

After claiming your 845 number in the database, remove these lines from your .env.local file to prevent other users from accessing your Twilio credentials:

## Lines to REMOVE from .env.local:

```
REACT_APP_TWILIO_FUNCTION_URL=...
REACT_APP_TWILIO_API_KEY=...
REACT_APP_TWILIO_PHONE_NUMBER=...
TWILIO_ACCOUNT_SID=...
TWILIO_API_KEY=...
TWILIO_API_SECRET=...
TWILIO_TWIML_APP_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=...
```

## Keep these Supabase variables:

```
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
```

This ensures that:
1. Your Twilio credentials are only in the database
2. Only you can access your 845 number
3. Other users must set up their own Twilio accounts