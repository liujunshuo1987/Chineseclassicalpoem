import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface UserProfile {
  id: number;
  auth_user_id: string;
  username: string;
  membership_type: 'visitor' | 'trial' | 'monthly' | 'annual' | 'expired';
  role?: 'user' | 'admin';
  trial_start?: string;
  expiry_date?: string;
  generations_used?: number;
  daily_generations_used?: number;
  last_generation_date?: string;
  created_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  order_number: string;
  plan_type: string;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  payment_method?: string;
  paid_at?: string;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface UserGeneration {
  id: string;
  user_id: string;
  content_type: string;
  content: string;
  keywords?: string;
  style?: string;
  created_at: string;
}

export interface MembershipPlan {
  id: string;
  name_en: string;
  name_zh: string;
  price: number;
  original_price?: number;
  period: string;
  daily_limit: number;
  features_en: string[];
  features_zh: string[];
  popular: boolean;
  active: boolean;
  created_at: string;
}