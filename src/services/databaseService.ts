import { supabase, UserProfile, Order, UserGeneration, MembershipPlan } from './supabaseClient';
import { User, UserPermissions } from '../types/user';

class DatabaseService {
  // User Profile Management
  async createUserProfile(userId: string, username: string, email: string): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: userId,
        username,
        email,
        membership_type: 'visitor'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data, error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Membership Management
  async startTrial(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('user_profiles')
      .update({
        membership_type: 'trial',
        trial_start_date: new Date().toISOString()
      })
      .eq('id', userId);

    return !error;
  }

  async upgradeMembership(userId: string, planType: 'monthly' | 'annual'): Promise<boolean> {
    const now = new Date();
    const expiryDate = new Date(now);
    
    if (planType === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    const { error } = await supabase
      .from('user_profiles')
      .update({
        membership_type: planType,
        expiry_date: expiryDate.toISOString()
      })
      .eq('id', userId);

    return !error;
  }

  // Generation Tracking
  async incrementGenerationCount(userId: string): Promise<void> {
    const profile = await this.getUserProfile(userId);
    if (!profile) return;

    const now = new Date();
    const lastGenDate = profile.last_generation_date ? new Date(profile.last_generation_date) : null;
    const isNewDay = !lastGenDate || now.toDateString() !== lastGenDate.toDateString();

    const updates: Partial<UserProfile> = {
      generations_used: profile.generations_used + 1,
      daily_generations_used: isNewDay ? 1 : profile.daily_generations_used + 1,
      last_generation_date: now.toISOString()
    };

    await this.updateUserProfile(userId, updates);
  }

  async saveGeneration(userId: string, contentType: string, content: string, keywords?: string, style?: string): Promise<void> {
    const { error } = await supabase
      .from('user_generations')
      .insert({
        user_id: userId,
        content_type: contentType,
        content,
        keywords,
        style
      });

    if (error) throw error;
  }

  // Order Management
  async createOrder(userId: string, planType: string, amount: number, paymentMethod: string): Promise<Order> {
    const orderNumber = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { data, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        order_number: orderNumber,
        plan_type: planType,
        amount,
        payment_method: paymentMethod,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateOrderStatus(orderId: string, status: 'paid' | 'failed' | 'refunded', paidAt?: string): Promise<void> {
    const updates: any = { status };
    if (paidAt) updates.paid_at = paidAt;

    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) throw error;
  }

  // Membership Plans
  async getMembershipPlans(): Promise<MembershipPlan[]> {
    const { data, error } = await supabase
      .from('membership_plans')
      .select('*')
      .eq('active', true)
      .order('price');

    if (error) throw error;
    return data || [];
  }

  // User Permissions
  getUserPermissions(profile: UserProfile): UserPermissions {
    const now = new Date();
    let permissions: UserPermissions = {
      canCopy: false,
      canExport: false,
      canGenerate: false,
      dailyLimit: 0,
      remainingGenerations: 0
    };

    // Check trial expiration
    if (profile.membership_type === 'trial' && profile.trial_start_date) {
      const trialDays = Math.floor((now.getTime() - new Date(profile.trial_start_date).getTime()) / (1000 * 60 * 60 * 24));
      const remainingDays = Math.max(0, 7 - trialDays);
      
      if (remainingDays > 0) {
        permissions = {
          canCopy: true,
          canExport: true,
          canGenerate: true,
          dailyLimit: 999,
          remainingGenerations: 999,
          trialDaysRemaining: remainingDays
        };
      } else {
        // Trial expired
        profile.membership_type = 'expired';
      }
    }

    // Check subscription expiration
    if ((profile.membership_type === 'monthly' || profile.membership_type === 'annual') 
        && profile.expiry_date && now > new Date(profile.expiry_date)) {
      profile.membership_type = 'expired';
    }

    // Reset daily generations if it's a new day
    const lastGenDate = profile.last_generation_date ? new Date(profile.last_generation_date) : null;
    const isNewDay = !lastGenDate || now.toDateString() !== lastGenDate.toDateString();
    const dailyUsed = isNewDay ? 0 : profile.daily_generations_used;

    switch (profile.membership_type) {
      case 'visitor':
        permissions = {
          canCopy: false,
          canExport: false,
          canGenerate: true,
          dailyLimit: 1,
          remainingGenerations: Math.max(0, 1 - dailyUsed)
        };
        break;
      
      case 'monthly':
        permissions = {
          canCopy: true,
          canExport: true,
          canGenerate: true,
          dailyLimit: 30,
          remainingGenerations: Math.max(0, 30 - dailyUsed)
        };
        break;
      
      case 'annual':
        permissions = {
          canCopy: true,
          canExport: true,
          canGenerate: true,
          dailyLimit: 999,
          remainingGenerations: 999
        };
        break;
      
      case 'expired':
        permissions = {
          canCopy: false,
          canExport: false,
          canGenerate: false,
          dailyLimit: 0,
          remainingGenerations: 0
        };
        break;
    }

    return permissions;
  }

  // Authentication helpers
  async signUp(email: string, password: string, username: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });

    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }

  onAuthStateChange(callback: (user: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user || null);
    });
  }
}

export const databaseService = new DatabaseService();