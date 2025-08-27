export interface Subscription {
  id: number;
  slNo: number;
  date: string;
  imei: string;
  device: string;
  vendor: string;
  vehicleNo: string;
  customer: string;
  phoneNo: string;
  tagPlace: string;
  panicButtons: number;
  recharge: number;
  installationDate: string;
  status: 'active' | 'inactive' | 'expired';
  renewalDate?: string;
  ownerName?: string;
}

export interface DashboardStats {
  totalSubscriptions: number;
  activeSubscriptions: number;
  expiredSubscriptions: number;
  monthlyGrowth: number;
  uniqueVendors: number;
  uniqueLocations: number;
  nextMonthExpiry: number;
}