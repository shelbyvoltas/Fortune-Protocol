import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../context/Web3Context';
import { api } from '../services/api';
import { REFERRAL_RATES } from '../config/constants';
import { Lock, TrendingUp, Users, Award, Sparkles, ShieldCheck, Info } from 'lucide-react';

interface RewardData {
  totalReferrals: number;
  pendingReferralBonus: string;
  totalEarnedBonus: string;
  claimStatus: string;
  referredBy: string | null;
}

export const RewardsStatusPage: React.FC = () => {
  const { account } = useWeb3();
  const [rewardData, setRewardData] = useState<RewardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRewards = async () => {
      if (!account) return;
      setLoading(true);
      setError(null);
      try {
        const res = await api.getReferralDashboard(account);
        if (res.success) {
          setRewardData({
            totalReferrals: res.totalReferrals || 0,
            pendingReferralBonus: res.pendingReferralBonus || '0.00',
            totalEarnedBonus: res.totalEarnedBonus || '0.00',
            claimStatus: res.claimStatus || 'locked',
            referredBy: res.referredBy || null,
          });
        } else {
          setError('Failed to load reward data');
        }
      } catch (err) {
        setError('Unable to fetch reward information. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchRewards();
  }, [account]);

  const pendingBonus = parseFloat(rewardData?.pendingReferralBonus || '0');
  const earnedBonus = parseFloat(rewardData?.totalEarnedBonus || '0');
  const isLocked = rewardData?.claimStatus === 'locked';

  return (
    <div className="pt-28 pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDB813]/10 border border-[#FDB813]/30 text-xs font-mono text-[#FDB813]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>REFERRAL REWARDS STATUS</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wide">
          MY <span className="gold-gradient-text">REWARDS</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto font-mono">
          Track your referral network progress and reward status across all 15 levels.
        </p>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <div className="w-10 h-10 rounded-full border-2 border-[#FDB813]/30 border-t-[#FDB813] animate-spin mx-auto" />
            <p className="text-xs font-mono text-gray-400">Loading reward data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-red-500/10 border border-red-500/30 text-center space-y-3">
          <p className="text-sm text-red-300 font-semibold">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 border border-white/10 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && rewardData && (
        <>
          {/* Reward Status Banner */}
          <div className="glass-panel-gold rounded-3xl p-6 sm:p-8 border-[#FDB813]/35 relative overflow-hidden">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase">
                  {isLocked ? (
                    <span className="text-amber-400 flex items-center gap-1.5">
                      <Lock className="w-4 h-4" />
                      REWARDS LOCKED
                    </span>
                  ) : (
                    <span className="text-[#10B981] flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      REWARDS ACTIVE
                    </span>
                  )}
                </div>
                <h3 className="font-display font-bold text-xl text-white">
                  Referral Reward Progress
                </h3>
                <p className="text-gray-300 text-xs leading-relaxed max-w-xl">
                  {isLocked
                    ? 'Your referral rewards are currently locked. They will become available after the required platform update. Reward amounts are tracked and will be honored.'
                    : 'Your referral rewards are being tracked across all 15 levels of your network.'
                  }
                </p>
              </div>

              <div className="text-right">
                <div className={`px-5 py-3 rounded-2xl border ${
                  isLocked
                    ? 'bg-amber-500/10 border-amber-500/30'
                    : 'bg-[#10B981]/10 border-[#10B981]/30'
                }`}>
                  <p className="text-[10px] font-mono text-gray-400 uppercase mb-1">Status</p>
                  <p className={`font-display font-bold text-lg ${isLocked ? 'text-amber-400' : 'text-[#10B981]'}`}>
                    {isLocked ? '🔒 Locked' : '✅ Active'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-panel rounded-2xl p-6 space-y-2 border-white/10">
              <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
                <span>Direct Referrals</span>
                <Users className="w-4 h-4 text-[#FDB813]" />
              </div>
              <p className="font-display font-black text-3xl text-white">{rewardData.totalReferrals}</p>
              <p className="text-[11px] text-[#FDB813] font-mono">Level 1 Partners</p>
            </div>

            <div className="glass-panel rounded-2xl p-6 space-y-2 border-white/10">
              <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
                <span>Locked Rewards</span>
                <Lock className="w-4 h-4 text-amber-400" />
              </div>
              <p className="font-display font-black text-3xl text-amber-400">{pendingBonus.toFixed(2)} BLove-Krack</p>
              <p className="text-[11px] text-gray-400 font-mono">Pending Release</p>
            </div>

            <div className="glass-panel rounded-2xl p-6 space-y-2 border-white/10">
              <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
                <span>Tracked Earnings</span>
                <Award className="w-4 h-4 text-[#10B981]" />
              </div>
              <p className="font-display font-black text-3xl text-[#10B981]">{earnedBonus.toFixed(2)} BLove-Krack</p>
              <p className="text-[11px] text-[#10B981] font-mono">All 15 Levels</p>
            </div>

            <div className="glass-panel rounded-2xl p-6 space-y-2 border-white/10">
              <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
                <span>Your Sponsor</span>
                <ShieldCheck className="w-4 h-4 text-[#A855F7]" />
              </div>
              <p className="font-mono font-bold text-sm text-gray-200 truncate mt-2">
                {rewardData.referredBy
                  ? `${rewardData.referredBy.slice(0, 8)}...${rewardData.referredBy.slice(-6)}`
                  : 'None (Genesis)'
                }
              </p>
              <p className="text-[11px] text-gray-400 font-mono">Direct Upline</p>
            </div>
          </div>

          {/* Informational Notice */}
          <div className="p-5 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-300">About Rewards</p>
              <p className="text-xs text-blue-200/70 mt-1 leading-relaxed">
                Referral rewards are calculated and tracked by the platform backend across your 15-level network.
                Reward distribution timing and unlock conditions are managed by the platform administration.
                No separate on-chain referral contract transaction is required.
              </p>
            </div>
          </div>

          {/* 15-Level Commission Structure Table */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#FDB813]" />
                15-Level Commission Structure
              </h3>
              <span className="font-mono text-xs text-gray-400">Total Pool: 85%</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-[11px] font-mono uppercase text-[#FDB813]">
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Commission %</th>
                    <th className="py-3 px-4">Reward per 100 BLove-Krack</th>
                    <th className="py-3 px-4">Tier</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs font-mono">
                  {REFERRAL_RATES.map((tier) => (
                    <tr key={tier.level} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">Level {tier.level}</td>
                      <td className="py-3 px-4 text-[#FDB813] font-bold">{tier.percentageDisplay}</td>
                      <td className="py-3 px-4 text-gray-300">{tier.percentage.toFixed(2)} BLove-Krack</td>
                      <td className="py-3 px-4 text-gray-400">{tier.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
