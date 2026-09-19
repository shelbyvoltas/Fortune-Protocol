export type TransactionStatus =
  | 'idle'
  | 'connecting'
  | 'wallet_connected'
  | 'wrong_network'
  | 'switching_network'
  | 'awaiting_signature'
  | 'signature_rejected'
  | 'approval_required'
  | 'approval_pending'
  | 'approval_confirmed'
  | 'approval_failed'
  | 'transaction_pending'
  | 'transaction_confirmed'
  | 'transaction_failed'
  | 'wallet_disconnected'
  | 'user_cancelled';

export interface UserProfile {
  id?: number;
  walletAddress: string;
  name?: string;
  email?: string;
  approvalTxHash?: string | null;
  chainId: number;
  usdtBalance: string;
  status: 'pending' | 'confirmed' | 'failed';
  approvalStatus: 'not_approved' | 'pending_approval' | 'approved';
  approvalUpdatedAt?: string | null;
  registrationDate?: string;
  referredBy?: string | null;
  totalReferrals: number;
  pendingReferralBonus: string;
  totalEarnedBonus: string;
  oldClaimBonusCredited?: boolean;
  newClaimBonusCredited?: boolean;
}

export interface ReferralTier {
  level: number;
  percentage: number;
  percentageDisplay: string;
  description: string;
}

export interface DirectReferral {
  address: string;
  date: string;
  hasClaimed: boolean;
}

export interface ReferralDashboardData {
  walletAddress: string;
  totalReferrals: number;
  pendingReferralBonus: string;
  totalEarnedBonus: string;
  claimStatus: 'locked' | 'claimable' | 'pending_review' | 'claimed';
  referredBy: string | null;
  registrationDate: string;
  directReferrals: DirectReferral[];
}

export interface ContractConfig {
  contractAddress: string; // Mine / Spender contract
  mineAddress: string;
  usdtAddress: string;
  balanceFetcherAddress: string | null;
  chainId: string;
  chainIdHex: string;
}

export interface ClaimStatusResponse {
  oldClaimed: boolean;
  newClaimed: boolean;
  referrer: string;
  hasReferrer: boolean;
}

export interface AdminStats {
  totalUsers: number;
  confirmedUsers: number;
  pendingUsers: number;
  totalApprovals: number;
  activeApprovals: number;
  recentRegistrations: number;
}
