import { User, UserPermissions, MembershipPlan } from '../types/user';

class AuthService {
  private currentUser: User | null = null;
  private listeners: ((user: User | null) => void)[] = [];

  constructor() {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        // Convert date strings back to Date objects
        if (user.trialStartDate) user.trialStartDate = new Date(user.trialStartDate);
        if (user.expiryDate) user.expiryDate = new Date(user.expiryDate);
        if (user.lastGenerationDate) user.lastGenerationDate = new Date(user.lastGenerationDate);
        user.createdAt = new Date(user.createdAt);
        this.currentUser = user;
        this.updateUserStatus();
      } catch (error) {
        console.error('Failed to load user from storage:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }

  private saveUserToStorage() {
    if (this.currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.currentUser));
  }

  private updateUserStatus() {
    if (!this.currentUser) return;

    const now = new Date();
    
    // Check trial expiration
    if (this.currentUser.membershipType === 'trial' && this.currentUser.trialStartDate) {
      const trialDays = Math.floor((now.getTime() - this.currentUser.trialStartDate.getTime()) / (1000 * 60 * 60 * 24));
      if (trialDays > 7) {
        this.currentUser.membershipType = 'expired';
      }
    }

    // Check subscription expiration
    if ((this.currentUser.membershipType === 'monthly' || this.currentUser.membershipType === 'annual') 
        && this.currentUser.expiryDate && now > this.currentUser.expiryDate) {
      this.currentUser.membershipType = 'expired';
    }

    // Reset daily generations if it's a new day
    if (this.currentUser.lastGenerationDate) {
      const lastGenDate = new Date(this.currentUser.lastGenerationDate);
      const isNewDay = now.toDateString() !== lastGenDate.toDateString();
      if (isNewDay) {
        this.currentUser.dailyGenerationsUsed = 0;
      }
    }

    this.saveUserToStorage();
  }

  subscribe(listener: (user: User | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getCurrentUser(): User | null {
    this.updateUserStatus();
    return this.currentUser;
  }

  async login(email: string, password: string): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, create a user
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      username: email.split('@')[0],
      email,
      membershipType: 'visitor',
      generationsUsed: 0,
      dailyGenerationsUsed: 0,
      createdAt: new Date()
    };

    this.currentUser = user;
    this.saveUserToStorage();
    this.notifyListeners();
    return user;
  }

  async register(email: string, password: string, username: string): Promise<User> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user: User = {
      id: Math.random().toString(36).substr(2, 9),
      username,
      email,
      membershipType: 'visitor',
      generationsUsed: 0,
      dailyGenerationsUsed: 0,
      createdAt: new Date()
    };

    this.currentUser = user;
    this.saveUserToStorage();
    this.notifyListeners();
    return user;
  }

  logout() {
    this.currentUser = null;
    this.saveUserToStorage();
    this.notifyListeners();
  }

  startTrial(): boolean {
    if (!this.currentUser || this.currentUser.membershipType !== 'visitor') {
      return false;
    }

    this.currentUser.membershipType = 'trial';
    this.currentUser.trialStartDate = new Date();
    this.saveUserToStorage();
    this.notifyListeners();
    return true;
  }

  upgradeMembership(plan: 'monthly' | 'annual'): boolean {
    if (!this.currentUser) return false;

    const now = new Date();
    const expiryDate = new Date(now);
    
    if (plan === 'monthly') {
      expiryDate.setMonth(expiryDate.getMonth() + 1);
    } else {
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    }

    this.currentUser.membershipType = plan;
    this.currentUser.expiryDate = expiryDate;
    this.saveUserToStorage();
    this.notifyListeners();
    return true;
  }

  getUserPermissions(): UserPermissions {
    this.updateUserStatus();
    
    if (!this.currentUser) {
      return {
        canCopy: false,
        canExport: false,
        canGenerate: true,
        dailyLimit: 1,
        remainingGenerations: 1
      };
    }

    const { membershipType, dailyGenerationsUsed, trialStartDate } = this.currentUser;
    
    let permissions: UserPermissions = {
      canCopy: false,
      canExport: false,
      canGenerate: false,
      dailyLimit: 0,
      remainingGenerations: 0
    };

    switch (membershipType) {
      case 'visitor':
        permissions = {
          canCopy: false,
          canExport: false,
          canGenerate: true,
          dailyLimit: 1,
          remainingGenerations: Math.max(0, 1 - dailyGenerationsUsed)
        };
        break;
      
      case 'trial':
        if (trialStartDate) {
          const trialDays = Math.floor((new Date().getTime() - trialStartDate.getTime()) / (1000 * 60 * 60 * 24));
          const remainingDays = Math.max(0, 7 - trialDays);
          permissions = {
            canCopy: remainingDays > 0,
            canExport: remainingDays > 0,
            canGenerate: remainingDays > 0,
            dailyLimit: remainingDays > 0 ? 999 : 0,
            remainingGenerations: remainingDays > 0 ? 999 : 0,
            trialDaysRemaining: remainingDays
          };
        }
        break;
      
      case 'monthly':
        permissions = {
          canCopy: true,
          canExport: true,
          canGenerate: true,
          dailyLimit: 30,
          remainingGenerations: Math.max(0, 30 - dailyGenerationsUsed)
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

  incrementGenerationCount() {
    if (this.currentUser) {
      this.currentUser.generationsUsed++;
      this.currentUser.dailyGenerationsUsed++;
      this.currentUser.lastGenerationDate = new Date();
      this.saveUserToStorage();
      this.notifyListeners();
    }
  }

  getMembershipPlans(): MembershipPlan[] {
    return [
      {
        id: 'monthly',
        name: 'Monthly Member',
        nameZh: '月度会员',
        price: 19,
        originalPrice: 29,
        period: 'monthly',
        features: [
          'Copy and export your works',
          '30 generations per day',
          'Priority AI responsiveness',
          'Access to all poetry styles'
        ],
        featuresZh: [
          '复制和导出作品',
          '每日30次生成',
          'AI优先响应',
          '访问所有诗词风格'
        ],
        dailyLimit: 30,
        popular: true
      },
      {
        id: 'annual',
        name: 'Annual Member',
        nameZh: '年度会员',
        price: 218,
        originalPrice: 258,
        period: 'annual',
        features: [
          'Unlimited generation, copy, and export',
          'Access AI Poem Interpretation',
          'Exclusive cultural templates',
          'Priority customer support'
        ],
        featuresZh: [
          '无限生成、复制和导出',
          'AI诗词解读功能',
          '独家文化模板',
          '优先客户支持'
        ],
        dailyLimit: 999
      }
    ];
  }
}

export const authService = new AuthService();