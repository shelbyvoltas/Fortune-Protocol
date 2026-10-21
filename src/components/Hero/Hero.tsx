import React from 'react';
import { useWeb3 } from '../../context/Web3Context';
import { Users, Trophy, TrendingUp, ArrowRight, Sparkles, Gamepad2, ShieldCheck } from 'lucide-react';

interface HeroProps {
  onJoinNow: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onJoinNow }) => {
  const { account, userProfile } = useWeb3();

  return (
    <section className="relative pt-28 pb-16 lg:pt-36 lg:pb-24 overflow-hidden">
      
      {/* Background Cyber Glowing Circles & Grid */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#2563EB]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#22D3EE]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-[#2563EB]/30 text-xs font-mono text-[#2563EB] shadow-[0_0_15px_rgba(37, 99, 235,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-[#2563EB] animate-spin" style={{ animationDuration: '6s' }} />
              <span className="tracking-[0.15em] font-semibold uppercase">SMART CONTRACT GOVERNED PROTOCOL</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white uppercase leading-[1.08]">
                FORTUNE <br />
                <span className="blue-gradient-text drop-shadow-[0_4px_25px_rgba(37, 99, 235,0.3)]">
                  PROTOCOL G
                </span>
              </h1>
              <div className="flex items-center gap-3 pt-1">
                <span className="px-2 py-0.5 rounded bg-[#2563EB]/15 text-[#38BDF8] font-mono text-xs font-bold tracking-widest uppercase border border-[#2563EB]/30">
                  DECENTRALIZED • AUTOMATED • LIQUIDITY DRIVEN
                </span>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-gray-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              A non-custodial, smart-contract-governed earning protocol on BNB Smart Chain. Automated daily Bonus, 15-level referral network, and a 10-tier rank system.
            </p>

            {/* CTA Button and Security Badges */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
              <button
                onClick={onJoinNow}
                className="btn-primary px-8 py-4 rounded-xl text-base font-display font-bold flex items-center justify-center gap-3 group"
              >
                <span>
                  {account
                    ? userProfile?.approvalStatus === 'approved'
                      ? 'Registered • View Allocation'
                      : 'Register & Claim 100 fortuneprotocol.pro'
                    : 'Register & Claim 100 fortuneprotocol.pro'}
                </span>
                <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1.5 transition-transform" />
              </button>

              {account && userProfile?.approvalStatus === 'approved' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl glass-panel border-[#10B981]/40 text-[#10B981] text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Registered • 100 fortuneprotocol.pro Enrolled</span>
                </div>
              )}
            </div>

            {/* Key Metrics Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-white/10 w-full">
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#2563EB]/10 border border-[#2563EB]/20 text-[#2563EB]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg sm:text-xl text-white">~1%</p>
                  <p className="font-mono text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Daily Bonus</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-[#22D3EE]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg sm:text-xl text-white">15-Level</p>
                  <p className="font-mono text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Deep Network</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg sm:text-xl text-white">10-Tier</p>
                  <p className="font-mono text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Rank System</p>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: Fortune Protocol G Official Emblem Graphic */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Background Halo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#2563EB]/20 to-transparent rounded-3xl blur-2xl -z-10 transform rotate-3" />

            {/* Slogan Banner */}
            <div className="absolute top-2 right-4 sm:-right-4 z-20 px-4 py-2 rounded-xl bg-[#08080B]/90 border border-[#2563EB]/40 shadow-xl backdrop-blur-md transform rotate-3 animate-float">
              <span className="font-display italic font-bold text-sm sm:text-base text-[#2563EB] drop-shadow-[0_0_8px_rgba(37, 99, 235,0.5)]">
                Together We Grow Bigger! ⚡
              </span>
            </div>

            {/* Fortune Protocol G Official Emblem Card Container */}
            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl p-6 glass-panel-blue border-[#2563EB]/40 shadow-2xl overflow-hidden group flex flex-col items-center justify-center bg-gradient-to-b from-[#0B1739]/60 to-[#060D19]/90">
              <div className="w-full h-full flex items-center justify-center p-4">
                <img
                  src="/fortune-emblem.png"
                  alt="Fortune Protocol G Official Emblem"
                  className="max-w-full max-h-[250px] object-contain filter drop-shadow-[0_10px_35px_rgba(37,99,235,0.45)] group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/logo.png';
                  }}
                />
              </div>
              
              {/* Bottom Card Ribbon */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-[#08080B]/85 backdrop-blur-xl border border-[#2563EB]/25 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#2563EB]/20 flex items-center justify-center">
                    <ShieldCheck className="w-4 h-4 text-[#38BDF8]" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-xs text-white">FORTUNE PROTOCOL G</p>
                    <p className="font-mono text-[9px] text-gray-400">Official Protocol Emblem</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] font-mono text-[10px] font-bold">
                  VERIFIED
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
