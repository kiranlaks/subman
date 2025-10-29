# Supabase Integration Guide

## Current Status

**The application is currently running in LOCAL MODE** - all data is stored in browser localStorage and React state. No data is being saved to Supabase database yet.

## Why Data Isn't Saving to Supabase

The Supabase integration code exists but is **commented out** because:
1. Supabase credentials are not configured in `.env.local`
2. The Supabase database tables haven't been created yet
3. Authentication is temporarily disabled

## How to Enable Supabase Integration

### Step 1: Set Up Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for the project to finish setting up (takes ~2 minutes)
4. Go to Project Settings → API
5. Copy your project credentials:
   - Project URL
   - Anon/Public Key
   - Service Role Key (keep this secret!)

### Step 2: Configure Environment Variables

1. Open `.env.local` file in your project root
2. Add your Supabase credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 3: Create Database Tables

1. In your Supabase project, go to SQL Editor
2. Run the schema from `lib/supabase/schema.sql`
3. This will create all necessary tables:
   - `subscriptions` - Main subscription data
   - `user_profiles` - User information
   - `audit_logs` - Activity tracking
   - `user_sessions` - Session management
   - `user_settings` - User preferences
   - `application_settings` - App configuration

### Step 4: Enable Supabase in Code

Once your environment variables are configured, you need to uncomment the Supabase integration code:

#### In `app/page.tsx` - Excel Import Handler

Find the `handleExcelImport` function and uncomment these sections:

```typescript
// For REPLACE mode:
const { subscriptionService } = await import('@/lib/supabase/subscriptions');
await subscriptionService.bulkCreate(finalSubscriptions);

// For MERGE mode:
const { subscriptionService } = await import('@/lib/supabase/subscriptions');
if (toCreate.length > 0) {
  await subscriptionService.bulkCreate(toCreate);
}
if (toUpdate.length > 0) {
  await subscriptionService.bulkUpdate(toUpdate);
}
```

#### In Other Components

Similar TODO comments exist in:
- `components/subscription-table.tsx` - Edit/Delete operations
- `components/renewed-table.tsx` - Renewal operations
- `components/expiry-table.tsx` - Expiry tracking
- `components/expired-table.tsx` - Expired subscriptions

### Step 5: Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Upload an Excel file with subscription data

3. Check your Supabase dashboard → Table Editor → subscriptions table
   - You should see your imported data

4. Check the browser console for any errors

## Data Flow After Integration

### Excel Import Flow (with Supabase enabled)

```
User uploads Excel
    ↓
Excel parsed by XLSX library
    ↓
Data validated in ImportValidationDialog
    ↓
User confirms import
    ↓
handleExcelImport called
    ↓
Data saved to Supabase (bulkCreate/bulkUpdate)
    ↓
Local state updated (setSubscriptions)
    ↓
UI refreshes with new data
```

### Real-time Sync

Once Supabase is enabled, the app will:
- ✅ Save all changes to database immediately
- ✅ Support multi-user access
- ✅ Provide data persistence across devices
- ✅ Enable real-time updates (optional)
- ✅ Track all changes in audit logs

## Troubleshooting

### "Failed to fetch subscriptions" Error

**Cause**: Supabase credentials not configured or incorrect

**Solution**:
1. Double-check your `.env.local` file
2. Ensure you copied the correct keys from Supabase dashboard
3. Restart your dev server after changing `.env.local`

### "Table 'subscriptions' does not exist" Error

**Cause**: Database schema not created

**Solution**:
1. Go to Supabase SQL Editor
2. Run the complete schema from `lib/supabase/schema.sql`
3. Verify tables were created in Table Editor

### Data Not Appearing in Supabase

**Cause**: Integration code still commented out

**Solution**:
1. Search for `TODO: When Supabase is configured` in your code
2. Uncomment the Supabase service calls
3. Rebuild and restart your app

### Authentication Errors

**Cause**: Row Level Security (RLS) policies blocking access

**Solution** (for development):
1. Go to Supabase → Authentication → Policies
2. Temporarily disable RLS on subscriptions table
3. Or create a policy that allows all operations:
   ```sql
   CREATE POLICY "Allow all operations" ON subscriptions
   FOR ALL USING (true) WITH CHECK (true);
   ```

**Note**: For production, implement proper authentication and RLS policies!

## Migration from Local to Supabase

If you already have data in localStorage and want to migrate to Supabase:

1. Export your current data:
   - Use the "Export to Excel" button in the app
   - This saves your current data

2. Enable Supabase integration (follow steps above)

3. Re-import your data:
   - Use "Import from Excel" with your exported file
   - Choose "Replace all data"
   - Data will now be saved to Supabase

## Benefits of Supabase Integration

### Current (Local Mode)
- ❌ Data only in browser
- ❌ Lost if browser cache cleared
- ❌ No multi-user support
- ❌ No backup
- ❌ Limited to single device

### With Supabase
- ✅ Data in cloud database
- ✅ Persistent and backed up
- ✅ Multi-user support
- ✅ Automatic backups
- ✅ Access from any device
- ✅ Real-time sync (optional)
- ✅ Advanced querying
- ✅ Audit trail

## Next Steps

1. **Set up Supabase project** (5 minutes)
2. **Configure environment variables** (2 minutes)
3. **Run database schema** (1 minute)
4. **Uncomment integration code** (5 minutes)
5. **Test with sample data** (5 minutes)

Total time: ~20 minutes to full Supabase integration!

## Support

If you encounter issues:
1. Check the browser console for detailed error messages
2. Verify your Supabase credentials
3. Ensure database tables are created
4. Check Supabase logs in your dashboard

## Security Notes

⚠️ **Important**:
- Never commit `.env.local` to git (it's in `.gitignore`)
- Keep your Service Role Key secret
- Enable Row Level Security (RLS) for production
- Implement proper authentication before deploying
- Use environment variables for all sensitive data

---

**Current Mode**: 🟡 Local Storage Only
**Target Mode**: 🟢 Supabase Cloud Database

Follow this guide to switch from Local to Cloud mode!
