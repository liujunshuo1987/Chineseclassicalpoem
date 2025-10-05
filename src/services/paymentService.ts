import { supabase } from './supabaseClient';

export interface CreatePaymentRequest {
  userId: string;
  planId: string;
  paymentMethod: 'wechat' | 'alipay';
  amount: number;
}

export interface PaymentResponse {
  success: boolean;
  orderId?: string;
  paymentUrl?: string;
  qrCode?: string;
  error?: string;
}

export interface OrderStatus {
  success: boolean;
  status?: 'pending' | 'completed' | 'failed' | 'cancelled';
  order?: any;
  error?: string;
}

class PaymentService {
  private getEdgeFunctionUrl(): string {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    return `${supabaseUrl}/functions/v1/payment-handler`;
  }

  async createPayment(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return { success: false, error: 'User not authenticated' };
      }

      const response = await fetch(`${this.getEdgeFunctionUrl()}?action=create-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Payment creation failed' };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment service error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async verifyPayment(orderId: string): Promise<OrderStatus> {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        return { success: false, error: 'User not authenticated' };
      }

      const response = await fetch(`${this.getEdgeFunctionUrl()}?action=verify-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({ orderId }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, error: error.error || 'Payment verification failed' };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Payment verification error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  async getUserOrders(userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch orders:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Get orders error:', error);
      return [];
    }
  }
}

export const paymentService = new PaymentService();
