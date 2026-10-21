import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useNotification } from '../../context/NotificationContext';
import { api } from '../../services/api';
import {
  X, User, Mail, Wallet, ShieldCheck, Copy, Check, Sparkles,
  Loader2, Lock, Users, Award, TrendingUp, Calendar, Link2
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ProfileReferralData {
  totalReferrals: number;
  pendingReferralBonus: string;
  totalEarnedBonus: string;
  claimStatus: string;
  referredBy: string | null;
  registrationDate: string;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { account, chainId, userProfile, refreshUserData } = useWeb3();
  const { showToast } = useNotification();

  const [name, setName] = useState(userProfile?.name || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [saving, setSaving] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [referralData, setReferralData] = useState<ProfileReferralData | null>(null);
  const [loadingReferral, setLoadingReferral] = useState(false);

  // Fetch referral data when modal opens
  useEffect(() => {
    if (isOpen && account) {
      setName(userProfile?.name || '');
      setEmail(userProfile?.email || '');
      
      const fetchReferralData = async () => {
        setLoadingReferral(true);
        try {
          const res = await api.getReferralDashboard(account);
          if (res.success) {
            setReferralData({
              totalReferrals: res.totalReferrals || 0,
              pendingReferralBonus: res.pendingReferralBonus || '0.00',
              totalEarnedBonus: res.totalEarnedBonus || '0.00',
              claimStatus: res.claimStatus || 'locked',
              referredBy: res.referredBy || null,
              registrationDate: res.registrationDate || new Date().toISOString(),
            });
          }
        } catch (err) {
          console.warn('Failed to load referral data:', err);
        } finally {
          setLoadingReferral(false);
        }
      };
      fetchReferralData();
    }
  }, [isOpen, account, userProfile]);

  if (!isOpen || !account) return null;

  const isApproved = userProfile?.approvalStatus === 'approved';
  const referralLink = isApproved ? `${window.location.origin}/?ref=${account}` : '';

  const handleCopyLink = () => {
    if (!isApproved) {
      showToast('Please complete registration first to unlock your referral link.', 'warning');
      return;
    }
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    showToast('Referral link copied!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(account);
    setCopiedAddress(true);
    showToast('Wallet address copied!', 'success');
    setTimeout(() => setCopiedAddress(false), 2000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateProfile({
        walletAddress: account,
        name: name.trim(),
        email: email.trim(),
      });

      if (res.success) {
        showToast('Profile updated successfully!', 'success');
        await refreshUserData();
        onClose();
      } else {
        showToast(res.message || 'Failed to update profile', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const pendingBonus = parseFloat(referralData?.pendingReferralBonus || '0');
  const earnedBonus = parseFloat(referralData?.totalEarnedBonus || '0');
  const isLocked = referralData?.claimStatus === 'locked';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="glass-panel-blue rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-5 relative border-[#2563EB]/40 shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2563EB]/20">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2563EB]/20 text-[#2563EB]">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-white">Player Profile</h3>
              <p className="font-mono text-[10px] text-gray-400">BSC Non-Custodial Account</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wallet Address & Status */}
        <div className="p-4 rounded-2xl bg-[#08080B]/70 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-[#2563EB]" />
              Wallet Address
            </span>
            {userProfile?.approvalStatus === 'approved' ? (
              <span className="text-[#10B981] font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Registered
              </span>
            ) : (
              <span className="text-[#2563EB] font-bold">Standard</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="font-mono text-xs text-[#22D3EE] font-semibold break-all select-all flex-1">
              {account}
            </p>
            <button
              onClick={handleCopyAddress}
              className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0"
              title="Copy address"
            >
              {copiedAddress ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Account Info Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-[#08080B]/70 border border-white/10 text-center">
            <p className="text-[10px] font-mono text-gray-400 uppercase">Account Status</p>
            <p className={`font-display font-bold text-sm mt-1 ${
              userProfile?.status === 'confirmed' ? 'text-[#10B981]' : 'text-[#2563EB]'
            }`}>
              {userProfile?.status === 'confirmed' ? 'Active' : 'Pending'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-[#08080B]/70 border border-white/10 text-center">
            <p className="text-[10px] font-mono text-gray-400 uppercase">Registration</p>
            <p className="font-display font-bold text-sm mt-1 text-white flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3 text-[#2563EB]" />
              {referralData?.registrationDate
                ? new Date(referralData.registrationDate).toLocaleDateString()
                : '—'
              }
            </p>
          </div>
        </div>

        {/* Referral Stats */}
        {loadingReferral ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-[#2563EB]" />
          </div>
        ) : referralData && (
          <div className="space-y-3">
            <h4 className="text-xs font-mono text-[#2563EB] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" />
              Referral Network
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-[#08080B]/70 border border-white/10 text-center">
                <Users className="w-4 h-4 text-[#2563EB] mx-auto mb-1" />
                <p className="font-display font-bold text-lg text-white">{referralData.totalReferrals}</p>
                <p className="text-[9px] font-mono text-gray-400">Direct Refs</p>
              </div>
              <div className="p-3 rounded-xl bg-[#08080B]/70 border border-white/10 text-center">
                <Lock className="w-4 h-4 text-amber-400 mx-auto mb-1" />
                <p className="font-display font-bold text-lg text-amber-400">{pendingBonus.toFixed(1)}</p>
                <p className="text-[9px] font-mono text-gray-400">Locked Fortune Protocol G</p>
              </div>
              <div className="p-3 rounded-xl bg-[#08080B]/70 border border-white/10 text-center">
                <Award className="w-4 h-4 text-[#10B981] mx-auto mb-1" />
                <p className="font-display font-bold text-lg text-[#10B981]">{earnedBonus.toFixed(1)}</p>
                <p className="text-[9px] font-mono text-gray-400">Tracked Fortune Protocol G</p>
              </div>
            </div>

            {/* Reward Status */}
            <div className={`p-3 rounded-xl border text-xs font-mono flex items-center gap-2 ${
              isLocked
                ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                : 'bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]'
            }`}>
              {isLocked ? <Lock className="w-3.5 h-3.5" /> : <ShieldCheck className="w-3.5 h-3.5" />}
              <span>Reward Status: {isLocked ? 'Locked — pending platform update' : 'Active'}</span>
            </div>

            {/* Sponsor */}
            {referralData.referredBy && (
              <div className="p-3 rounded-xl bg-[#08080B]/70 border border-white/10">
                <p className="text-[10px] font-mono text-gray-400 uppercase mb-1">Referred By</p>
                <p className="font-mono text-xs text-[#A855F7] font-semibold truncate">
                  {referralData.referredBy}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Share Referral Link */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-mono text-[#2563EB] font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Link2 className="w-3.5 h-3.5" />
              Your Referral Link
            </label>
            {!isApproved && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold">
                Registration Required
              </span>
            )}
          </div>
          {isApproved ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#08080B]/70 border border-[#2563EB]/30 text-xs font-mono text-gray-200 outline-none select-all"
              />
              <button
                onClick={handleCopyLink}
                className="btn-primary px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
              >
                {copiedLink ? <Check className="w-4 h-4 text-black" /> : <Copy className="w-4 h-4 text-black" />}
                <span>{copiedLink ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 font-mono">
              Complete registration to generate & unlock your 15-tier referral link.
            </div>
          )}
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSave} className="space-y-4 pt-2 border-t border-white/10">
          <h4 className="text-xs font-mono text-gray-300 font-bold uppercase tracking-wider pt-2">
            Profile Settings
          </h4>
          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Display Name (Optional)</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your gamer tag / name"
              className="w-full px-4 py-2.5 rounded-xl bg-[#08080B]/70 border border-white/10 text-xs text-white outline-none focus:border-[#2563EB]/50 transition-colors"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-300 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Email Address (Optional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@domain.com"
              className="w-full px-4 py-2.5 rounded-xl bg-[#08080B]/70 border border-white/10 text-xs text-white outline-none focus:border-[#2563EB]/50 transition-colors"
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors"
            >
              Close
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 btn-primary py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2"
            >
              {saving && <Loader2 className="w-4 h-4 animate-spin text-black" />}
              <span>Save Profile</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
