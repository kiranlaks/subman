-- Supabase Schema for SubMan Application
-- Note: Supabase handles JWT secrets automatically, no need to set them manually

-- Create custom types
CREATE TYPE subscription_status AS ENUM ('active', 'inactive', 'expired');
CREATE TYPE user_role_type AS ENUM ('admin', 'manager', 'operator', 'viewer');
CREATE TYPE audit_action_type AS ENUM (
  'subscription.edit', 'subscription.renew', 'subscription.bulk_renew',
  'subscription.create', 'subscription.delete', 'subscription.import',
  'subscription.export', 'user.login', 'user.logout', 'user.switch',
  'user.profile_update', 'settings.update', 'data.export', 'data.import',
  'system.action', 'system.undo', 'system.redo'
);

-- Subscriptions table
CREATE TABLE subscriptions (
  id BIGSERIAL PRIMARY KEY,
  sl_no INTEGER NOT NULL,
  date TEXT NOT NULL,
  imei TEXT NOT NULL UNIQUE,
  device TEXT NOT NULL DEFAULT 'TRANSIGHT',
  vendor TEXT NOT NULL,
  vehicle_no TEXT NOT NULL,
  customer TEXT NOT NULL,
  phone_no TEXT NOT NULL,
  tag_place TEXT NOT NULL,
  panic_buttons INTEGER NOT NULL DEFAULT 1,
  recharge INTEGER NOT NULL DEFAULT 1,
  installation_date TEXT NOT NULL,
  renewal_date TEXT,
  owner_name TEXT,
  status subscription_status NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  role user_role_type NOT NULL DEFAULT 'viewer',
  department TEXT,
  phone_number TEXT,
  avatar_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  two_factor_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User sessions table
CREATE TABLE user_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_info TEXT,
  ip_address INET,
  location TEXT,
  user_agent TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs table
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  username TEXT,
  user_role TEXT,
  action audit_action_type NOT NULL,
  resource TEXT NOT NULL,
  resource_id TEXT NOT NULL,
  details JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT TRUE,
  error_message TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  settings_key TEXT NOT NULL,
  settings_value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, settings_key)
);

-- Application settings table
CREATE TABLE application_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create indexes for better performance
CREATE INDEX idx_subscriptions_imei ON subscriptions(imei);
CREATE INDEX idx_subscriptions_customer ON subscriptions(customer);
CREATE INDEX idx_subscriptions_vendor ON subscriptions(vendor);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_installation_date ON subscriptions(installation_date);
CREATE INDEX idx_subscriptions_created_at ON subscriptions(created_at);
CREATE INDEX idx_user_profiles_username ON user_profiles(username);
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX idx_application_settings_key ON application_settings(setting_key);

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_application_settings_updated_at BEFORE UPDATE ON application_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies - TEMPORARILY DISABLED
-- ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE application_settings ENABLE ROW LEVEL SECURITY;

-- Subscriptions policies - TEMPORARILY DISABLED
-- CREATE POLICY "Users can view subscriptions" ON subscriptions FOR SELECT USING (auth.role() = 'authenticated');
-- CREATE POLICY "Users can insert subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.role() = 'authenticated');
-- CREATE POLICY "Users can update subscriptions" ON subscriptions FOR UPDATE USING (auth.role() = 'authenticated');
-- CREATE POLICY "Admin can delete subscriptions" ON subscriptions FOR DELETE USING (
--   EXISTS (
--     SELECT 1 FROM user_profiles 
--     WHERE id = auth.uid() 
--     AND role IN ('admin', 'manager')
--   )
-- );

-- User profiles policies - TEMPORARILY DISABLED
-- CREATE POLICY "Users can view their own profile" ON user_profiles FOR SELECT USING (auth.uid() = id);
-- CREATE POLICY "Admin can view all profiles" ON user_profiles FOR SELECT USING (
--   EXISTS (
--     SELECT 1 FROM user_profiles 
--     WHERE id = auth.uid() 
--     AND role = 'admin'
--   )
-- );
-- CREATE POLICY "Users can update their own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
-- CREATE POLICY "Admin can insert profiles" ON user_profiles FOR INSERT WITH CHECK (
--   EXISTS (
--     SELECT 1 FROM user_profiles 
--     WHERE id = auth.uid() 
--     AND role = 'admin'
--   )
-- );

-- Audit logs policies - TEMPORARILY DISABLED
-- CREATE POLICY "Users can view their own audit logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Admin can view all audit logs" ON audit_logs FOR SELECT USING (
--   EXISTS (
--     SELECT 1 FROM user_profiles 
--     WHERE id = auth.uid() 
--     AND role = 'admin'
--   )
-- );
-- CREATE POLICY "All authenticated users can insert audit logs" ON audit_logs FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- User settings policies - TEMPORARILY DISABLED
-- CREATE POLICY "Users can manage their own settings" ON user_settings FOR ALL USING (auth.uid() = user_id);

-- Application settings policies - TEMPORARILY DISABLED
-- CREATE POLICY "Users can view public settings" ON application_settings FOR SELECT USING (is_public = true OR auth.role() = 'authenticated');
-- CREATE POLICY "Admin can manage all settings" ON application_settings FOR ALL USING (
--   EXISTS (
--     SELECT 1 FROM user_profiles 
--     WHERE id = auth.uid() 
--     AND role = 'admin'
--   )
-- );

-- Create a function to handle user profile creation on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, username, first_name, last_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'last_name', 'Name'),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role_type, 'viewer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Insert default application settings
INSERT INTO application_settings (setting_key, setting_value, description, is_public) VALUES
('app_name', '"SubMan"', 'Application name', true),
('app_version', '"1.0.0"', 'Application version', true),
('theme_default', '"light"', 'Default theme', true),
('features_analytics', 'true', 'Analytics feature enabled', false),
('features_exports', 'true', 'Export feature enabled', false),
('features_imports', 'true', 'Import feature enabled', false);

-- Create sample admin user (you'll need to replace with actual values after creating user in Supabase Auth)
-- INSERT INTO user_profiles (id, username, first_name, last_name, role, department, is_active)
-- VALUES ('your-admin-user-uuid', 'admin', 'System', 'Administrator', 'admin', 'IT', true);

