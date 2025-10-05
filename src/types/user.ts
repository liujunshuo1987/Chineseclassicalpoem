export interface User {
  id: string;
  username: string;
  email: string;
  membershipType: 'visitor' | 'trial' | 'monthly' | 'annual' | 'expired';
  role?: 'user' | 'admin';
  trialStartDate?: Date;
  expiryDate?: Date;
  generationsUsed: number;
  dailyGenerationsUsed: number;
  lastGenerationDate?: Date;
  createdAt: Date;
}

export interface UserPermissions {
  canCopy: boolean;
  canExport: boolean;
  canGenerate: boolean;
  dailyLimit: number;
  remainingGenerations: number;
  trialDaysRemaining?: number;
  isAdmin: boolean;
}

export interface MembershipPlan {
  id: string;
  name: string;
  nameZh: string;
  price: number;
  originalPrice?: number;
  period: 'monthly' | 'annual';
  features: string[];
  featuresZh: string[];
  dailyLimit: number;
  popular?: boolean;
}