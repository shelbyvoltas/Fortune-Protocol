import React, { useState, useEffect } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { ArrowDownUp, LineChart, Sparkles, CheckCircle, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { BSC_MAINNET_ID } from '../../config/constants';

interface TokenCardProps {
  onSuccess?: () => void;
}

export const TokenCard: React.FC<TokenCardProps> = ({ onSuccess }) => {
  const { 
    account, 
    usdtBalance,
    refreshUsdtBalance,
    isCorrectNetwork, 
    connectWallet, 
    switchNetwork, 
    executeApprovalAndRegistration, 
    txStatus, 
    statusMessage,
    userProfile,
    referrerAddress
  } = useWeb3();

  const [toAmount] = useState('100.00');
  const [usdtInput, setUsdtInput] = useState('10.00');
  const [sponsorInput, setSponsorInput] = useState('');
  const [refreshingBalance, setRefreshingBalance] = useState(false);

  // Auto-fetch referral link into sponsorInput
  useEffect(() => {
    if (referrerAddress && !sponsorInput) {
      setSponsorInput(referrerAddress);
    } else if (!sponsorInput) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref') || localStorage.getItem('blove_referrer');
        if (ref && /^0x[a-fA-F0-9]{40}$/i.test(ref)) {
          setSponsorInput(ref.toLowerCase());
        }
      } catch (e) {
        // ignore
      }
    }
  }, [referrerAddress, sponsorInput]);

  const isApproved = userProfile?.approvalStatus === 'approved';
  const isLoading = txStatus === 'approval_pending' || txStatus === 'transaction_pending' || txStatus === 'connecting';

  const handleRefresh = async () => {
    setRefreshingBalance(true);
    await refreshUsdtBalance();
    setTimeout(() => setRefreshingBalance(false), 600);
  };

  const handleAction = async () => {
    if (!account) {
      await connectWallet();
      return;
    }

    if (!isCorrectNetwork) {
      await switchNetwork(BSC_MAINNET_ID);
      return;
    }

    if (isApproved) {
      return;
    }

    const success = await executeApprovalAndRegistration(sponsorInput ? sponsorInput.trim() : undefined);
    if (success && onSuccess) {
      onSuccess();
    }
  };

  return (
    <section className="py-8 relative" id="swap-section">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        {/* Card Header Tag */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDB813]/10 border border-[#FDB813]/30 text-xs font-mono text-[#FDB813] mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>REGISTRATION &amp; 100 BLOVE-KRACK ALLOCATION</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
            REGISTER &amp; REWARDS
          </h2>
          <p className="font-mono text-xs text-gray-400 tracking-widest uppercase mt-1">
            Fast • Secure • Decentralized
          </p>
        </div>

        {/* Main Swap Glass Card */}
        <div className="glass-panel-gold rounded-3xl p-6 sm:p-8 shadow-2xl border-[#FDB813]/35 relative overflow-hidden">
          
          {/* Top Bar inside Card */}
          <div className="flex items-center justify-between pb-4 border-b border-[#FDB813]/15 mb-6">
            <span className="font-display font-bold text-sm text-[#FDB813] uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
              Account Registration &amp; Bonus
            </span>
            <a
              href="https://bscscan.com/token/0x55d398326f99059ff775485246999027b3197955"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-mono transition-colors"
            >
              <LineChart className="w-3.5 h-3.5 text-[#FDB813]" />
              <span>View Chart</span>
            </a>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            
            {/* 1. TOP CARD: BLove-Krack Token (Our Token with Official Logo) */}
            <div className="p-4 rounded-2xl bg-[#08080B]/70 border border-[#FDB813]/30 shadow-[inset_0_0_15px_rgba(253,184,19,0.05)]">
              <div className="flex items-center justify-between text-xs text-[#FDB813] mb-2 font-mono font-semibold">
                <span>Your Allocation</span>
                <span className="px-2 py-0.5 rounded bg-[#10B981]/20 text-[#10B981] text-[10px]">
                  +100 BLOVE-KRACK BONUS
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#FDB813]/15 border border-[#FDB813]/40 flex items-center justify-center p-1.5 shadow-[0_0_15px_rgba(253,184,19,0.2)]">
                    <img
                      src="/blove-logo.png"
                      alt="BLove-Krack"
                      className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(253,184,19,0.6)]"
                    />
                  </div>
                  <div>
                    <span className="font-display font-bold text-white text-base">BLove-Krack</span>
                    <p className="text-[10px] text-[#FDB813] font-mono">BLove-Krack Protocol Token</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-display font-bold text-2xl gold-gradient-text">{toAmount}</span>
                  <p className="text-[10px] text-gray-400 font-mono">Tokens Credited</p>
                </div>
              </div>
            </div>

            {/* Middle Switcher Icon */}
            <div className="flex justify-center -my-2 relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#1A1A24] border border-[#FDB813]/40 flex items-center justify-center text-[#FDB813] shadow-lg">
                <ArrowDownUp className="w-4 h-4" />
              </div>
            </div>

            {/* 2. BOTTOM CARD: USDT with Interactive User Input & Logo */}
            <div className="p-4 rounded-2xl bg-[#08080B]/70 border border-white/10 hover:border-[#FDB813]/30 transition-colors">
              <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                <span className="font-medium">USDT Deposit / Amount</span>
                <div className="flex items-center gap-1.5 font-mono text-[#22D3EE]">
                  <span>Balance: {account ? `${usdtBalance} USDT` : '0.00 USDT'}</span>
                  {account && (
                    <button 
                      onClick={handleRefresh}
                      className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                      title="Refresh USDT Balance"
                    >
                      <RefreshCw className={`w-3 h-3 ${refreshingBalance ? 'animate-spin text-[#FDB813]' : ''}`} />
                    </button>
                  )}
                  {account && (
                    <button
                      type="button"
                      onClick={() => setUsdtInput(usdtBalance)}
                      className="px-1.5 py-0.5 rounded bg-[#FDB813]/10 hover:bg-[#FDB813]/20 text-[#FFE066] text-[10px] font-bold transition-colors ml-1"
                    >
                      MAX
                    </button>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#26A17B]/20 border border-[#26A17B]/40 flex items-center justify-center font-bold text-[#26A17B]">
                    <span className="font-mono text-xs font-black tracking-tighter text-[#26A17B]">USDT</span>
                  </div>
                  <div>
                    <span className="font-display font-bold text-white text-base">USDT</span>
                    <p className="text-[10px] text-gray-400 font-mono">BEP-20 Tether USD</p>
                  </div>
                </div>

                <div className="text-right flex-1 max-w-[160px]">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    value={usdtInput}
                    onChange={(e) => setUsdtInput(e.target.value)}
                    placeholder="0.00"
                    className="w-full text-right bg-transparent text-white font-display font-bold text-xl outline-none focus:text-[#FDB813] transition-colors border-b border-white/10 focus:border-[#FDB813]/50 pb-0.5"
                  />
                  <p className="text-[10px] text-gray-400 font-mono mt-0.5">Amount (Editable)</p>
                </div>
              </div>
            </div>

            {/* Optional Sponsor Referral Input if not registered (Auto-filled from ref link) */}
            {!isApproved && (
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono text-gray-400">
                    Referral / Sponsor Address (Auto-linked)
                  </label>
                  {sponsorInput && (
                    <span className="text-[10px] font-mono text-[#10B981]">
                      ✓ Sponsor Detected
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  value={sponsorInput}
                  onChange={(e) => setSponsorInput(e.target.value)}
                  placeholder="0x... (Auto-fills if you used a referral link)"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#08080B]/70 border border-white/10 text-xs font-mono text-gray-200 outline-none focus:border-[#FDB813]/50 transition-colors"
                />
              </div>
            )}

            {/* Status Feedback Message */}
            {statusMessage && (
              <div className="p-3 rounded-xl bg-[#FDB813]/10 border border-[#FDB813]/30 text-xs text-gray-200 flex items-center gap-2">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 text-[#FDB813] animate-spin flex-shrink-0" />
                ) : isApproved ? (
                  <CheckCircle className="w-4 h-4 text-[#10B981] flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-[#FDB813] flex-shrink-0" />
                )}
                <span className="leading-snug">{statusMessage}</span>
              </div>
            )}

            {/* Main Action Button */}
            <div className="pt-2">
              <button
                onClick={handleAction}
                disabled={isLoading || isApproved}
                className={`w-full py-4 rounded-xl text-sm font-display font-bold uppercase tracking-wider flex items-center justify-center gap-2 ${
                  isApproved
                    ? 'bg-[#10B981]/20 border border-[#10B981]/50 text-[#10B981] cursor-default'
                    : 'btn-gold-glow'
                }`}
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-black" />}
                
                {!account
                  ? 'Connect BSC Wallet'
                  : !isCorrectNetwork
                  ? 'Switch to BNB Smart Chain'
                  : isApproved
                  ? '✅ 100 BLove-Krack Enrolled & Distributed'
                  : 'Register & Claim 100 BLove-Krack'}
              </button>
            </div>

            {/* Trust Footnote */}
            <div className="pt-3 text-center">
              <p className="text-[11px] text-gray-400 leading-relaxed font-mono">
                🔒 100 BLove-Krack tokens are credited directly to your account with 15-level referral eligibility.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
