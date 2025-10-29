import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastContainer } from '@/components/ui/toast'
import { SupabaseProvider } from '@/lib/providers/supabase-provider'

export const metadata: Metadata = {
  title: 'Subscription Management',
  description: 'Manage your subscriptions with ease',
}

// Mark as dynamic
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>
        <SupabaseProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <ToastContainer />
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}