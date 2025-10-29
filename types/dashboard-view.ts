export const DASHBOARD_VIEWS = [
  'overview',
  'analytics',
  'subscriptions',
  'expiry',
  'renewed',
  'expired',
  'import',
  'settings',
] as const

export type DashboardView = (typeof DASHBOARD_VIEWS)[number]

export const DEFAULT_DASHBOARD_VIEW: DashboardView = 'overview'

const DASHBOARD_VIEW_SET = new Set<string>(DASHBOARD_VIEWS)

export const isDashboardView = (value: string | null): value is DashboardView =>
  typeof value === 'string' && DASHBOARD_VIEW_SET.has(value)
