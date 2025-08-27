# SubMan - Subscription Management Dashboard

A comprehensive subscription management system built with Next.js, TypeScript, and Tailwind CSS. Features advanced analytics, persistent user settings, and comprehensive data management capabilities.

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
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI primitives
- **Charts**: Recharts
- **State Management**: React hooks with localStorage persistence
- **Data Handling**: Excel import/export with XLSX
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/kiranlaks/subman.git
   cd subman
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
subman/
├── app/                    # Next.js app directory
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Main dashboard page
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── charts.tsx        # Chart components
│   ├── expiry-table.tsx  # Expiry management table
│   ├── settings-panel.tsx # Settings management
│   └── widget-manager.tsx # Widget configuration
├── hooks/                # Custom React hooks
│   ├── use-local-storage.ts    # localStorage persistence
│   └── use-persistent-state.ts # Advanced state management
├── lib/                  # Utility libraries
│   └── user-settings.ts  # Settings management system
├── types/                # TypeScript type definitions
└── data/                 # Sample data and schemas
```

## 🎯 Key Components

### Dashboard Overview
- **Modern Analytics**: Real-time statistics with trend indicators
- **Interactive Charts**: Vendor distribution, device analytics, location mapping
- **Quick Actions**: Export, import, and bulk operations

### Subscription Management
- **Excel-like Table**: Inline editing with persistent column settings
- **Advanced Filtering**: Multi-column filters with saved states
- **Bulk Operations**: Mass updates and renewals

### Expiry Management
- **Smart Calculations**: Automatic expiry date computation based on recharge periods
- **Status Tracking**: Visual indicators for expired, expiring, and active subscriptions
- **Renewal Workflows**: Streamlined renewal process with bulk capabilities

### Settings System
- **Persistent Preferences**: All UI changes automatically saved
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