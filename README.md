# SubMan - Subscription Management Dashboard

A comprehensive subscription management system built with Next.js, TypeScript, Tailwind CSS, and Supabase. Features advanced analytics, real-time collaboration, persistent user settings, and enterprise-grade data management capabilities.

## 🆕 **Latest Update: Supabase Integration**

SubMan now includes full Supabase backend integration with:
- 🔐 **Authentication & User Management**
- 🗄️ **PostgreSQL Database**
- ⚡ **Real-time Updates**
- 📊 **Comprehensive Audit Logging**
- 🔒 **Row Level Security**
- 🌐 **Multi-user Collaboration**

## 🚀 Features

### Core Functionality
- **Subscription Management**: Complete CRUD operations for subscription data
- **Advanced Analytics**: Interactive charts and comprehensive statistics
- **Expiry Management**: Track and manage subscription expiry dates with automated calculations
- **Renewal System**: Bulk and individual subscription renewal capabilities
- **Data Import/Export**: Excel file import/export with customizable templates

### User Experience
- **Persistent Settings**: All UI preferences automatically saved and restored
- **Responsive Design**: Fully responsive across all device sizes
- **Dark/Light Theme**: System-aware theme switching
- **Real-time Updates**: Live data synchronization across components

### Advanced Features
- **Widget Management**: Customizable dashboard widgets with drag-and-drop reordering
- **Filter System**: Advanced filtering with persistent state
- **Search Functionality**: Global search across all data fields
- **Export Templates**: Multiple export formats with date range filtering
- **Settings Management**: Comprehensive settings panel with import/export capabilities

## 🛠 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **State Management**: React Context + Supabase real-time
- **Data Handling**: Excel import/export with XLSX
- **Icons**: Lucide React
- **Authentication**: Supabase Auth with RLS
- **Database**: PostgreSQL with real-time subscriptions

## 📦 Installation

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/subman.git
   cd subman
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase Backend**
   
   Follow the detailed setup guide: **[📋 SUPABASE_SETUP.md](SUPABASE_SETUP.md)**
   
   Quick steps:
   - Create a Supabase project
   - Run the database schema
   - Configure environment variables
   
   ```bash
   # Create environment file
   cp .env.example .env.local
   # Add your Supabase credentials
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### 🔧 Environment Setup

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 🏗 Project Structure

```
subman/
├── app/                    # Next.js app directory
│   ├── login/             # Authentication pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── settings/         # Settings management components
│   ├── charts.tsx        # Chart components
│   ├── expiry-table.tsx  # Expiry management table
│   └── widget-manager.tsx # Widget configuration
├── lib/                  # Utility libraries
│   ├── supabase/         # Supabase integration
│   │   ├── client.ts     # Browser client
│   │   ├── server.ts     # Server client
│   │   ├── auth.ts       # Authentication service
│   │   ├── subscriptions.ts # Subscription service
│   │   ├── audit.ts      # Audit logging service
│   │   └── schema.sql    # Database schema
│   ├── providers/        # React context providers
│   └── utils.ts          # Utility functions
├── types/                # TypeScript type definitions
│   ├── supabase.ts       # Supabase types
│   ├── subscription.ts   # Legacy types
│   └── user.ts           # User types
├── hooks/                # Custom React hooks
├── data/                 # Sample data
├── middleware.ts         # Next.js middleware for auth
├── SUPABASE_SETUP.md     # Supabase setup guide
└── MIGRATION_GUIDE.md    # Migration documentation
```

## 🎯 Key Components

### Dashboard Overview
- **Modern Analytics**: Real-time statistics with trend indicators
- **Interactive Charts**: Vendor distribution, device analytics, location mapping
- **Quick Actions**: Export, import, and bulk operations
- **Real-time Updates**: Live data synchronization across all users

### Subscription Management
- **Excel-like Table**: Inline editing with persistent column settings
- **Advanced Filtering**: Multi-column filters with saved states
- **Bulk Operations**: Mass updates and renewals
- **Real-time Collaboration**: See changes from other users instantly

### Expiry Management
- **Smart Calculations**: Automatic expiry date computation based on recharge periods
- **Status Tracking**: Visual indicators for expired, expiring, and active subscriptions
- **Renewal Workflows**: Streamlined renewal process with bulk capabilities
- **Automated Notifications**: Real-time alerts for upcoming expirations

### Authentication & Security
- **Role-based Access**: Admin, Manager, Operator, and Viewer roles
- **Row Level Security**: Database-level security policies
- **Audit Logging**: Complete activity tracking for compliance
- **Session Management**: Secure authentication with Supabase Auth

### Settings System
- **Persistent Preferences**: All UI changes automatically saved to database
- **User Management**: Admin interface for user creation and role assignment
- **Export/Import**: Backup and restore settings configurations
- **Component-Specific Resets**: Granular control over different setting categories

## 💾 Persistent Settings

The application automatically remembers:

- **Table Preferences**: Column widths, visibility, sorting, page size
- **Filter States**: Active filters, search terms, date ranges
- **Widget Configuration**: Enabled widgets, order, custom sizes
- **Chart Settings**: Sort orders, color preferences
- **Layout Preferences**: Sidebar state, theme selection

### Settings Management
```typescript
// Example: Using persistent table settings
const { 
  visibleColumns, 
  setVisibleColumns,
  pageSize,
  setPageSize
} = useTableColumnSettings('my-table');

// Settings are automatically saved to localStorage
setVisibleColumns(['column1', 'column2']);
setPageSize(50);
```

## 📊 Data Management

### Import Functionality
- **Excel Import**: Support for .xlsx files with template validation
- **Data Validation**: Automatic validation and error reporting
- **Duplicate Handling**: Smart duplicate detection and merging

### Export Options
- **Multiple Formats**: Excel export with customizable templates
- **Date Range Filtering**: Export specific time periods
- **Template Varieties**: Different export templates for various use cases

## 🎨 Customization

### Theme Configuration
The application supports light/dark themes with system preference detection.

### Widget System
- **Modular Widgets**: Add/remove dashboard widgets
- **Custom Ordering**: Drag-and-drop widget arrangement
- **Size Configuration**: Adjustable widget dimensions

### Color Schemes
- **Chart Colors**: Customizable color palettes for charts
- **Status Indicators**: Configurable status color coding

## 🔧 Configuration

### Environment Variables
Create a `.env.local` file for environment-specific settings:

```env
# Add any environment variables here
NEXT_PUBLIC_APP_NAME=SubMan
```

### Settings Storage
Settings are stored in localStorage with the key `subscription-dashboard-settings`.

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first approach**: Optimized for mobile devices
- **Adaptive layouts**: Components adjust to screen size
- **Touch-friendly**: Mobile-optimized interactions

## 🚀 Deployment

### Vercel (Recommended)
```bash
npm run build
npx vercel --prod
```

### Other Platforms
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Radix UI** for accessible component primitives
- **Tailwind CSS** for utility-first styling
- **Recharts** for beautiful chart components
- **Lucide** for consistent iconography

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the settings system guide in `SETTINGS_SYSTEM.md`

---

**Built with ❤️ for efficient subscription management**