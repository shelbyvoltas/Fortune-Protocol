import React, { useState } from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { useNotification } from '../../context/NotificationContext';
import { Wallet, LogOut, ChevronDown, Menu, X, ShieldAlert, Sparkles, UserCheck, Share2, Copy, Check } from 'lucide-react';
import { BSC_CHAINS, BSC_MAINNET_ID } from '../../config/constants';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenProfile: () => void;
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenProfile, onOpenAdmin }) => {
  const { account, chainId, isCorrectNetwork, connectWallet, disconnectWallet, switchNetwork, userProfile } = useWeb3();
  const { showToast } = useNotification();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [walletDropdownOpen, setWalletDropdownOpen] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  const formattedAddress = account ? `${account.slice(0, 6)}...${account.slice(-4)}` : '';

  const isApproved = userProfile?.approvalStatus === 'approved';

  const handleCopyReferral = () => {
    if (!account) return;
    if (!isApproved) {
      showToast('Please complete registration first to generate and unlock your referral link.', 'warning');
      setActiveTab('referral');
      setWalletDropdownOpen(false);
      return;
    }
    const link = `${window.location.origin}/?ref=${account}`;
    navigator.clipboard.writeText(link);
    setCopiedRef(true);
    showToast('Referral link copied to clipboard!', 'success');
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'swap', label: 'Swap & Bonus' },
    { id: 'referral', label: '15-Level Referral' },
    { id: 'rewards', label: 'My Rewards' },
  ];

  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-[#08080B]/90 backdrop-blur-xl border-b border-[#FDB813]/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveTab('home')}
          >
            <div className="relative w-11 h-11 flex-shrink-0">
              <img 
                src="/blove-logo.png" 
                alt="BLOVE KRACK" 
                className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(253,184,19,0.5)] group-hover:scale-105 transition-transform"
                onError={(e) => {
                  // Fallback if image path not yet loaded
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-xl tracking-wider text-white flex items-center gap-1.5">
                BLOVE <span className="gold-gradient-text">KRACK</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#FDB813] animate-ping" />
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-[#94A3B8]">
                Play • Compete • Earn
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-lg text-xs font-display font-semibold uppercase tracking-wider transition-all duration-200 ${
                  activeTab === item.id
                    ? 'text-[#FDB813] bg-[#FDB813]/10 border border-[#FDB813]/30 shadow-[0_0_15px_rgba(253,184,19,0.15)]'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Right Action Area */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Wrong Network Warning */}
            {account && !isCorrectNetwork && (
              <button
                onClick={() => switchNetwork(BSC_MAINNET_ID)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 text-xs font-semibold hover:bg-red-500/30 transition-colors animate-pulse"
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Switch to BSC</span>
              </button>
            )}

            {/* Wallet Button */}
            {!account ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={connectWallet}
                  className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-gray-200 transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={connectWallet}
                  className="btn-gold-glow px-4 py-2 rounded-lg text-xs flex items-center gap-2"
                >
                  <Wallet className="w-4 h-4 text-black" />
                  <span>Sign Up / Connect</span>
                </button>
              </div>
            ) : (
              <div className="relative">
                <div className="flex items-center gap-2">
                  {userProfile?.approvalStatus !== 'approved' && (
                    <button
                      onClick={() => {
                        setActiveTab('swap');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="btn-gold-glow px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      Register
                    </button>
                  )}
                  <button
                    onClick={() => setWalletDropdownOpen(!walletDropdownOpen)}
                    className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl glass-panel border-[#FDB813]/30 hover:border-[#FDB813]/60 transition-all text-xs"
                  >
                    <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_#10B981]" />
                    <span className="font-mono text-gray-200 font-medium">{formattedAddress}</span>
                    {userProfile?.approvalStatus === 'approved' && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#10B981]/20 text-[#10B981] font-semibold">
                        100 BLove-Krack
                      </span>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>

                {/* Dropdown Menu */}
                {walletDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-xl glass-panel-gold p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-3 py-2 border-b border-[#FDB813]/20 mb-1">
                      <p className="text-[10px] uppercase font-mono text-gray-400">Connected Wallet</p>
                      <p className="font-mono text-xs text-[#FDB813] font-semibold truncate">{account}</p>
                    </div>

                    {/* Instant 1-tap Copy Referral */}
                    <button
                      onClick={handleCopyReferral}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-[#FFE066] bg-[#FDB813]/10 hover:bg-[#FDB813]/20 border border-[#FDB813]/30 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Share2 className="w-3.5 h-3.5 text-[#FDB813]" />
                        <span>
                          {!isApproved
                            ? 'Referral Link (Locked)'
                            : copiedRef
                            ? 'Link Copied!'
                            : 'Copy Referral Link'}
                        </span>
                      </div>
                      {!isApproved ? (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                          Locked
                        </span>
                      ) : copiedRef ? (
                        <Check className="w-3.5 h-3.5 text-[#10B981]" />
                      ) : (
                        <Copy className="w-3.5 h-3.5 text-[#FDB813]" />
                      )}
                    </button>

                    <button
                      onClick={() => {
                        onOpenProfile();
                        setWalletDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-200 hover:bg-[#FDB813]/15 hover:text-white transition-colors text-left"
                    >
                      <UserCheck className="w-4 h-4 text-[#FDB813]" />
                      <span>My Profile & Referral Link</span>
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab('referral');
                        setWalletDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-gray-200 hover:bg-[#FDB813]/15 hover:text-white transition-colors text-left"
                    >
                      <Sparkles className="w-4 h-4 text-[#FDB813]" />
                      <span>15-Level Referral Tree</span>
                    </button>

                    <div className="border-t border-[#FDB813]/20 my-1 pt-1">
                      <button
                        onClick={() => {
                          disconnectWallet();
                          setWalletDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Disconnect</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            {!account ? (
              <button
                onClick={connectWallet}
                className="btn-gold-glow px-3 py-1.5 rounded-lg text-xs"
              >
                Connect
              </button>
            ) : (
              <button
                onClick={onOpenProfile}
                className="px-2.5 py-1.5 rounded-lg glass-panel text-xs font-mono text-[#FDB813]"
              >
                {formattedAddress}
              </button>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0B0B0E]/95 backdrop-blur-2xl border-b border-[#FDB813]/20 px-4 pt-2 pb-6 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold uppercase tracking-wider ${
                activeTab === item.id
                  ? 'bg-[#FDB813]/15 text-[#FDB813] border border-[#FDB813]/30'
                  : 'text-gray-300 hover:bg-white/5'
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="pt-3 border-t border-[#FDB813]/20 flex flex-col gap-2.5">
            {account ? (
              <>
                {/* Prominent Copy Referral Link Button in Mobile Burger Drawer */}
                <button
                  onClick={handleCopyReferral}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-[#FDB813]/20 to-[#FDB813]/10 border border-[#FDB813]/40 text-xs font-semibold text-[#FFE066] hover:bg-[#FDB813]/25 transition-all shadow-[0_0_15px_rgba(253,184,19,0.15)]"
                >
                  <div className="flex items-center gap-2.5">
                    <Share2 className="w-4 h-4 text-[#FDB813]" />
                    <span>{copiedRef ? 'Referral Link Copied!' : 'Copy My Referral Link'}</span>
                  </div>
                  {copiedRef ? (
                    <Check className="w-4 h-4 text-[#10B981]" />
                  ) : (
                    <Copy className="w-4 h-4 text-[#FDB813]" />
                  )}
                </button>

                <button
                  onClick={() => {
                    onOpenProfile();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg glass-panel text-xs font-semibold text-gray-200"
                >
                  <UserCheck className="w-4 h-4 text-[#FDB813]" />
                  <span>View Profile & Referrals</span>
                </button>
                <button
                  onClick={() => {
                    disconnectWallet();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-500/10 text-red-400 text-xs font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect Wallet</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  connectWallet();
                  setMobileMenuOpen(false);
                }}
                className="btn-gold-glow w-full py-2.5 rounded-lg text-xs"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
