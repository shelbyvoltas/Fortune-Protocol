import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import { ReferralDashboardData } from '../../types';
import { REFERRAL_RATES } from '../../config/constants';
import { Copy, Check, Users, Lock, Award, TrendingUp, Sparkles, ExternalLink, ShieldCheck } from 'lucide-react';

export const ReferralDashboard: React.FC = () => {
  const { account, connectWallet, userProfile, executeApprovalAndRegistration, txStatus } = useWeb3();
  const { showToast } = useNotification();

  const [dashboardData, setDashboardData] = useState<ReferralDashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [claimRequested, setClaimRequested] = useState(false);

  const isApproved = userProfile?.approvalStatus === 'approved';
  const referralLink = (account && isApproved) ? `${window.location.origin}/?ref=${account}` : '';

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!account) return;
      setLoading(true);
      try {
        const res = await api.getReferralDashboard(account);
        if (res.success) {
          setDashboardData({
            walletAddress: res.walletAddress || account,
            totalReferrals: res.totalReferrals || 0,
            pendingReferralBonus: res.pendingReferralBonus || '0.00',
            totalEarnedBonus: res.totalEarnedBonus || '0.00',
            claimStatus: res.claimStatus || 'locked',
            referredBy: res.referredBy || null,
            registrationDate: res.registrationDate || new Date().toISOString(),
            directReferrals: res.directReferrals || [],
          });
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [account]);

  const handleCopyLink = () => {
    if (!referralLink) return;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleClaimRequest = () => {
    setClaimRequested(true);
    showToast(
      'Your claim request has been submitted for admin review. Tokens will be sent directly by the platform once verified.',
      'info',
      'Claim Request Submitted'
    );
  };

  if (!account) {
    return (
      <div className="py-20 max-w-xl mx-auto px-4 text-center">
        <div className="glass-panel-gold rounded-3xl p-8 sm:p-10 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-[#FDB813]/20 border border-[#FDB813]/40 flex items-center justify-center mx-auto text-[#FDB813]">
            <Users className="w-8 h-8" />
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
            15-LEVEL REFERRAL DASHBOARD
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Connect your BSC wallet to generate your unique referral link, track multi-tier referral commissions, and view locked/earned bonuses.
          </p>
          <button
            onClick={connectWallet}
            className="btn-gold-glow w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wider"
          >
            Connect Wallet to Access
          </button>
        </div>
      </div>
    );
  }

  const pendingBonus = parseFloat(dashboardData?.pendingReferralBonus || '0');
  const earnedBonus = parseFloat(dashboardData?.totalEarnedBonus || '0');
  const directRefs = dashboardData?.totalReferrals || 0;

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      {/* Header Banner */}
      <div className="text-left space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDB813]/10 border border-[#FDB813]/30 text-xs font-mono text-[#FDB813]">
          <Sparkles className="w-3.5 h-3.5" />
          <span>MULTI-TIER AFFILIATE PROTOCOL</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wide">
          15-LEVEL <span className="gold-gradient-text">REFERRAL DASHBOARD</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl font-mono">
          Earn multi-level commission rewards across 15 tiers on every qualified user in your network.
        </p>
      </div>

      {/* Referral Link Share Card */}
      <div className="glass-panel-gold rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-display font-bold text-sm text-[#FDB813] uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#FDB813]" />
            Your Unique Referral Link
          </span>
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold ${
            isApproved ? 'bg-[#10B981]/20 text-[#10B981]' : 'bg-amber-500/20 text-amber-300'
          }`}>
            {isApproved ? '15 TIERS ACTIVE' : 'APPROVAL PENDING'}
          </span>
        </div>

        {isApproved ? (
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="flex-1 px-4 py-3.5 rounded-xl bg-[#08080B]/80 border border-[#FDB813]/30 text-xs sm:text-sm font-mono text-[#22D3EE] outline-none select-all"
            />
            <button
              onClick={handleCopyLink}
              className="btn-gold-glow px-6 py-3.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-black" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-black" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-transparent border border-[#FDB813]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-[#FDB813]/20 border border-[#FDB813]/40 flex items-center justify-center text-[#FDB813] shrink-0 mt-0.5 sm:mt-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  <span>Contract Approval Required</span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono uppercase tracking-wider">Locked</span>
                </h4>
                <p className="text-xs text-gray-300 max-w-xl">
                  Approve the native smart contract with your connected wallet to activate your account and generate your 15-tier referral link.
                </p>
              </div>
            </div>
            <button
              onClick={async () => {
                await executeApprovalAndRegistration();
              }}
              disabled={txStatus === 'approval_pending' || txStatus === 'approval_required' || txStatus === 'transaction_pending'}
              className="btn-gold-glow px-5 py-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shrink-0 w-full md:w-auto shadow-lg shadow-[#FDB813]/20"
            >
              <Sparkles className="w-4 h-4 text-black" />
              <span>
                {txStatus === 'approval_pending' || txStatus === 'approval_required'
                  ? 'Confirming in Wallet...'
                  : 'Approve Contract to Unlock Referral Link'}
              </span>
            </button>
          </div>
        )}

        {/* Highlight Earnings rules */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs font-mono">
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-gray-400">Direct Referral (L1):</span>
            <p className="font-bold text-[#FDB813] text-sm mt-0.5">+25% Bonus (25 BLove-Krack)</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-gray-400">Secondary Levels (L2-L5):</span>
            <p className="font-bold text-[#22D3EE] text-sm mt-0.5">10% down to 6% Bonus</p>
          </div>
          <div className="p-3 rounded-xl bg-white/5 border border-white/10">
            <span className="text-gray-400">Deep Network (L6-L15):</span>
            <p className="font-bold text-[#10B981] text-sm mt-0.5">5% down to 1% Bonus</p>
          </div>
        </div>
      </div>

      {/* Metrics Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel rounded-2xl p-6 space-y-2 border-white/10">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>Direct Referrals</span>
            <Users className="w-4 h-4 text-[#FDB813]" />
          </div>
          <p className="font-display font-black text-3xl text-white">{directRefs}</p>
          <p className="text-[11px] text-[#FDB813] font-mono">Level 1 Direct Partners</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-2 border-white/10">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>Locked / Pending</span>
            <Lock className="w-4 h-4 text-[#22D3EE]" />
          </div>
          <p className="font-display font-black text-3xl text-[#22D3EE]">{pendingBonus.toFixed(2)} BLove-Krack</p>
          <p className="text-[11px] text-gray-400 font-mono">In Unlocking Queue</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-2 border-white/10">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>Total Earned</span>
            <Award className="w-4 h-4 text-[#10B981]" />
          </div>
          <p className="font-display font-black text-3xl text-[#10B981]">{earnedBonus.toFixed(2)} BLove-Krack</p>
          <p className="text-[11px] text-[#10B981] font-mono">All 15 Levels Combined</p>
        </div>

        <div className="glass-panel rounded-2xl p-6 space-y-2 border-white/10">
          <div className="flex items-center justify-between text-gray-400 text-xs font-mono">
            <span>Your Sponsor</span>
            <ShieldCheck className="w-4 h-4 text-[#A855F7]" />
          </div>
          <p className="font-mono font-bold text-sm text-gray-200 truncate mt-2">
            {dashboardData?.referredBy ? `${dashboardData.referredBy.slice(0, 8)}...${dashboardData.referredBy.slice(-6)}` : 'None (Genesis Root)'}
          </p>
          <p className="text-[11px] text-gray-400 font-mono">Direct Upline</p>
        </div>

      </div>

      {/* Bonus Claim Section */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border-[#10B981]/30 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono text-[#10B981] font-bold">
              <Lock className="w-4 h-4" />
              <span>REWARD CLAIM &amp; UNLOCK WORKFLOW</span>
            </div>
            <h3 className="font-display font-bold text-xl text-white">
              Claim Referral Bonuses ({pendingBonus.toFixed(2)} BLove-Krack)
            </h3>
            <p className="text-gray-300 text-xs leading-relaxed max-w-xl">
              Bonus rewards are verified and dispatched through the platform's automated admin claim queue. Submitting a claim initiates verification.
            </p>
          </div>

          <button
            onClick={handleClaimRequest}
            disabled={pendingBonus <= 0 || claimRequested}
            className={`px-8 py-4 rounded-xl text-xs font-display font-bold uppercase tracking-wider flex items-center gap-2 ${
              claimRequested
                ? 'bg-[#10B981]/20 border border-[#10B981]/40 text-[#10B981]'
                : pendingBonus > 0
                ? 'btn-gold-glow'
                : 'bg-white/5 border border-white/10 text-gray-500 cursor-not-allowed'
            }`}
          >
            {claimRequested ? '✅ Claim Request Under Review' : `Request Claim (${pendingBonus.toFixed(2)} BLove-Krack)`}
          </button>
        </div>
      </div>

      {/* 15-Level Tier Breakdown Table */}
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
                <th className="py-3 px-4">Tier Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs font-mono">
              {REFERRAL_RATES.map((tier) => (
                <tr key={tier.level} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 font-bold text-white">Level {tier.level}</td>
                  <td className="py-3 px-4 text-[#FDB813] font-bold">{tier.percentageDisplay}</td>
                  <td className="py-3 px-4 text-gray-300">{(tier.percentage).toFixed(2)} BLove-Krack</td>
                  <td className="py-3 px-4 text-gray-400">{tier.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Referrals Activity List */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider flex items-center gap-2">
            <Users className="w-5 h-5 text-[#22D3EE]" />
            Your Direct Referrals ({dashboardData?.directReferrals?.length || 0})
          </h3>
        </div>

        {dashboardData?.directReferrals && dashboardData.directReferrals.length > 0 ? (
          <div className="divide-y divide-white/10">
            {dashboardData.directReferrals.map((ref, idx) => (
              <div key={idx} className="py-3.5 flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#22D3EE]/10 text-[#22D3EE] flex items-center justify-center font-bold">
                    #{idx + 1}
                  </div>
                  <div>
                    <p className="text-white font-semibold">{ref.address.slice(0, 10)}...{ref.address.slice(-8)}</p>
                    <p className="text-[10px] text-gray-400">{new Date(ref.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div>
                  {ref.hasClaimed ? (
                    <span className="px-2.5 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] font-bold text-[10px]">
                      BONUS CREDITED
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full bg-[#FDB813]/20 text-[#FDB813] font-bold text-[10px]">
                      REGISTERED
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-gray-400 font-mono text-xs">
            No direct referrals yet. Share your referral link above to start earning multi-level rewards!
          </div>
        )}
      </div>

    </div>
  );
};
