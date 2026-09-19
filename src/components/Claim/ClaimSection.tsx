import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
// Note: ClaimSection is deprecated — replaced by RewardsStatusPage
import { Gift, Lock, ShieldCheck, Sparkles, CheckCircle, Clock, Loader2 } from 'lucide-react';

export const ClaimSection: React.FC = () => {
  const { account, connectWallet } = useWeb3();
  const { showToast } = useNotification();

  const [oldClaimed, setOldClaimed] = useState(false);
  const [newClaimed, setNewClaimed] = useState(false);
  const [pendingRewards, setPendingRewards] = useState('0.00');
  const [totalEarned, setTotalEarned] = useState('0.00');
  const [loading, setLoading] = useState(false);
  const [claimingType, setClaimingType] = useState<'old' | 'new' | 'bonus' | null>(null);

  useEffect(() => {
    const fetchStatus = async () => {
      if (!account) return;
      try {
        const statusRes = await api.getClaimStatus(account);
        if (statusRes.success) {
          setOldClaimed(statusRes.oldClaimed);
          setNewClaimed(statusRes.newClaimed);
        }

        const infoRes = await api.getClaimReferralInfo(account);
        if (infoRes.success) {
          setPendingRewards(parseFloat(infoRes.pendingRewards || '0').toFixed(2));
          setTotalEarned(parseFloat(infoRes.totalEarned || '0').toFixed(2));
        }
      } catch (err) {
        console.warn('Failed to load on-chain claim status:', err);
      }
    };
    fetchStatus();
  }, [account]);

  const handleClaim = async (type: 'old' | 'new' | 'bonus') => {
    if (!account) {
      await connectWallet();
      return;
    }

    setClaimingType(type);
    setLoading(true);

    try {
      showToast('Preparing claim request...', 'info');

      // Simulate on-chain contract or backend track
      const amount = type === 'old' ? 300 : type === 'new' ? 100 : parseFloat(pendingRewards);

      // Submit to backend
      const res = await api.trackReferralBonus({
        claimerAddress: account,
        claimType: type === 'old' ? 'old' : 'new',
        claimedAmount: amount,
      });

      if (res.success) {
        if (type === 'old') setOldClaimed(true);
        if (type === 'new') setNewClaimed(true);

        showToast(
          `Successfully claimed ${amount} BLove-Krack! Tokens are recorded and will be distributed to your account.`,
          'success',
          'Claim Submitted!'
        );
      } else {
        showToast(res.message || 'Claim processed.', 'info');
      }
    } catch (err: any) {
      console.error('Claim error:', err);
      showToast(err.message || 'Claim failed.', 'error');
    } finally {
      setLoading(false);
      setClaimingType(null);
    }
  };

  if (!account) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center">
        <div className="glass-panel-gold rounded-3xl p-8 sm:p-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FDB813]/20 border border-[#FDB813]/40 flex items-center justify-center mx-auto text-[#FDB813]">
            <Gift className="w-8 h-8" />
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
            TOKEN REWARD CLAIMS
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Connect your BSC wallet to check your eligibility for Old User (300 BLove-Krack), New User (100 BLove-Krack), and 15-tier referral bonus distributions.
          </p>
          <button
            onClick={connectWallet}
            className="btn-gold-glow w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wider"
          >
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="py-12 max-w-5xl mx-auto px-4 sm:px-6 space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDB813]/10 border border-[#FDB813]/30 text-xs font-mono text-[#FDB813]">
          <Gift className="w-3.5 h-3.5" />
          <span>OFFICIAL DISTRIBUTION PORTAL</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wide">
          TOKEN REWARDS &amp; <span className="gold-gradient-text">BONUS CLAIMS</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto font-mono">
          One-time welcome allocations and accumulated multi-tier referral bonuses.
        </p>
      </div>

      {/* Claim Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Old User Allocation (300 $CC) */}
        <div className="glass-panel cyber-card rounded-3xl p-8 space-y-6 border-white/10 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-gray-400 uppercase">Tier 1 Allocation</span>
              {oldClaimed ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] font-mono text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> CLAIMED
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-[#FDB813]/20 text-[#FDB813] font-mono text-xs font-bold">
                  AVAILABLE
                </span>
              )}
            </div>

            <div>
              <h3 className="font-display font-black text-4xl text-white">300 BLove-Krack</h3>
              <p className="text-sm font-semibold text-[#FDB813] mt-1 font-display">Old Community User Claim</p>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Reserved for early community members and legacy snapshot addresses. Awards 300 BLove-Krack and triggers multi-level upline rewards.
            </p>
          </div>

          <button
            onClick={() => handleClaim('old')}
            disabled={oldClaimed || loading}
            className={`w-full py-4 rounded-xl text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${
              oldClaimed
                ? 'bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] cursor-default'
                : 'btn-gold-glow'
            }`}
          >
            {claimingType === 'old' && <Loader2 className="w-4 h-4 animate-spin text-black" />}
            {oldClaimed ? '✅ 300 BLove-Krack Claimed' : 'Claim 300 BLove-Krack'}
          </button>
        </div>

        {/* New User Allocation (100 BLove-Krack) */}
        <div className="glass-panel-gold cyber-card rounded-3xl p-8 space-y-6 border-[#FDB813]/35 relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs text-[#FDB813] uppercase">Welcome Bonus</span>
              {newClaimed ? (
                <span className="px-2.5 py-0.5 rounded-full bg-[#10B981]/20 text-[#10B981] font-mono text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> CLAIMED
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-[#22D3EE]/20 text-[#22D3EE] font-mono text-xs font-bold">
                  NEW REGISTRATION
                </span>
              )}
            </div>

            <div>
              <h3 className="font-display font-black text-4xl text-white">100 BLove-Krack</h3>
              <p className="text-sm font-semibold text-[#22D3EE] mt-1 font-display">New Player Welcome Reward</p>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed">
              Standard welcome allocation for newly connected players. Distributed directly by the backend platform upon smart contract authorization.
            </p>
          </div>

          <button
            onClick={() => handleClaim('new')}
            disabled={newClaimed || loading}
            className={`w-full py-4 rounded-xl text-xs font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${
              newClaimed
                ? 'bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981] cursor-default'
                : 'btn-gold-glow'
            }`}
          >
            {claimingType === 'new' && <Loader2 className="w-4 h-4 animate-spin text-black" />}
            {newClaimed ? '✅ 100 BLove-Krack Claimed' : 'Claim 100 BLove-Krack'}
          </button>
        </div>

      </div>

      {/* Accumulated Referral Bonus Card */}
      <div className="glass-panel rounded-3xl p-8 border-[#22D3EE]/30 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-mono text-xs text-[#22D3EE] uppercase font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              15-Tier Accumulated Referral Balance
            </span>
            <h3 className="font-display font-bold text-2xl text-white">
              {pendingRewards} BLove-Krack Pending
            </h3>
            <p className="font-mono text-xs text-gray-400">Total Historically Earned: {totalEarned} BLove-Krack</p>
          </div>

          <button
            onClick={() => handleClaim('bonus')}
            disabled={parseFloat(pendingRewards) <= 0 || loading}
            className={`px-8 py-4 rounded-xl text-xs font-display font-bold uppercase tracking-wider flex items-center gap-2 ${
              parseFloat(pendingRewards) > 0
                ? 'btn-gold-glow'
                : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
            }`}
          >
            {claimingType === 'bonus' && <Loader2 className="w-4 h-4 animate-spin text-black" />}
            <span>Claim Referral Bonus</span>
          </button>
        </div>
      </div>

    </div>
  );
};
