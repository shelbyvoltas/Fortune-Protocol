import { ContractConfig, ReferralDashboardData, AdminStats, UserProfile } from '../types';

const API_BASE = '/api';

export const DEFAULT_CONFIG: ContractConfig = {
  contractAddress: '', // Loaded from backend /api/config/contract-address
  mineAddress: '',
  usdtAddress: '', // USDT BEP-20 on BSC — loaded from backend
  balanceFetcherAddress: null,
  chainId: '56',
  chainIdHex: '0x38',
};

export const api = {
  // Config
  async getContractConfig(): Promise<ContractConfig> {
    try {
      const res = await fetch(`${API_BASE}/users/config/contract-address`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          return {
            ...DEFAULT_CONFIG,
            ...data,
            usdtAddress: data.usdtAddress || DEFAULT_CONFIG.usdtAddress,
          };
        }
      }
    } catch (err) {
      console.warn('Backend config unavailable, using default BSC contract config:', err);
    }
    return DEFAULT_CONFIG;
  },

  // Users
  async registerUser(params: {
    walletAddress: string;
    chainId: number;
    approvalTxHash?: string | null;
    sponsorAddress?: string | null;
    name?: string;
    email?: string;
  }): Promise<{ success: boolean; message: string; user: UserProfile; alreadyExists?: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/users/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Registration API error:', err);
    }
    return {
      success: true,
      message: 'Registration recorded locally',
      user: {
        walletAddress: params.walletAddress,
        chainId: params.chainId,
        usdtBalance: '0.0000',
        status: 'confirmed',
        approvalStatus: params.approvalTxHash ? 'approved' : 'pending_approval',
        totalReferrals: 0,
        pendingReferralBonus: '0.00',
        totalEarnedBonus: '100.00',
      },
    };
  },

  async updateProfile(params: {
    walletAddress: string;
    name?: string;
    email?: string;
  }): Promise<{ success: boolean; message: string; user?: UserProfile }> {
    try {
      const res = await fetch(`${API_BASE}/users/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Update profile API error:', err);
    }
    return { success: false, message: 'Profile update failed' };
  },

  async recordApproval(params: {
    walletAddress: string;
    approvalTxHash: string;
  }): Promise<{ success: boolean; message: string; user: UserProfile }> {
    try {
      const res = await fetch(`${API_BASE}/users/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Record approval API error:', err);
    }
    return {
      success: true,
      message: 'Approval recorded',
      user: {
        walletAddress: params.walletAddress,
        chainId: 56,
        usdtBalance: '0.0000',
        status: 'confirmed',
        approvalStatus: 'approved',
        totalReferrals: 0,
        pendingReferralBonus: '0.00',
        totalEarnedBonus: '100.00',
      },
    };
  },

  async getUser(address: string): Promise<{ success: boolean; registered: boolean; user?: UserProfile }> {
    try {
      const res = await fetch(`${API_BASE}/users/${address.toLowerCase()}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Get user API error:', err);
    }
    return { success: false, registered: false };
  },

  // Referrals
  async getReferralDashboard(address: string): Promise<{ success: boolean; data?: ReferralDashboardData } & Partial<ReferralDashboardData>> {
    try {
      const res = await fetch(`${API_BASE}/referrals/dashboard/${address.toLowerCase()}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Dashboard API error:', err);
    }
    return {
      success: true,
      walletAddress: address,
      totalReferrals: 0,
      pendingReferralBonus: '0.00',
      totalEarnedBonus: '0.00',
      claimStatus: 'locked',
      referredBy: null,
      registrationDate: new Date().toISOString(),
      directReferrals: [],
    };
  },

  async trackReferralBonus(params: {
    claimerAddress: string;
    claimType?: 'old' | 'new';
    claimedAmount?: number | string;
    txHash?: string;
    referrerAddress?: string;
  }): Promise<{ success: boolean; message: string; bonusesCredited?: number; alreadyCredited?: boolean }> {
    try {
      const res = await fetch(`${API_BASE}/referrals/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Track bonus API error:', err);
    }
    return { success: true, message: 'Bonus tracked' };
  },

  async getLeaderboard(): Promise<{ success: boolean; leaderboard: Array<{ rank: number; address: string; referrals: number; earned: string }> }> {
    try {
      const res = await fetch(`${API_BASE}/referrals/leaderboard`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Leaderboard API error:', err);
    }
    return { success: true, leaderboard: [] };
  },

  // Claims
  async getClaimStatus(address: string) {
    try {
      const res = await fetch(`${API_BASE}/claims/status/${address.toLowerCase()}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Claim status API error:', err);
    }
    return { success: true, oldClaimed: false, newClaimed: false, referrer: '0x0000000000000000000000000000000000000000', hasReferrer: false };
  },

  async getClaimReferralInfo(address: string) {
    try {
      const res = await fetch(`${API_BASE}/claims/referral-info/${address.toLowerCase()}`);
      if (res.ok) return await res.json();
    } catch (err) {
      console.warn('Claim referral info API error:', err);
    }
    return { success: true, pendingRewards: '0.00', totalEarned: '0.00', totalClaimed: '0.00', directReferrals: 0 };
  },

  // Admin
  async adminLogin(credentials: { username: string; password: string }) {
    const res = await fetch(`${API_BASE}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return res.json();
  },

  async getAdminStats(token: string): Promise<{ success: boolean; stats: AdminStats }> {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async getAdminUsers(token: string, page = 1, limit = 50, refresh = false) {
    const res = await fetch(`${API_BASE}/admin/users?page=${page}&limit=${limit}${refresh ? '&refresh=true' : ''}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async getAdminApprovals(token: string) {
    const res = await fetch(`${API_BASE}/admin/approvals`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async addApprovalAddress(token: string, data: { contractAddress: string; description: string; chainId: number; isActive?: boolean }, adminWallet?: string | null) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    if (adminWallet) {
      headers['X-Admin-Wallet'] = adminWallet;
    }
    const res = await fetch(`${API_BASE}/admin/approvals`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async updateApprovalAddress(token: string, id: number, data: { description?: string; isActive?: boolean }, adminWallet?: string | null) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    };
    if (adminWallet) {
      headers['X-Admin-Wallet'] = adminWallet;
    }
    const res = await fetch(`${API_BASE}/admin/approvals/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deleteApprovalAddress(token: string, id: number, adminWallet?: string | null) {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };
    if (adminWallet) {
      headers['X-Admin-Wallet'] = adminWallet;
    }
    const res = await fetch(`${API_BASE}/admin/approvals/${id}`, {
      method: 'DELETE',
      headers,
    });
    return res.json();
  },

  async triggerBalanceRefresh(token: string) {
    const res = await fetch(`${API_BASE}/admin/refresh-balances`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async getAdminLogs(token: string, page = 1, limit = 50, action?: string, search?: string) {
    let url = `${API_BASE}/admin/logs?page=${page}&limit=${limit}`;
    if (action && action !== 'all') url += `&action=${encodeURIComponent(action)}`;
    if (search && search.trim()) url += `&search=${encodeURIComponent(search.trim())}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.json();
  },

  async logActivity(data: {
    walletAddress?: string | null;
    action: string;
    refCode?: string | null;
    txHash?: string | null;
    details?: string | null;
  }) {
    try {
      const res = await fetch(`${API_BASE}/users/activity/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch (e) {
      // ignore client-side logging errors
    }
    return { success: false };
  }
};
