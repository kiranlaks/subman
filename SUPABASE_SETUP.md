# Supabase Integration Setup Guide

This guide will help you set up Supabase backend for your SubMan application.

## 🚀 Quick Setup

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com) and create a new account
2. Create a new project
3. Wait for the project to be fully provisioned

### 2. Get Your Project Credentials

1. Go to your project dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** (`NEXT_PUBLIC_SUPABASE_URL`)
   - **Anon Public Key** (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - **Service Role Key** (`SUPABASE_SERVICE_ROLE_KEY`) - Keep this secret!

### 3. Configure Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Application Configuration
NEXT_PUBLIC_APP_NAME=SubMan
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 4. Set Up Database Schema

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the contents of `lib/supabase/schema.sql`
4. Run the SQL script

This will create:
- All necessary tables (subscriptions, user_profiles, audit_logs, etc.)
- Row Level Security (RLS) policies
- Database functions and triggers
- Indexes for performance

### 5. Enable Row Level Security

The schema script automatically enables RLS, but verify:

1. Go to **Database** → **Tables**
2. For each table, ensure RLS is enabled
3. Check that policies are properly configured

### 6. Configure Authentication

1. Go to **Authentication** → **Settings**
2. Configure your authentication settings:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: Add your production domain when deploying
3. Set up email templates (optional)
4. Configure third-party providers if needed

### 7. Create Your First Admin User

1. Go to **Authentication** → **Users**
2. Click **Add User** or use the SQL editor:

```sql
-- Replace with your actual email and secure password
INSERT INTO auth.users (id, email, email_confirmed_at, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@yourcompany.com',
  NOW(),
  NOW(),
  NOW()
);

-- Get the user ID from the above insert and use it here
INSERT INTO user_profiles (id, username, first_name, last_name, role, department)
VALUES (
  'your-user-id-from-above',
  'admin',
  'System',
  'Administrator',
  'admin',
  'IT'
);
```

Or use the authentication interface to sign up and then update the role in the database.

## 📦 Migration from Local Storage

### Automatic Migration

The app includes automatic migration utilities. Your existing localStorage data will be preserved and can be migrated to Supabase:

1. **Backup First**: Export your current data using the existing export functionality
2. **Start the App**: The migration will happen automatically on first load with Supabase
3. **Verify Data**: Check that all your subscriptions appear correctly

### Manual Migration

If automatic migration fails, you can manually import your data:

1. Export your current data as Excel
2. Use the updated import functionality
3. The system will handle format conversion automatically

## 🔧 Development Workflow

### Running the Application

```bash
# Install dependencies (if not done already)
npm install

# Start development server
npm run dev
```

### Database Changes

1. Make changes to `lib/supabase/schema.sql`
2. Run the updated SQL in Supabase SQL Editor
3. Update TypeScript types in `types/supabase.ts` if needed

### Adding New Tables

1. Add table definition to schema.sql
2. Update `types/supabase.ts` with new types
3. Create service classes in `lib/supabase/`
4. Add to the main provider if needed

## 🛡️ Security Considerations

### Row Level Security (RLS)

The schema includes comprehensive RLS policies:

- **Subscriptions**: Users can view/edit all, admins can delete
- **User Profiles**: Users see their own, admins see all
- **Audit Logs**: Users see their own actions, admins see all
- **Settings**: User-specific settings are private

### API Security

- **Anon Key**: Safe to use in frontend, has limited permissions
- **Service Role Key**: Never expose in frontend, only for server-side operations
- **JWT**: Automatically handled by Supabase auth

### Data Validation

- Database constraints ensure data integrity
- TypeScript provides compile-time validation
- Supabase validates all operations against RLS policies

## 🚀 Production Deployment

### Environment Variables

Set these in your production environment:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_production_service_key
```

### Database Optimization

1. **Indexes**: Already included in schema for common queries
2. **Connection Pooling**: Enabled by default in Supabase
3. **Read Replicas**: Available in Pro plan

### Monitoring

1. **Supabase Dashboard**: Monitor database performance
2. **Audit Logs**: Track all user actions
3. **Error Tracking**: Consider adding Sentry or similar

## 🔄 Real-time Features

The integration includes real-time subscriptions:

```typescript
// Subscribe to subscription changes
const subscription = subscriptionService.subscribeToChanges((payload) => {
  console.log('Real-time update:', payload)
  // Handle real-time updates
})

// Don't forget to unsubscribe
subscription.unsubscribe()
```

## 📊 Analytics and Reporting

### Built-in Analytics

- User activity tracking
- Subscription metrics
- Audit trail analysis
- Export capabilities

### Custom Reports

Create custom reports using SQL:

```sql
-- Example: Monthly subscription growth
SELECT 
  DATE_TRUNC('month', created_at) as month,
  COUNT(*) as new_subscriptions
FROM subscriptions
GROUP BY month
ORDER BY month;
```

## 🆘 Troubleshooting

### Common Issues

1. **Connection Errors**
   - Verify environment variables
   - Check network connectivity
   - Ensure Supabase project is active

2. **Authentication Issues**
   - Check redirect URLs
   - Verify email confirmation settings
   - Review RLS policies

3. **Permission Errors**
   - Check user role assignments
   - Verify RLS policies
   - Ensure proper table access

### Getting Help

1. Check Supabase logs in dashboard
2. Review browser console for errors
3. Check audit logs for user actions
4. Refer to [Supabase documentation](https://supabase.com/docs)

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js with Supabase](https://supabase.com/docs/guides/getting-started/tutorials/with-nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Real-time Subscriptions](https://supabase.com/docs/guides/realtime)

---

**Need Help?** Create an issue in the repository or check the troubleshooting section above.

