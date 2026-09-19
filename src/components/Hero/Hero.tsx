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
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#FDB813]/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-[#22D3EE]/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Headlines & CTA */}
          <div className="lg:col-span-7 flex flex-col items-start text-left space-y-6">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-panel border-[#FDB813]/30 text-xs font-mono text-[#FDB813] shadow-[0_0_15px_rgba(253,184,19,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-[#FDB813] animate-spin" style={{ animationDuration: '6s' }} />
              <span className="tracking-[0.15em] font-semibold uppercase">A Global Gaming & Rewards Platform</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight text-white uppercase leading-[1.08]">
                THE GAME <br />
                <span className="gold-gradient-text drop-shadow-[0_4px_25px_rgba(253,184,19,0.3)]">
                  IS ON!
                </span>
              </h1>
              <div className="flex items-center gap-3 pt-1">
                <span className="px-2 py-0.5 rounded bg-[#FDB813]/15 text-[#FDB813] font-mono text-xs font-bold tracking-widest uppercase border border-[#FDB813]/30">
                  PLAY • COMPETE • EARN
                </span>
              </div>
            </div>

            {/* Subtitle */}
            <p className="text-gray-300 text-base sm:text-lg max-w-xl font-normal leading-relaxed">
              Small Moves. Bigger Opportunities. Connect your BSC wallet, unlock 100 BLove-Krack welcome rewards, and build a passive income stream across our 15-level referral network.
            </p>

            {/* CTA Button and Security Badges */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto pt-2">
              <button
                onClick={onJoinNow}
                className="btn-gold-glow px-8 py-4 rounded-xl text-base font-display font-bold flex items-center justify-center gap-3 group"
              >
                <span>
                  {account
                    ? userProfile?.approvalStatus === 'approved'
                      ? 'Registered • View Allocation'
                      : 'Register & Claim 100 BLove-Krack'
                    : 'Register & Claim 100 BLove-Krack'}
                </span>
                <ArrowRight className="w-5 h-5 text-black group-hover:translate-x-1.5 transition-transform" />
              </button>

              {account && userProfile?.approvalStatus === 'approved' && (
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl glass-panel border-[#10B981]/40 text-[#10B981] text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Registered • 100 BLove-Krack Enrolled</span>
                </div>
              )}
            </div>

            {/* Key Metrics Stats */}
            <div className="grid grid-cols-3 gap-3 sm:gap-6 pt-6 border-t border-white/10 w-full">
              
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#FDB813]/10 border border-[#FDB813]/20 text-[#FDB813]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg sm:text-xl text-white">36K+</p>
                  <p className="font-mono text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Players</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#22D3EE]/10 border border-[#22D3EE]/20 text-[#22D3EE]">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg sm:text-xl text-white">Global</p>
                  <p className="font-mono text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Community</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981]">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-display font-bold text-lg sm:text-xl text-white">15-Tier</p>
                  <p className="font-mono text-[10px] sm:text-xs text-gray-400 uppercase tracking-wider">Rewards</p>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: 3D Robot Mascot Graphic */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Background Halo */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FDB813]/20 to-transparent rounded-3xl blur-2xl -z-10 transform rotate-3" />

            {/* Slogan Banner */}
            <div className="absolute top-2 right-4 sm:-right-4 z-20 px-4 py-2 rounded-xl bg-[#08080B]/90 border border-[#FDB813]/40 shadow-xl backdrop-blur-md transform rotate-3 animate-float">
              <span className="font-display italic font-bold text-sm sm:text-base text-[#FDB813] drop-shadow-[0_0_8px_rgba(253,184,19,0.5)]">
                Together We Grow Bigger! ⚡
              </span>
            </div>

            {/* 3D Robot Mascot Card Container */}
            <div className="relative w-full max-w-[420px] aspect-square rounded-3xl p-3 glass-panel-gold border-[#FDB813]/40 shadow-2xl overflow-hidden group">
              <img
                src="/robot-hero.png"
                alt="BLOVE KRACK 3D Mascot"
                className="w-full h-full object-contain filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)] group-hover:scale-105 transition-transform duration-500"
                onError={(e) => {
                  // If hero mascot fallback
                  (e.target as HTMLImageElement).src = '/robot-guide.jpg';
                }}
              />
              
              {/* Bottom Card Ribbon */}
              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-2xl bg-[#08080B]/85 backdrop-blur-xl border border-[#FDB813]/25 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#FDB813]/20 flex items-center justify-center">
                    <Gamepad2 className="w-4 h-4 text-[#FDB813]" />
                  </div>
                  <div>
                    <p className="font-display font-bold text-xs text-white">KRACK MASCOT</p>
                    <p className="font-mono text-[9px] text-gray-400">BSC Verified Asset</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#10B981]/20 text-[#10B981] font-mono text-[10px] font-bold">
                  ACTIVE
                </span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
