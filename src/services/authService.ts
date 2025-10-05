import { User, UserPermissions, MembershipPlan } from '../types/user';
import { databaseService } from './databaseService';
import { supabase } from './supabaseClient';

class AuthService {
  private currentUser: User | null = null;
  private userProfile: any = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.initializeAuth();
  }

  private async initializeAuth() {
    // Listen for auth state changes
    databaseService.onAuthStateChange(async (user) => {
      if (user) {
        await this.loadUserProfile(user.id);
      } else {
        this.currentUser = null;
        this.userProfile = null;
        this.notifyListeners();
      }
    });

    // Check current session
    const user = await databaseService.getCurrentUser();
    if (user) {
      await this.loadUserProfile(user.id);
    }
  }

  private async loadUserProfile(userId: string) {
    try {
      const profile = await databaseService.getUserProfile(userId);
      if (profile) {
        this.userProfile = profile;
        this.currentUser = {
          id: profile.id,
          username: profile.username,
          email: profile.email,
          membershipType: profile.membership_type as any,
          role: profile.role || 'user',
          trialStartDate: profile.trial_start_date ? new Date(profile.trial_start_date) : undefined,
          expiryDate: profile.expiry_date ? new Date(profile.expiry_date) : undefined,
          generationsUsed: profile.generations_used,
          dailyGenerationsUsed: profile.daily_generations_used,
          lastGenerationDate: profile.last_generation_date ? new Date(profile.last_generation_date) : undefined,
          createdAt: new Date(profile.created_at)
        };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load user profile:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  subscribe(listener: (user: User | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  async login(email: string, password: string): Promise<User> {
    const { user } = await databaseService.signIn(email, password);
    if (!user) throw new Error('Login failed');
    
    await this.loadUserProfile(user.id);
    return this.currentUser!;
  }

  async register(email: string, password: string, username: string): Promise<User> {
    const { user } = await databaseService.signUp(email, password, username);
    if (!user) throw new Error('Registration failed');
    
    // Profile will be created automatically by the database trigger
    await this.loadUserProfile(user.id);
    return this.currentUser!;
  }

  async logout() {
    await databaseService.signOut();
  }

  async startTrial(): Promise<boolean> {
    if (!this.currentUser || this.currentUser.membershipType !== 'visitor') {
      return false;
    }

    const success = await databaseService.startTrial(this.currentUser.id);
    if (success) {
      await this.loadUserProfile(this.currentUser.id);
    }
    return success;
  }

  async upgradeMembership(plan: 'monthly' | 'annual'): Promise<boolean> {
    if (!this.currentUser) return false;
    
    const success = await databaseService.upgradeMembership(this.currentUser.id, plan);
    if (success) {
      await this.loadUserProfile(this.currentUser.id);
    }
    return success;
  }

  getUserPermissions(): UserPermissions {
    if (!this.currentUser || !this.userProfile) {
      return {
        canCopy: false,
        canExport: false,
        canGenerate: true,
        dailyLimit: 1,
        remainingGenerations: 1,
        isAdmin: false
      };
    }

    const permissions = databaseService.getUserPermissions(this.userProfile);
    const isAdmin = this.currentUser.role === 'admin';

    // Admins have unlimited permissions
    if (isAdmin) {
      return {
        ...permissions,
        canCopy: true,
        canExport: true,
        canGenerate: true,
        dailyLimit: 999999,
        remainingGenerations: 999999,
        isAdmin: true
      };
    }

    return {
      ...permissions,
      isAdmin: false
    };
  }

  async incrementGenerationCount() {
    if (this.currentUser) {
      // Admins don't need to track generation count
      if (this.currentUser.role === 'admin') {
        return;
      }
      await databaseService.incrementGenerationCount(this.currentUser.id);
      await this.loadUserProfile(this.currentUser.id);
    }
  }

  isAdmin(): boolean {
    return this.currentUser?.role === 'admin';
  }

  async getMembershipPlans(): Promise<MembershipPlan[]> {
    const plans = await databaseService.getMembershipPlans();
    return plans.map(plan => ({
      id: plan.id,
      name: plan.name_en,
      nameZh: plan.name_zh,
      price: plan.price,
      originalPrice: plan.original_price,
      period: plan.period as 'monthly' | 'annual',
      features: plan.features_en,
      featuresZh: plan.features_zh,
      dailyLimit: plan.daily_limit,
      popular: plan.popular
    }));
  }
}

export const authService = new AuthService();