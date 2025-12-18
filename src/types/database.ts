export interface Profile {
  id: string;
  username: string;
  nickname: string | null;
  avatar_url: string | null;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}

export interface UserCredits {
  id: number;
  user_id: string;
  balance: number;
  total_earned: number;
  total_spent: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: number;
  user_id: string;
  amount: number;
  type: 'purchase' | 'ocr' | 'analysis' | 'poetry' | 'annotation' | 'refund' | 'bonus';
  description: string;
  related_entity_id: number | null;
  related_entity_type: 'archive' | 'poetry' | 'order' | null;
  balance_after: number;
  created_at: string;
}

export interface CreditPackage {
  id: number;
  name: string;
  credits: number;
  price_cents: number;
  currency: string;
  bonus_credits: number;
  is_active: boolean;
  sort_order: number;
  stripe_price_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Archive {
  id: number;
  user_id: string;
  title: string;
  image_url: string;
  thumbnail_url: string | null;
  original_text: string | null;
  analyzed_data: any | null;
  punctuated_text: string | null;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error_message: string | null;
  credits_cost: number;
  processing_time_ms: number | null;
  created_at: string;
  updated_at: string;
}

export interface PoetryGeneration {
  id: number;
  user_id: string;
  title: string;
  keywords: string;
  style: string;
  style_name: string;
  content: string;
  explanation: string | null;
  style_analysis: string | null;
  credits_cost: number;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentOrder {
  id: number;
  user_id: string;
  order_number: string;
  package_id: number;
  credits: number;
  bonus_credits: number;
  amount_cents: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  stripe_payment_intent_id: string | null;
  stripe_checkout_session_id: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminAction {
  id: number;
  admin_user_id: string;
  action_type: 'credit_adjustment' | 'user_ban' | 'user_unban' | 'package_update' | 'order_update';
  target_user_id: string | null;
  details: any;
  created_at: string;
}
