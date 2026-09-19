import React from 'react';
import { TokenCard } from '../components/TokenCard/TokenCard';
import { Sparkles, ShieldCheck, Zap } from 'lucide-react';

export const SwapPage: React.FC = () => {
  return (
    <div className="pt-28 pb-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

      {/* Intro Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FDB813]/10 border border-[#FDB813]/30 text-xs font-mono text-[#FDB813]">
          <Zap className="w-3.5 h-3.5" />
          <span>NON-CUSTODIAL BSC PROTOCOL</span>
        </div>
        <h1 className="font-display font-black text-3xl sm:text-4xl text-white uppercase tracking-wide">
          REGISTRATION &amp; 100 <span className="gold-gradient-text">BLOVE-KRACK ALLOCATION</span>
        </h1>
        <p className="text-gray-400 text-sm max-w-xl mx-auto font-mono">
          Register your address to activate your account and receive your 100 BLove-Krack welcome rewards.
        </p>
      </div>

      <TokenCard />

      {/* Security Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left">
        <div className="glass-panel rounded-2xl p-5 space-y-2 border-white/10">
          <ShieldCheck className="w-5 h-5 text-[#FDB813]" />
          <h4 className="font-display font-bold text-sm text-white">Instant Registration</h4>
          <p className="text-xs text-gray-400 leading-relaxed font-mono">
            Direct BEP-20 activation with no intermediary custody or hidden fees.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-2 border-white/10">
          <Sparkles className="w-5 h-5 text-[#22D3EE]" />
          <h4 className="font-display font-bold text-sm text-white">Instant 100 BLove-Krack Credit</h4>
          <p className="text-xs text-gray-400 leading-relaxed font-mono">
            Welcome tokens are allocated and recorded on the database upon on-chain verification.
          </p>
        </div>

        <div className="glass-panel rounded-2xl p-5 space-y-2 border-white/10">
          <Zap className="w-5 h-5 text-[#10B981]" />
          <h4 className="font-display font-bold text-sm text-white">15-Level Uplink</h4>
          <p className="text-xs text-gray-400 leading-relaxed font-mono">
            Your verification automatically unlocks your 15-tier referral link for passive earnings.
          </p>
        </div>
      </div>

    </div>
  );
};
