import React, { useState } from 'react';
import { ShieldCheck, PlayCircle, ArrowRight, UserPlus, LogIn, TrendingUp, Coins, Users2, Zap, BookOpen } from 'lucide-react';
import { useWeb3 } from '../../context/Web3Context';

interface FeatureCardsProps {
  onOpenGuide: () => void;
  onOpenVideo: () => void;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({ onOpenGuide, onOpenVideo }) => {
  const { connectWallet, account } = useWeb3();

  return (
    <section className="py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Guide and Video Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          
          {/* GUIDE Card */}
          <div className="glass-panel cyber-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="flex-1 space-y-3 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#2563EB] font-bold uppercase tracking-wider">
                <BookOpen className="w-4 h-4 text-[#2563EB]" />
                <span>PROTOCOL DOCUMENTATION</span>
              </div>
              <h3 className="font-display font-black text-2xl text-white uppercase tracking-wide">
                GUIDE
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Step-by-step walkthrough to get started with Fortune Protocol G, connecting your BSC wallet, and activating your referral rewards.
              </p>
              <button
                onClick={onOpenGuide}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#2563EB]/30 text-xs font-display font-bold text-white uppercase tracking-wider transition-all group-hover:border-[#2563EB] group-hover:shadow-[0_0_15px_rgba(37, 99, 235,0.2)]"
              >
                <span>View Guide</span>
                <ArrowRight className="w-4 h-4 text-[#2563EB]" />
              </button>
            </div>

            <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 relative rounded-2xl overflow-hidden border border-[#2563EB]/30 bg-[#060D19]/80 p-3 shadow-xl group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Fortune Protocol G Emblem"
                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(37,99,235,0.5)]"
              />
              <div className="absolute bottom-1 right-1 px-2 py-0.5 rounded bg-black/80 font-mono text-[9px] text-[#38BDF8] font-bold">
                GUIDE
              </div>
            </div>
          </div>

          {/* VIDEO Card */}
          <div className="glass-panel cyber-card rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden group">
            <div className="flex-1 space-y-3 text-left">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#22D3EE] font-bold uppercase tracking-wider">
                <PlayCircle className="w-4 h-4 text-[#22D3EE]" />
                <span>VIDEO TUTORIALS</span>
              </div>
              <h3 className="font-display font-black text-2xl text-white uppercase tracking-wide">
                VIDEO
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                Watch video tutorials, contract breakdown, and discover how our liquidity-driven ecosystem distributes automated rewards.
              </p>
              <button
                onClick={onOpenVideo}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#22D3EE]/30 text-xs font-display font-bold text-white uppercase tracking-wider transition-all group-hover:border-[#22D3EE] group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              >
                <span>Watch Now</span>
                <ArrowRight className="w-4 h-4 text-[#22D3EE]" />
              </button>
            </div>

            <div className="w-32 h-32 sm:w-40 sm:h-40 flex-shrink-0 relative rounded-2xl overflow-hidden border border-[#22D3EE]/30 bg-[#060D19]/80 p-3 shadow-xl group-hover:scale-105 transition-transform duration-300 flex items-center justify-center">
              <img
                src="/logo.png"
                alt="Fortune Protocol G Video"
                className="w-full h-full object-contain filter drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center shadow-lg">
                  <PlayCircle className="w-6 h-6 fill-white text-[#2563EB]" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Action Dual Banners: Login / Sign Up */}
        {!account && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
            <button
              onClick={connectWallet}
              className="py-4 px-6 rounded-2xl glass-panel hover:bg-white/10 border-[#2563EB]/25 flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-white/5 text-[#2563EB]">
                  <LogIn className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-display font-bold text-sm text-white">LOGIN VIA WALLET</p>
                  <p className="font-mono text-[10px] text-gray-400">BSC Non-Custodial Login</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 group-hover:text-[#2563EB] transition-all" />
            </button>

            <button
              onClick={connectWallet}
              className="py-4 px-6 rounded-2xl btn-primary flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-black/10 text-black">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="font-display font-black text-sm text-black">REGISTER FOR 100 fortuneprotocol.pro</p>
                  <p className="font-mono text-[10px] text-black/70">Instant Welcome Reward</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1.5 transition-transform" />
            </button>
          </div>
        )}

        {/* Platform Overview Banner & 4 Protocol Pillars */}
        <div className="glass-panel-blue rounded-3xl p-8 sm:p-10 text-center relative overflow-hidden">
          
          <div className="max-w-3xl mx-auto space-y-4 mb-10">
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white uppercase tracking-wider">
              FORTUNE <span className="blue-gradient-text">PROTOCOL G</span>
            </h3>
            <p className="font-mono text-xs text-[#38BDF8] tracking-[0.2em] uppercase font-semibold">
              SMART CONTRACT GOVERNED • DECENTRALIZED EARNING
            </p>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              A non-custodial, smart-contract-governed earning protocol on BNB Smart Chain. Automated daily Bonus, 15-level referral network, and a 10-tier rank system.
            </p>
          </div>

          {/* 4 Protocol Pillars Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            
            <div className="p-6 rounded-2xl bg-[#060D19]/80 border border-[#2563EB]/25 flex flex-col items-center text-center space-y-3 hover:border-[#2563EB]/60 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB]/15 border border-[#2563EB]/30 flex items-center justify-center text-[#38BDF8] shadow-[0_0_15px_rgba(37,99,235,0.2)] group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-base text-white uppercase tracking-wide">
                Smart Contract Governed
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                All logic executes through immutable on-chain contracts. Zero human intervention — ever.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#060D19]/80 border border-[#2563EB]/25 flex flex-col items-center text-center space-y-3 hover:border-[#2563EB]/60 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#22D3EE]/15 border border-[#22D3EE]/30 flex items-center justify-center text-[#22D3EE] shadow-[0_0_15px_rgba(34,211,238,0.2)] group-hover:scale-110 transition-transform">
                <Coins className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-base text-white uppercase tracking-wide">
                Liquidity Driven
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                USDC deposits power the pool sustaining daily rewards and ecosystem expansion.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#060D19]/80 border border-[#2563EB]/25 flex flex-col items-center text-center space-y-3 hover:border-[#2563EB]/60 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981] shadow-[0_0_15px_rgba(16,185,129,0.2)] group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-base text-white uppercase tracking-wide">
                Auto Daily Rewards
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                ~1% distributed daily, automatically. Your principal earns until you hit the 2× cap.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-[#060D19]/80 border border-[#2563EB]/25 flex flex-col items-center text-center space-y-3 hover:border-[#2563EB]/60 transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/15 border border-[#A855F7]/30 flex items-center justify-center text-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.2)] group-hover:scale-110 transition-transform">
                <Users2 className="w-6 h-6" />
              </div>
              <h4 className="font-display font-bold text-base text-white uppercase tracking-wide">
                15-Level Deep Network
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                Referral income cascades through 15 levels, with a 1.3% booster for active builders.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
};
