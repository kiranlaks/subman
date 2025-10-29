# 🚀 SubMan Supabase Backend - Complete Setup Guide

This guide provides a completely hands-free setup process for connecting SubMan to Supabase.

## 📋 Prerequisites

1. A Supabase account (free tier works fine)
2. Node.js installed on your system
3. SubMan project cloned/downloaded

## 🎯 Quick Start (Automated Setup)

### Step 1: Run the Setup Script

```bash
npm run setup:supabase
```

This script will:
- Create your `.env.local` file
- Guide you through entering your Supabase credentials
- Provide next steps for database setup

### Step 2: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project (if you haven't already)
3. Once created, go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **Anon/Public Key** (safe for client-side)
   - **Service Role Key** (keep this secret!)

### Step 3: Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Copy ALL contents from `lib/supabase/schema.sql`
4. Paste into the SQL Editor
5. Click **Run** (or press Ctrl/Cmd + Enter)

This creates:
- ✅ All required tables
- ✅ User authentication structure
- ✅ Row Level Security policies
- ✅ Indexes for performance
- ✅ Triggers for timestamps

### Step 4: Create Admin User

Option A - Via Supabase Dashboard:
1. Go to **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter email and password
4. After creation, go to **SQL Editor** and run:

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE id = 'YOUR_USER_ID_HERE';
```

Option B - Via SQL (Replace values):
```sql
-- Create auth user (Supabase will handle the auth part)
-- Then update the profile after user signs up
```

### Step 5: Start the Application

```bash
npm run dev
```

Navigate to `http://localhost:3000` and you should see the login page!

## 🔄 Automatic Data Migration

When you first log in, if you have existing localStorage data, you'll see a migration prompt:

1. The app detects local data automatically
2. Click "Migrate" to transfer to Supabase
3. A backup is created before migration
4. Choose whether to clear local data after

## 🛠️ Backend Features

### API Endpoints Created

All API routes are automatically secured with Supabase authentication:

#### Subscriptions
- `GET /api/subscriptions` - List all subscriptions
- `POST /api/subscriptions` - Create new subscription
- `GET /api/subscriptions/[id]` - Get single subscription
- `PUT /api/subscriptions/[id]` - Update subscription
- `DELETE /api/subscriptions/[id]` - Delete subscription
- `PUT /api/subscriptions/bulk` - Bulk update
- `GET /api/subscriptions/stats` - Get statistics

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/register` - Create new user (admin only)
- `GET /api/auth/user` - Get current user

#### Users
- `GET /api/users` - List all users (admin only)
- `GET /api/users/[id]` - Get user details
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Deactivate user

#### Settings
- `GET /api/settings` - Get settings
- `POST /api/settings` - Update settings

#### Audit Logs
- `GET /api/audit-logs` - Get audit trail

### Security Features

1. **Row Level Security (RLS)**: Database-level security
2. **JWT Authentication**: Secure token-based auth
3. **Role-Based Access**: Admin, Manager, Operator, Viewer roles
4. **Audit Logging**: Every action is logged
5. **Session Management**: Track active sessions

### Real-time Features

The backend supports real-time updates:
- Live subscription changes
- User activity monitoring
- Instant notifications

## 🔍 Troubleshooting

### Common Issues

1. **"Unauthorized" errors**
   - Check your Supabase keys in `.env.local`
   - Ensure you're logged in

2. **Database errors**
   - Verify the schema.sql was run completely
   - Check RLS policies are enabled

3. **Migration fails**
   - Ensure you're authenticated first
   - Check browser console for errors

### Verify Setup

Run these checks in Supabase SQL Editor:

```sql
-- Check tables exist
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check user profiles
SELECT * FROM user_profiles;
```

## 📊 Database Schema

### Core Tables

1. **subscriptions**: Main subscription data
2. **user_profiles**: Extended user information
3. **user_sessions**: Active session tracking
4. **audit_logs**: Complete audit trail
5. **user_settings**: User preferences
6. **application_settings**: Global settings

### Data Types

- `subscription_status`: active, inactive, expired
- `user_role_type`: admin, manager, operator, viewer
- `audit_action_type`: Various action types

## 🚀 Production Deployment

### Environment Variables

Set these in your hosting platform:

```env
NEXT_PUBLIC_SUPABASE_URL=your-production-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-production-service-key
```

### Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Admin user created
- [ ] Authentication URLs updated
- [ ] RLS policies verified
- [ ] Backup strategy in place

## 🆘 Need Help?

1. Check the [Supabase Docs](https://supabase.com/docs)
2. Review error logs in Supabase dashboard
3. Check browser console for client errors
4. Verify all environment variables

## 🎉 Success Indicators

You'll know everything is working when:
- ✅ Login page appears at `/login`
- ✅ Can create an account and log in
- ✅ Subscriptions load from Supabase
- ✅ Can create/edit/delete subscriptions
- ✅ Audit logs show activities
- ✅ Real-time updates work

---

**Congratulations!** Your SubMan app is now powered by Supabase! 🎊

